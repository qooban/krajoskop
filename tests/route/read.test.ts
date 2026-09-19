/**
 * Covers: FR-01, FR-02, FR-03, FR-04
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { readGpx, readKml, readRoute } from '../../src/route/read.ts';
import { RouteParseError } from '../../src/route/types.ts';

const SAMPLES = join(import.meta.dirname, '..', '..', 'data', 'sample');
const sample = (name: string): string =>
  readFileSync(join(SAMPLES, name), 'utf8');

const TRACK = sample('polica-track.gpx');
const PLANNED = sample('polica-planned.gpx');
const DRIVE = sample('beskid-niski-drive.kml');
const DRIVE_ABSOLUTE = sample('beskid-niski-absolute.kml');
const PAUSED = sample('polica-paused.gpx');

describe('readGpx', () => {
  it('reads a recorded track with timestamps', () => {
    const route = readGpx(TRACK);

    expect(route.format).toBe('gpx');
    expect(route.kind).toBe('track');
    expect(route.name).toBe('Polica od Zawoi');
    expect(route.points).toHaveLength(6);
    expect(route.points[0]?.recordedAt).toBe('2026-09-19T05:12:00Z');
    expect(route.points[5]?.recordedAt).toBe('2026-09-19T06:57:05Z');
  });

  it('reads a planned route without timestamps', () => {
    // FR-01 accepts both; the absence of time is not an error.
    const route = readGpx(PLANNED);

    expect(route.kind).toBe('planned');
    expect(route.points).toHaveLength(3);
    for (const point of route.points) {
      expect(point.recordedAt).toBeUndefined();
    }
  });

  it('keeps file elevation under a name that says it came from the file', () => {
    // FR-05: elevation for a point comes from the terrain model later. What
    // the file said is kept only so the two can be compared.
    const route = readGpx(TRACK);

    expect(route.points[0]?.elevationFromFileM).toBe(735.2);
    expect(route.points[5]?.elevationFromFileM).toBe(1310.4);
    expect(route.points[0]).not.toHaveProperty('elevationM');
  });

  it('does not transpose latitude and longitude', () => {
    // GeoJSON is longitude-first, GPX attributes are latitude-first. Getting
    // this backwards puts Polica in the Indian Ocean and still "works".
    const first = readGpx(TRACK).points[0]?.pointWgs84;

    expect(first?.latDeg).toBeCloseTo(49.6055, 4);
    expect(first?.lonDeg).toBeCloseTo(19.6118, 4);
  });

  it('computes cumulative distance from zero, monotonically', () => {
    const route = readGpx(TRACK);
    const distances = route.points.map((p) => p.cumulativeGroundDistanceM);

    expect(distances[0]).toBe(0);
    for (let i = 1; i < distances.length; i += 1) {
      expect(distances[i]).toBeGreaterThan(distances[i - 1] ?? 0);
    }
    expect(route.totalGroundDistanceM).toBe(distances[distances.length - 1]);
  });

  it('puts the total distance in a plausible range for this ascent', () => {
    // Roughly 2.5 km of horizontal distance over the six points. A wrong
    // earth radius, a degrees/radians slip or transposed coordinates all land
    // far outside this band, which is the point of asserting it.
    const route = readGpx(TRACK);

    expect(route.totalGroundDistanceM).toBeGreaterThan(2_000);
    expect(route.totalGroundDistanceM).toBeLessThan(3_500);
  });
});

describe('readKml', () => {
  it('reads a My Maps style drive', () => {
    const route = readKml(DRIVE);

    expect(route.format).toBe('kml');
    expect(route.kind).toBe('planned');
    expect(route.points).toHaveLength(4);
    expect(route.points[0]?.pointWgs84.latDeg).toBeCloseTo(49.5312, 4);
    // Elevation is deliberately absent here; see the altitudeMode suite.
    expect(route.points[0]?.elevationFromFileM).toBeUndefined();
  });
});

describe('one representation, whatever the source (FR-04)', () => {
  it('produces the same shape of point from GPX and from KML', () => {
    const fromGpx = readGpx(TRACK).points[0];
    const fromKml = readKml(DRIVE).points[0];

    expect(Object.keys(fromGpx ?? {}).sort()).toEqual(
      Object.keys(fromKml ?? {}).sort(),
    );
  });

  it('dispatches on the declared format', () => {
    expect(readRoute(TRACK, 'gpx').format).toBe('gpx');
    expect(readRoute(DRIVE, 'kml').format).toBe('kml');
  });
});

describe('determinism (NFR-08)', () => {
  it('gives an identical result for the same input', () => {
    expect(JSON.stringify(readGpx(TRACK))).toBe(JSON.stringify(readGpx(TRACK)));
    expect(JSON.stringify(readKml(DRIVE))).toBe(JSON.stringify(readKml(DRIVE)));
  });
});

describe('malformed input', () => {
  it('rejects empty input rather than returning an empty route', () => {
    expect(() => readGpx('')).toThrow(RouteParseError);
    expect(() => readGpx('   ')).toThrow(/empty/i);
  });

  it('rejects a file with no route geometry, saying what it found', () => {
    const noGeometry = `<?xml version="1.0"?>
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <wpt lat="49.6" lon="19.6"><name>Just a waypoint</name></wpt>
      </gpx>`;

    expect(() => readGpx(noGeometry)).toThrow(/no route geometry/i);
  });

  it('rejects an out-of-range latitude and suggests why', () => {
    const transposed = `<?xml version="1.0"?>
      <kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><LineString>
        <coordinates>49.6,219.6,100 49.7,219.7,110</coordinates>
      </LineString></Placemark></Document></kml>`;

    expect(() => readKml(transposed)).toThrow(/transposed|outside/i);
  });
});

/**
 * Everything below was found by the geo-reviewer subagent against the first
 * version of this reader. Each case passed the original test suite while
 * producing a wrong number, which is the failure mode this project is built
 * around.
 */
describe('defects found in review', () => {
  it('keeps a timestamp with its own point when an earlier one has none', () => {
    // The converter exposes only the times that exist, as a "parallel" array
    // that is one short. Trusting it stamped every point with its
    // predecessor's time and dropped the last one entirely.
    const route = readGpx(PAUSED);

    expect(route.points.map((p) => p.recordedAt)).toEqual([
      undefined,
      '2026-09-19T05:26:30Z',
      '2026-09-19T06:08:45Z',
      '2026-09-19T06:33:20Z',
    ]);
  });

  it('reads every segment of a paused recording', () => {
    // Two trksegs become a MultiLineString. Taking the first line returned
    // half the route and no error.
    const route = readGpx(PAUSED);

    expect(route.points).toHaveLength(4);
    expect(route.points[3]?.pointWgs84.latDeg).toBeCloseTo(49.6216, 4);
  });

  it('reads every track of a multi-track file', () => {
    const twoTracks = `<?xml version="1.0"?>
      <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <trk><name>A</name><trkseg>
          <trkpt lat="49.6055" lon="19.6118"/><trkpt lat="49.6092" lon="19.6164"/>
        </trkseg></trk>
        <trk><name>B</name><trkseg>
          <trkpt lat="49.6131" lon="19.6208"/><trkpt lat="49.6178" lon="19.6255"/>
        </trkseg></trk>
      </gpx>`;

    expect(readGpx(twoTracks).points).toHaveLength(4);
  });

  it('catches a transposition that stays inside both valid ranges', () => {
    // The original guard only checked -90..90. In Poland latitude is 49-55
    // and longitude 14-25, so a swapped file passed every bound and came out
    // 18% too long, 30 degrees of latitude from where it belongs.
    const swapped = `<?xml version="1.0"?>
      <kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><LineString>
        <coordinates>49.6055,19.6118,735 49.6131,19.6208,908 49.6216,19.6297,1186</coordinates>
      </LineString></Placemark></Document></kml>`;

    expect(() => readKml(swapped)).toThrow(/transposed/i);
  });

  it('leaves a genuine route outside Poland alone', () => {
    // The check must recognise transposition, not act as a geofence: the
    // specification names Copernicus DEM as the fallback outside Poland.
    const alps = `<?xml version="1.0"?>
      <kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><LineString>
        <coordinates>7.6586,45.9763,1620 7.6702,45.9801,1685</coordinates>
      </LineString></Placemark></Document></kml>`;

    expect(readKml(alps).points).toHaveLength(2);
  });

  it('ignores a KML altitude that the format says is not one', () => {
    // clampToGround, the default and what My Maps emits, defines the third
    // coordinate as ignored. Storing it hands FR-05 a filler to compare the
    // terrain model against.
    expect(readKml(DRIVE).points[0]?.elevationFromFileM).toBeUndefined();
  });

  it('keeps a KML altitude that is declared absolute', () => {
    expect(readKml(DRIVE_ABSOLUTE).points[0]?.elevationFromFileM).toBe(412);
    expect(readKml(DRIVE_ABSOLUTE).points[3]?.elevationFromFileM).toBe(501);
  });
});
