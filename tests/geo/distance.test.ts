import { describe, expect, it } from 'vitest';
import {
  cumulativeDistanceM,
  EARTH_RADIUS_M,
  haversineDistanceM,
  type PointWgs84,
} from '../../src/geo/distance.js';

/**
 * Expected values are derived analytically, not captured from this
 * implementation. On a sphere of radius R the meridian arc of one degree is
 * exactly R * pi / 180, and pole to pole is exactly R * pi. Checking the
 * haversine formula against arc length is an independent identity, so it is
 * a real test rather than a restatement of the code.
 */
const ONE_DEGREE_OF_ARC_M = (EARTH_RADIUS_M * Math.PI) / 180;
const POLE_TO_POLE_M = EARTH_RADIUS_M * Math.PI;

/** Relative comparison, which is what tolerances on distances should use. */
function expectRelativelyClose(
  actual: number,
  expected: number,
  relativeTolerance: number,
): void {
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThan(
    relativeTolerance,
  );
}

describe('haversineDistanceM', () => {
  it('pins the radius constant', () => {
    // Guards against an accidental edit of EARTH_RADIUS_M, which every other
    // expectation in this file is derived from.
    expect(ONE_DEGREE_OF_ARC_M).toBeCloseTo(111_195.08, 2);
  });

  it('is zero for a point against itself', () => {
    const p: PointWgs84 = { latDeg: 49.6, lonDeg: 19.9 };
    expect(haversineDistanceM(p, p)).toBe(0);
  });

  it('matches one degree of arc along a meridian', () => {
    const d = haversineDistanceM(
      { latDeg: 49, lonDeg: 20 },
      { latDeg: 50, lonDeg: 20 },
    );
    expectRelativelyClose(d, ONE_DEGREE_OF_ARC_M, 1e-9);
  });

  it('matches one degree of arc along the equator', () => {
    const d = haversineDistanceM(
      { latDeg: 0, lonDeg: 0 },
      { latDeg: 0, lonDeg: 1 },
    );
    expectRelativelyClose(d, ONE_DEGREE_OF_ARC_M, 1e-9);
  });

  it('handles the antipodal case without losing precision to rounding', () => {
    // The naive spherical law of cosines loses precision here; haversine
    // must not. Guarded by the Math.min(1, ...) clamp in the implementation.
    const d = haversineDistanceM(
      { latDeg: 90, lonDeg: 0 },
      { latDeg: -90, lonDeg: 0 },
    );
    expectRelativelyClose(d, POLE_TO_POLE_M, 1e-12);
  });

  it('is symmetric', () => {
    const a: PointWgs84 = { latDeg: 49.29, lonDeg: 19.95 };
    const b: PointWgs84 = { latDeg: 50.06, lonDeg: 19.94 };
    expect(haversineDistanceM(a, b)).toBe(haversineDistanceM(b, a));
  });

  it('shrinks a degree of longitude with latitude', () => {
    const atEquator = haversineDistanceM(
      { latDeg: 0, lonDeg: 0 },
      { latDeg: 0, lonDeg: 1 },
    );
    const atSixty = haversineDistanceM(
      { latDeg: 60, lonDeg: 0 },
      { latDeg: 60, lonDeg: 1 },
    );
    // cos(60 degrees) is exactly 0.5, but the great-circle path between two
    // points on a parallel cuts inside the parallel itself, so the result is
    // slightly shorter than half. Roughly 0.5 m over 55 km at this latitude.
    expectRelativelyClose(atSixty, atEquator / 2, 1e-4);
    expect(atSixty).toBeLessThan(atEquator / 2);
  });
});

describe('cumulativeDistanceM', () => {
  it('returns an empty array for no points', () => {
    expect(cumulativeDistanceM([])).toEqual([]);
  });

  it('starts at zero and has one entry per point', () => {
    const points: PointWgs84[] = [
      { latDeg: 49, lonDeg: 20 },
      { latDeg: 50, lonDeg: 20 },
      { latDeg: 51, lonDeg: 20 },
    ];
    const cumulative = cumulativeDistanceM(points);

    expect(cumulative).toHaveLength(points.length);
    expect(cumulative[0]).toBe(0);
  });

  it('is monotonically non-decreasing, including for a repeated point', () => {
    const points: PointWgs84[] = [
      { latDeg: 49.0, lonDeg: 19.9 },
      { latDeg: 49.1, lonDeg: 20.0 },
      { latDeg: 49.1, lonDeg: 20.0 },
      { latDeg: 49.05, lonDeg: 19.8 },
    ];
    const cumulative = cumulativeDistanceM(points);

    for (let i = 1; i < cumulative.length; i += 1) {
      expect(cumulative[i]).toBeGreaterThanOrEqual(cumulative[i - 1] ?? 0);
    }
  });

  it('accumulates two degrees of arc across three meridian points', () => {
    const cumulative = cumulativeDistanceM([
      { latDeg: 49, lonDeg: 20 },
      { latDeg: 50, lonDeg: 20 },
      { latDeg: 51, lonDeg: 20 },
    ]);
    expectRelativelyClose(cumulative[2] ?? 0, 2 * ONE_DEGREE_OF_ARC_M, 1e-9);
  });
});
