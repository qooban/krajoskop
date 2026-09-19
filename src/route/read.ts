/**
 * Reading routes from the supported input formats.
 *
 * Implements: FR-01, FR-02, FR-03, FR-04
 *
 * This module is the only place that knows about XML or GeoJSON. Everything
 * it returns is the internal representation from ./types.ts, so nothing
 * downstream can tell GPX from KML — which is the whole of FR-04.
 *
 * See ADR 0003 for why the parsing is delegated rather than hand-written.
 */
import { gpx, kml } from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';

import { cumulativeGroundDistanceM, type PointWgs84 } from '../geo/distance.ts';
import {
  RouteParseError,
  type Route,
  type RouteFormat,
  type RouteKind,
  type RoutePoint,
} from './types.ts';

/**
 * A GeoJSON position: longitude, latitude, and optionally elevation. Note the
 * order — GeoJSON puts longitude first, which is the reverse of how latitude
 * and longitude are spoken, and is a reliable source of transposed
 * coordinates (NFR-07).
 */
type GeoJsonPosition = [number, number, ...number[]];

/**
 * The document xmldom produces. Derived from the parser rather than named
 * directly, so it cannot drift from whatever the package calls it, and so
 * this project needs no DOM lib in tsconfig for a Node-only codebase.
 */
type XmlDocument = ReturnType<
  InstanceType<typeof DOMParser>['parseFromString']
>;

interface ConvertedFeature {
  readonly geometry?: {
    readonly type?: string;
    readonly coordinates?: unknown;
  };
  readonly properties?: Record<string, unknown> | null;
}

/**
 * The pilot region from the specification, as a bounding box: Poland, give or
 * take. Used only to recognise transposed coordinates — never to reject a
 * route for being somewhere else, since Copernicus DEM is the stated fallback
 * outside Poland.
 */
const PILOT_REGION = {
  minLonDeg: 14,
  maxLonDeg: 24.2,
  minLatDeg: 49,
  maxLatDeg: 54.9,
} as const;

function parseXml(text: string, format: RouteFormat): XmlDocument {
  if (text.trim() === '') {
    throw new RouteParseError(`The ${format.toUpperCase()} input is empty.`);
  }

  let document: unknown;
  try {
    document = new DOMParser({
      onError: (level, message) => {
        if (level === 'error' || level === 'fatalError') {
          throw new RouteParseError(
            `The ${format.toUpperCase()} is not valid XML: ${message}`,
          );
        }
      },
    }).parseFromString(text, 'text/xml');
  } catch (cause) {
    if (cause instanceof RouteParseError) throw cause;
    throw new RouteParseError(
      `The ${format.toUpperCase()} is not valid XML: ${String(cause)}`,
    );
  }

  // togeojson is typed against the browser DOM; xmldom implements the same
  // shape. ADR 0003: this cast is the single boundary, kept in one place.
  return document as XmlDocument;
}

/**
 * Every coordinate in the document, in order, from all line geometry.
 *
 * Taking only the first line loses data silently: a GPX with two `trk`
 * elements, or a track paused and resumed (which becomes a MultiLineString),
 * would return a fraction of the route and no error at all.
 */
function collectCoordinates(
  features: readonly ConvertedFeature[],
  format: RouteFormat,
): GeoJsonPosition[] {
  const coordinates: GeoJsonPosition[] = [];

  for (const feature of features) {
    const geometry = feature.geometry;
    if (!Array.isArray(geometry?.coordinates)) continue;

    if (geometry.type === 'LineString') {
      coordinates.push(...(geometry.coordinates as GeoJsonPosition[]));
    } else if (geometry.type === 'MultiLineString') {
      for (const line of geometry.coordinates as GeoJsonPosition[][]) {
        coordinates.push(...line);
      }
    }
  }

  if (coordinates.length === 0) {
    throw new RouteParseError(
      `The ${format.toUpperCase()} contains no route geometry: expected a ` +
        `line with at least one point, found ${String(features.length)} feature(s) ` +
        `of type ${features.map((f) => f.geometry?.type ?? 'unknown').join(', ') || 'none'}.`,
    );
  }

  return coordinates;
}

/**
 * Timestamps for GPX points, read from the document in point order.
 *
 * Deliberately not taken from the converter's `coordinateProperties.times`:
 * that array holds only the points that *had* a time, so a single untimed
 * point — which real devices produce on the first fix and while paused —
 * shifts every later timestamp onto the wrong coordinate, silently. Reading
 * the elements themselves keeps position and time together by construction.
 *
 * Implements: FR-01
 */
function gpxTimesInPointOrder(document: XmlDocument): (string | undefined)[] {
  const times: (string | undefined)[] = [];

  for (const tagName of ['trkpt', 'rtept']) {
    const elements = document.getElementsByTagName(tagName);
    for (let index = 0; index < elements.length; index += 1) {
      const element = elements[index];
      // Mirror the converter's own validity rule, so the two stay in step.
      const lat = Number(element?.getAttribute('lat'));
      const lon = Number(element?.getAttribute('lon'));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const time = element
        ?.getElementsByTagName('time')[0]
        ?.textContent?.trim();
      times.push(time === undefined || time === '' ? undefined : time);
    }
  }

  return times;
}

/**
 * Whether a KML document's elevations mean anything.
 *
 * KML's third coordinate is an elevation only under `altitudeMode` of
 * `absolute`. The default is `clampToGround`, where the value is defined to
 * be ignored and the geometry lies on the terrain — Google My Maps emits
 * exactly that. Storing such a number as an elevation would hand FR-05 a
 * filler to compare the terrain model against.
 */
function kmlElevationsAreAbsolute(document: XmlDocument): boolean {
  const modes: string[] = [];
  for (const tagName of ['altitudeMode', 'gx:altitudeMode']) {
    const elements = document.getElementsByTagName(tagName);
    for (let index = 0; index < elements.length; index += 1) {
      const mode = elements[index]?.textContent?.trim();
      if (mode !== undefined && mode !== '') modes.push(mode);
    }
  }

  return modes.length > 0 && modes.every((mode) => mode === 'absolute');
}

function isInPilotRegion(point: PointWgs84): boolean {
  return (
    point.lonDeg >= PILOT_REGION.minLonDeg &&
    point.lonDeg <= PILOT_REGION.maxLonDeg &&
    point.latDeg >= PILOT_REGION.minLatDeg &&
    point.latDeg <= PILOT_REGION.maxLatDeg
  );
}

/**
 * Recognises latitude and longitude that have been swapped.
 *
 * A range check cannot do this. In Poland latitude is 49–55 and longitude
 * 14–25, so a swapped file has both values inside their valid ranges and
 * passes every bound. What gives it away is that the route is nowhere near
 * the pilot region as read, and squarely inside it when swapped.
 *
 * Deliberately not a geofence: a genuine route elsewhere is not inside Poland
 * either way round, so it is untouched.
 */
function looksTransposed(points: readonly PointWgs84[]): boolean {
  return (
    points.every((point) => !isInPilotRegion(point)) &&
    points.every((point) =>
      isInPilotRegion({ latDeg: point.lonDeg, lonDeg: point.latDeg }),
    )
  );
}

function toPositions(coordinates: readonly GeoJsonPosition[]): PointWgs84[] {
  const positions = coordinates.map((coordinate, index) => {
    const [lonDeg, latDeg] = coordinate;
    if (!Number.isFinite(lonDeg) || !Number.isFinite(latDeg)) {
      throw new RouteParseError(
        `Point ${String(index)} has a non-numeric coordinate.`,
      );
    }
    if (latDeg < -90 || latDeg > 90) {
      throw new RouteParseError(
        `Point ${String(index)} has latitude ${String(latDeg)}, outside -90..90. ` +
          'Longitude and latitude may be transposed.',
      );
    }
    if (lonDeg < -180 || lonDeg > 180) {
      throw new RouteParseError(
        `Point ${String(index)} has longitude ${String(lonDeg)}, outside -180..180.`,
      );
    }
    return { latDeg, lonDeg };
  });

  if (looksTransposed(positions)) {
    const first = positions[0];
    throw new RouteParseError(
      'Latitude and longitude look transposed: the route lies outside the ' +
        'pilot region as read, and inside it when swapped. First point reads ' +
        `${String(first?.latDeg)}N ${String(first?.lonDeg)}E, which swapped is ` +
        `${String(first?.lonDeg)}N ${String(first?.latDeg)}E.`,
    );
  }

  return positions;
}

function buildRoute(
  coordinates: readonly GeoJsonPosition[],
  times: readonly (string | undefined)[] | undefined,
  name: string | undefined,
  format: RouteFormat,
  kind: RouteKind,
  elevationsAreMeaningful: boolean,
): Route {
  const positions = toPositions(coordinates);
  const cumulative = cumulativeGroundDistanceM(positions);

  // A time list that is not exactly as long as the route cannot be aligned
  // with it, and guessing would produce plausible wrong times.
  const aligned = times !== undefined && times.length === positions.length;

  const points: RoutePoint[] = positions.map((pointWgs84, index) => {
    const elevation = coordinates[index]?.[2];
    return {
      pointWgs84,
      cumulativeGroundDistanceM: cumulative[index] ?? 0,
      elevationFromFileM:
        elevationsAreMeaningful && typeof elevation === 'number'
          ? elevation
          : undefined,
      recordedAt: aligned ? times[index] : undefined,
    };
  });

  return {
    name,
    format,
    kind,
    points,
    totalGroundDistanceM:
      points[points.length - 1]?.cumulativeGroundDistanceM ?? 0,
  };
}

function featureName(
  features: readonly ConvertedFeature[],
): string | undefined {
  for (const feature of features) {
    const name = feature.properties?.['name'];
    if (typeof name === 'string' && name !== '') return name;
  }
  return undefined;
}

/**
 * Reads a GPX file, whether it carries a recorded track or a planned route,
 * and whether or not its points have timestamps.
 *
 * Implements: FR-01, FR-02
 */
export function readGpx(text: string): Route {
  const document = parseXml(text, 'gpx');
  const converted = gpx(document) as unknown as {
    features: ConvertedFeature[];
  };
  const coordinates = collectCoordinates(converted.features, 'gpx');

  // togeojson marks which GPX element a feature came from.
  const kind = converted.features.some(
    (f) => f.properties?.['_gpxType'] === 'trk',
  )
    ? 'track'
    : 'planned';

  return buildRoute(
    coordinates,
    gpxTimesInPointOrder(document),
    featureName(converted.features),
    'gpx',
    kind,
    // GPX elevation is metres above the WGS84 ellipsoid or the geoid depending
    // on the device, but it is always meant as an elevation.
    true,
  );
}

/**
 * Reads a KML file, the supported path for a Google Maps route: exported by
 * the user through My Maps. R-01 rules out the Directions API, so this is the
 * only way a Google-planned drive gets in.
 *
 * Implements: FR-03
 */
export function readKml(text: string): Route {
  const document = parseXml(text, 'kml');
  const converted = kml(document) as unknown as {
    features: ConvertedFeature[];
  };
  const coordinates = collectCoordinates(converted.features, 'kml');

  return buildRoute(
    coordinates,
    // Plain KML LineStrings carry no per-point time; gx:Track does, and is
    // out of scope until a real export is seen to use it.
    undefined,
    featureName(converted.features),
    'kml',
    'planned',
    kmlElevationsAreAbsolute(document),
  );
}

/** Reads a route in whichever supported format it arrived in. */
export function readRoute(text: string, format: RouteFormat): Route {
  return format === 'gpx' ? readGpx(text) : readKml(text);
}
