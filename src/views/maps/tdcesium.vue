<script setup lang="ts">
import * as Cesium from 'cesium'
import { onMounted, reactive } from 'vue'
import { Wgs84ToGcj02, Gcj02ToWgs84 } from '@/utils/gisTools.ts'

const TD_TK = import.meta.env.VITE_TD_TOKEN

let viewer: null | any = null

/*const imageryLayersOption: any = {
  VEC_C: 'http://t0.tianditu.gov.cn/vec_c/wmts?tk=', // 矢量地图(经纬度投影)
  VEC_W: 'http://t0.tianditu.gov.cn/vec_w/wmts?tk=', // 矢量地图(球面墨卡托投影)
  CVA_C: 'http://t0.tianditu.gov.cn/cva_c/wmts?tk=', // 矢量注记(经纬度投影)
  CVA_W: 'http://t0.tianditu.gov.cn/cva_w/wmts?tk=', // 矢量注记(球面墨卡托投影)

  IMG_C: 'http://t0.tianditu.gov.cn/img_c/wmts?tk=', // 影像底图(经纬度投影)
  IMG_W: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=', // 影像底图(球面墨卡托投影)
  CIA_C: 'http://t0.tianditu.gov.cn/cia_c/wmts?tk=', // 影像注记(经纬度投影)
  CIA_W: 'http://t0.tianditu.gov.cn/cia_w/wmts?tk=', // 影像注记(球面墨卡托投影)

  TER_C: 'http://t0.tianditu.gov.cn/ter_c/wmts?tk=', // 地形晕渲(经纬度投影)
  TER_W: 'http://t0.tianditu.gov.cn/ter_w/wmts?tk=', // 地形晕渲(球面墨卡托投影)
  CTA_C: 'http://t0.tianditu.gov.cn/cta_c/wmts?tk=', // 地形注记(经纬度投影)
  CTA_W: 'http://t0.tianditu.gov.cn/cta_w/wmts?tk=', // 地形注记(球面墨卡托投影)

  IBO_C: 'http://t0.tianditu.gov.cn/ibo_c/wmts?tk=', // 全球境界(经纬度投影)
  IBO_W: 'http://t0.tianditu.gov.cn/ibo_w/wmts?tk=', // 全球境界(球面墨卡托投影)

  GETTILES: 'https://[ t0-t7 ].tianditu.gov.cn/mapservice/GetTiles?tk=', // 三维地名
  SWDX: 'https://[ t0-t7 ].tianditu.gov.cn/mapservice/swdx?tk=' // 三维地形
}

const getImageryLayersUrl = (layerName: string): string => {
  return imageryLayersOption[layerName] + TD_TK
}*/

// 控件选项
const viewerOption = reactive({
  animation: false, // Animation小部件,左下角的球
  baseLayerPicker: false, // 选择底图的控件
  fullscreenButton: false, // 全屏按钮
  homeButton: false, // 主页按钮
  infoBox: false, // 信息框
  selectionIndicator: false, // 选择指示器
  timeline: false, // 时间轴
  sceneModePicker: false, // 3D/2D切换控件
  navigationHelpButton: false, // 帮助按钮
  geocoder: true // 地名查询控件
})

// 初始化Cesium
const initCesium = async () => {
  viewer = new Cesium.Viewer('cesium-container', {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    animation: viewerOption.animation, // Animation小部件,左下角的球
    baseLayerPicker: viewerOption.baseLayerPicker, // 选择底图的控件
    fullscreenButton: viewerOption.fullscreenButton, // 全屏按钮
    homeButton: viewerOption.homeButton, // 主页按钮
    infoBox: viewerOption.infoBox, // 信息框
    selectionIndicator: viewerOption.selectionIndicator, // 选择指示器
    timeline: viewerOption.timeline, // 时间轴
    sceneModePicker: viewerOption.sceneModePicker, // 3D/2D切换控件
    navigationHelpButton: viewerOption.navigationHelpButton, // 帮助按钮
    geocoder: viewerOption.geocoder, // 地名查询控件
    contextOptions: {
      webgl: {
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      }
    }
  })

  const subdomains = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']

  // 添加地形
  const terMap = new Cesium.WebMapTileServiceImageryProvider({
    url: `https://{s}.tianditu.gov.cn/ter_w/wmts?tk=${TD_TK}`,
    layer: 'ter',
    style: 'default',
    tileMatrixSetID: 'w',
    subdomains,  // 负载均衡
    maximumLevel: 18
  })
  viewer.imageryLayers.addImageryProvider(terMap)

  // 地图瓦片
  // const tileMap = new Cesium.UrlTemplateImageryProvider({
  //   url: `https://{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TD_TK}`, // 影像地图(卫星地图)
  //   tilingScheme: new Cesium.WebMercatorTilingScheme(),
  //   subdomains,
  //   maximumLevel : 18
  // })
  const tileMap = new Cesium.WebMapTileServiceImageryProvider({
    url: `https://{s}.tianditu.gov.cn/img_w/wmts?tk=${TD_TK}`,
    layer: 'img',
    style: 'default',
    tileMatrixSetID: 'w',
    subdomains,  // 负载均衡
    maximumLevel: 18
  })
  viewer.imageryLayers.addImageryProvider(tileMap)

  // 添加国界
  const iboMap = new Cesium.UrlTemplateImageryProvider({
    url: `https://{s}.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TD_TK}`, // 影像地图(卫星地图)
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    subdomains,
    maximumLevel: 18
  })
  // const iboMap = new Cesium.WebMapTileServiceImageryProvider({
  //   url: `https://{s}.tianditu.gov.cn/ibo_w/wmts?tk=${TD_TK}`,
  //   layer: "img",
  //   style: "default",
  //   tileMatrixSetID: 'w',
  //   subdomains,  // 负载均衡
  //   maximumLevel : 18
  // })
  viewer.imageryLayers.addImageryProvider(iboMap)

  // 地图注记
  // const annotation = new Cesium.UrlTemplateImageryProvider({
  //   url: `https://{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TD_TK}`, // 影像地图(卫星地图)
  //   tilingScheme: new Cesium.WebMercatorTilingScheme(),
  //   subdomains,
  //   maximumLevel : 18
  // })
  const annotation = new Cesium.WebMapTileServiceImageryProvider({
    url: `https://{s}.tianditu.gov.cn/cia_w/wmts?tk=${TD_TK}`,
    layer: 'cia',
    style: 'default',
    tileMatrixSetID: 'w',
    subdomains,  // 负载均衡
    maximumLevel: 18
  })
  viewer.imageryLayers.addImageryProvider(annotation)

  viewer._cesiumWidget.creditContainer.style.display = 'none' // 隐藏版权信息
  // 设置地球的背景颜色
  viewer.scene.globe.depthTestAgainstTerrain = true
  // 创建事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((movement: any) => {
    let cartesian = viewer.scene.pickPosition(movement.position)
    if (Cesium.defined(cartesian)) {
      // 将笛卡尔积转换为经纬度
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      // 将经纬度转换为度数
      let longitude = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6))
      let latitude = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6))
      let height = cartographic.height.toFixed(2)
      console.log('点击坐标点(WGS84)', longitude, latitude, height)

      const [gcjLongitude, gcjLatitude] = Wgs84ToGcj02([longitude, latitude])
      console.log('点击坐标点(GCJ02)', gcjLongitude, gcjLatitude, height)
      // 高度
    } else {
      console.log('没有点击到地球')
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // 立即跳转
  const [wgs84Longitude, wgs84Latitude] = Gcj02ToWgs84([
    cameraOption.longitude,
    cameraOption.latitude
  ])
  // console.log(
  //   'Gcj02ToWgs84',
  //   [cameraOption.longitude, cameraOption.latitude],
  //   [wgs84Longitude, wgs84Latitude],
  // )

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(wgs84Longitude, wgs84Latitude, cameraOption.height), // 经度, 纬度, 高度（可选）
    orientation: {
      heading: Cesium.Math.toRadians(cameraOption.heading), // 朝向（可选）
      pitch: Cesium.Math.toRadians(cameraOption.pitch), // 俯仰角（可选）
      roll: Cesium.Math.toRadians(cameraOption.roll) // 翻滚角（可选）
    }
  })
}

// 相机选项
const cameraOption = reactive({
  longitude: 117.174406, // 经度(gcj02)
  latitude: 31.830039, // 纬度(gcj02)
  height: 200, // 高度

  heading: 10, // 航向
  pitch: -15, // 俯仰角
  roll: 0 // 翻滚角
})

// 相机选项值改变处理事件
const change = () => {
  const [wgs84Longitude, wgs84Latitude] = Gcj02ToWgs84([
    cameraOption.longitude,
    cameraOption.latitude
  ])

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(wgs84Longitude, wgs84Latitude, cameraOption.height), // 经度, 纬度, 高度（可选）
    orientation: {
      heading: Cesium.Math.toRadians(cameraOption.heading), // 朝向（可选）
      pitch: Cesium.Math.toRadians(cameraOption.pitch), // 俯仰角（可选）
      roll: Cesium.Math.toRadians(cameraOption.roll) // 翻滚角（可选）
    }
  })
}

onMounted(() => {
  initCesium()
})
</script>

<template>
  <div class="cesium-container" id="cesium-container">
    <div class="tool-box">
      <div class="tool-item">
        <div class="tool-item-label">经度(gcj02)</div>
        <el-input-number
          style="flex: 1"
          :step="0.01"
          v-model="cameraOption.longitude"
          @change="change"
        />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">纬度(gcj02)</div>
        <el-input-number
          style="flex: 1"
          :step="0.01"
          v-model="cameraOption.latitude"
          @change="change"
        />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">高度</div>
        <el-input-number
          style="flex: 1"
          :step="100"
          v-model="cameraOption.height"
          @change="change"
        />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">航向</div>
        <el-input-number style="flex: 1" v-model="cameraOption.heading" @change="change" />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">俯仰角</div>
        <el-input-number style="flex: 1" v-model="cameraOption.pitch" @change="change" />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">翻滚角</div>
        <el-input-number style="flex: 1" v-model="cameraOption.roll" @change="change" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.cesium-container {
  height: 100%;
  position: relative;
}

.tool-box {
  position: absolute;
  z-index: 99;
  top: 60px;
  right: 10px;
  width: 300px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 6px;

  .tool-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;

    .tool-item-label {
      width: 100px;
    }
  }
}
</style>
