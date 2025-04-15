import * as Cesium from 'cesium'
import { Gcj02ToWgs84, Wgs84ToGcj02 } from './gisTools'

/**
 * 高德坐标系瓦片方案(纠偏)
 */
class AmapMercatorTilingScheme extends Cesium.WebMercatorTilingScheme {
  constructor(options) {
    super(options)
    let projection = new Cesium.WebMercatorProjection()
    this._projection.project = function (cartographic, result) {
      // 坐标转换
      result = Wgs84ToGcj02([
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
      ])

      result = projection.project(
        new Cesium.Cartographic(Cesium.Math.toRadians(result[0]), Cesium.Math.toRadians(result[1])),
      )
      return new Cesium.Cartesian2(result.x, result.y)
    }
    this._projection.unproject = function (cartesian, result) {
      let cartographic = projection.unproject(cartesian)

      // 坐标转换
      result = Gcj02ToWgs84([
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
      ])

      return new Cesium.Cartographic(
        Cesium.Math.toRadians(result[0]),
        Cesium.Math.toRadians(result[1]),
      )
    }
  }
}

export default AmapMercatorTilingScheme
