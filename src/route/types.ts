/**
 * The one representation every route is reduced to.
 *
 * Implements: FR-04
 *
 * Nothing downstream of the readers knows whether a route arrived as GPX or
 * as KML. `format` records where it came from for provenance (FR-10), not so
 * that anything can branch on it.
 */
import type { PointWgs84 } from '../geo/distance.ts';

/** The input formats R1 accepts. */
export type RouteFormat = 'gpx' | 'kml';

/**
 * Whether the source described a recorded track or a planned route. GPX
 * distinguishes `trk` from `rte`; KML has no equivalent, so a KML route is
 * always planned.
 */
export type RouteKind = 'track' | 'planned';

export interface RoutePoint {
  readonly pointWgs84: PointWgs84;

  /** Distance from the start along the route, in metres. Starts at 0. */
  readonly cumulativeDistanceM: number;

  /**
   * Elevation as stated by the input file, in metres.
   *
   * FR-05: a point's elevation comes from the terrain model, not from the
   * file. This field exists only so the two can be compared later, which is
   * why its name refuses to be mistaken for the elevation of the point.
   */
  readonly elevationFromFileM: number | undefined;

  /**
   * When the point was recorded, as an ISO-8601 string, or undefined for a
   * file without timestamps (FR-01 accepts both).
   *
   * Kept as the string the file carried rather than a Date: it is
   * serialisable, comparable, and carries no timezone reinterpretation, which
   * NFR-08 wants from anything that has to come out the same way twice.
   */
  readonly recordedAt: string | undefined;
}

export interface Route {
  /** Name from the file, when it carried one. */
  readonly name: string | undefined;
  readonly format: RouteFormat;
  readonly kind: RouteKind;
  readonly points: readonly RoutePoint[];
  /** Length of the whole route in metres; 0 for a single-point route. */
  readonly totalDistanceM: number;
}

/** Raised when input cannot be read, naming what was wrong with it. */
export class RouteParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouteParseError';
  }
}
