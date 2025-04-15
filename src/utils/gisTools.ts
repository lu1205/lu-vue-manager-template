import gcoord, { type Position } from 'gcoord'

/**
 * wgs84转gcj02
 * @param position [lng,lat]
 * @returns [lng,lat]
 */
export function Wgs84ToGcj02(position: Position): Position {
  return gcoord.transform(position, gcoord.WGS84, gcoord.GCJ02)
}

/**
 * gcj02转wgs84
 * @param position [lng,lat]
 * @returns [lng,lat]
 */
export function Gcj02ToWgs84(position: Position): Position {
  return gcoord.transform(position, gcoord.GCJ02, gcoord.WGS84)
}
