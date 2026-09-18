/**
 * Great-circle distance on a sphere.
 *
 * Source: the haversine formula, with the IUGG mean Earth radius
 * R = 6_371_008.8 m. On a sphere the error against the WGS84 ellipsoid is
 * up to roughly 0.5%, which is acceptable for ordering and filtering but not
 * for the elevation profile.
 *
 * Profile work (R2) reprojects to PL-1992 (EPSG:2180) through GDAL and
 * measures in projected metres instead. See ADR 0002 and R-11: coordinate
 * transformation never happens in process.
 */

/** IUGG mean Earth radius, metres. */
export const EARTH_RADIUS_M = 6_371_008.8;

/** A position in WGS84. Degrees, as they come out of a GPX file. */
export interface PointWgs84 {
  readonly latDeg: number;
  readonly lonDeg: number;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two WGS84 positions, in metres.
 *
 * Implements: FR-01
 */
export function haversineDistanceM(a: PointWgs84, b: PointWgs84): number {
  const lat1 = toRadians(a.latDeg);
  const lat2 = toRadians(b.latDeg);
  const dLat = lat2 - lat1;
  const dLon = toRadians(b.lonDeg - a.lonDeg);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Cumulative distance along a sequence of positions, in metres. The first
 * entry is always 0, so the result has the same length as the input.
 *
 * Implements: FR-01
 */
export function cumulativeDistanceM(points: readonly PointWgs84[]): number[] {
  const cumulative: number[] = [];
  let total = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const previous = points[i - 1];
    if (current === undefined) continue;
    if (previous !== undefined) {
      total += haversineDistanceM(previous, current);
    }
    cumulative.push(total);
  }

  return cumulative;
}
