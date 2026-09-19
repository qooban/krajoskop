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
    const distances = route.points.map((p) => p.cumulativeDistanceM);

    expect(distances[0]).toBe(0);
    for (let i = 1; i < distances.length; i += 1) {
      expect(distances[i]).toBeGreaterThan(distances[i - 1] ?? 0);
    }
    expect(route.totalDistanceM).toBe(distances[distances.length - 1]);
  });

  it('puts the total distance in a plausible range for this ascent', () => {
    // Roughly 2.5 km of horizontal distance over the six points. A wrong
    // earth radius, a degrees/radians slip or transposed coordinates all land
    // far outside this band, which is the point of asserting it.
    const route = readGpx(TRACK);

    expect(route.totalDistanceM).toBeGreaterThan(2_000);
    expect(route.totalDistanceM).toBeLessThan(3_500);
  });
});

describe('readKml', () => {
  it('reads a My Maps style drive', () => {
    const route = readKml(DRIVE);

    expect(route.format).toBe('kml');
    expect(route.kind).toBe('planned');
    expect(route.points).toHaveLength(4);
    expect(route.points[0]?.pointWgs84.latDeg).toBeCloseTo(49.5312, 4);
    expect(route.points[0]?.elevationFromFileM).toBe(412);
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
