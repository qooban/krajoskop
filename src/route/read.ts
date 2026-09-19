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

import { cumulativeDistanceM, type PointWgs84 } from '../geo/distance.ts';
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

function firstLineString(
  features: readonly ConvertedFeature[],
  format: RouteFormat,
): ConvertedFeature {
  const usable = features.find(
    (feature) =>
      feature.geometry?.type === 'LineString' &&
      Array.isArray(feature.geometry.coordinates) &&
      feature.geometry.coordinates.length > 0,
  );

  if (usable === undefined) {
    throw new RouteParseError(
      `The ${format.toUpperCase()} contains no route geometry: expected a ` +
        `line with at least one point, found ${String(features.length)} feature(s) ` +
        `of type ${features.map((f) => f.geometry?.type ?? 'unknown').join(', ') || 'none'}.`,
    );
  }

  return usable;
}

function toRoutePoints(
  coordinates: readonly GeoJsonPosition[],
  times: readonly string[] | undefined,
): RoutePoint[] {
  const positions: PointWgs84[] = coordinates.map((coordinate, index) => {
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

  const cumulative = cumulativeDistanceM(positions);

  return positions.map((pointWgs84, index) => {
    const elevation = coordinates[index]?.[2];
    return {
      pointWgs84,
      cumulativeDistanceM: cumulative[index] ?? 0,
      elevationFromFileM: typeof elevation === 'number' ? elevation : undefined,
      recordedAt: times?.[index],
    };
  });
}

function buildRoute(
  feature: ConvertedFeature,
  format: RouteFormat,
  kind: RouteKind,
): Route {
  const coordinates = feature.geometry?.coordinates as GeoJsonPosition[];
  const properties = feature.properties ?? {};

  // GPX timestamps live here, not under the coordTimes of togeojson's earlier
  // major version. ADR 0003.
  const coordinateProperties = properties['coordinateProperties'];
  const times =
    typeof coordinateProperties === 'object' && coordinateProperties !== null
      ? (coordinateProperties as { times?: unknown }).times
      : undefined;

  const points = toRoutePoints(
    coordinates,
    Array.isArray(times) ? (times as string[]) : undefined,
  );

  const name = properties['name'];

  return {
    name: typeof name === 'string' && name !== '' ? name : undefined,
    format,
    kind,
    points,
    totalDistanceM: points[points.length - 1]?.cumulativeDistanceM ?? 0,
  };
}

/**
 * Reads a GPX file, whether it carries a recorded track or a planned route,
 * and whether or not its points have timestamps.
 *
 * Implements: FR-01, FR-02
 */
export function readGpx(text: string): Route {
  const converted = gpx(parseXml(text, 'gpx')) as unknown as {
    features: ConvertedFeature[];
  };
  const feature = firstLineString(converted.features, 'gpx');
  // togeojson marks which GPX element a feature came from.
  const kind = feature.properties?.['_gpxType'] === 'rte' ? 'planned' : 'track';
  return buildRoute(feature, 'gpx', kind);
}

/**
 * Reads a KML file, the supported path for a Google Maps route: exported by
 * the user through My Maps. R-01 rules out the Directions API, so this is the
 * only way a Google-planned drive gets in.
 *
 * Implements: FR-03
 */
export function readKml(text: string): Route {
  const converted = kml(parseXml(text, 'kml')) as unknown as {
    features: ConvertedFeature[];
  };
  const feature = firstLineString(converted.features, 'kml');
  return buildRoute(feature, 'kml', 'planned');
}

/** Reads a route in whichever supported format it arrived in. */
export function readRoute(text: string, format: RouteFormat): Route {
  return format === 'gpx' ? readGpx(text) : readKml(text);
}
