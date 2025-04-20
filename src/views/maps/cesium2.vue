<script setup lang="ts">

import * as Cesium from 'cesium'
import { onMounted, reactive, ref, useTemplateRef } from 'vue'

const TD_TK = import.meta.env.VITE_TD_TOKEN
let viewer: null | any = null

const viewerOption = reactive({
  animation: true, // Animation小部件,左下角的球
  baseLayerPicker: true, // 选择底图的控件
  fullscreenButton: true, // 全屏按钮
  homeButton: true, // 主页按钮
  infoBox: true, // 信息框
  selectionIndicator: true, // 选择指示器
  timeline: true, // 时间轴
  sceneModePicker: true, // 3D/2D切换控件
  navigationHelpButton: true, // 帮助按钮
  geocoder: true // 地名查询控件
})

// 初始化Cesium
const initCesium = () => {
  viewer = new Cesium.Viewer('cesium-container', {
    // terrain: Cesium.Terrain.fromWorldTerrain(),
    animation: viewerOption.animation, // Animation小部件,左下角的球
    baseLayerPicker: viewerOption.baseLayerPicker, // 选择底图的控件
    fullscreenButton: viewerOption.fullscreenButton, // 全屏按钮
    fullscreenElement: 'cesium-container', // 全屏的元素
    homeButton: viewerOption.homeButton, // 主页按钮
    infoBox: viewerOption.infoBox, // 信息框
    selectionIndicator: viewerOption.selectionIndicator, // 选择指示器
    timeline: viewerOption.timeline, // 时间轴
    sceneModePicker: viewerOption.sceneModePicker, // 3D/2D切换控件
    navigationHelpButton: viewerOption.navigationHelpButton, // 帮助按钮
    geocoder: viewerOption.geocoder, // 地名查询控件
    requestRenderMode: true, // 如果为true，则仅在需要时根据场景内的更改进行渲染。启用会降低应用程序的CPU/GPU使用率
    contextOptions: {
      requestWebgl1: true, // 如果为true并且浏览器支持，则使用WebGL 1渲染上下文
      allowTextureFilterAnisotropic: true, // 如果为true，则在纹理采样期间使用各向异性过滤
      webgl: {
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      }
    }
  })
  // 显示帧数
  viewer.scene.debugShowFramesPerSecond = true
  // 视角不转到地下
  viewer.scene.globe.depthTestAgainstTerrain = true

  const subdomains = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']

  // 影像地图(卫星地图)
  const tileMap = new Cesium.WebMapTileServiceImageryProvider({
    url: `https://{s}.tianditu.gov.cn/img_w/wmts?tk=${TD_TK}`,
    layer: 'img',
    style: 'default',
    tileMatrixSetID: 'w',
    subdomains,  // 负载均衡
    maximumLevel: 18
  })
  viewer.imageryLayers.addImageryProvider(tileMap)

  // 影像标注
  const annotation = new Cesium.WebMapTileServiceImageryProvider({
    url: `https://{s}.tianditu.gov.cn/cia_w/wmts?tk=${TD_TK}`,
    layer: 'cia',
    style: 'default',
    tileMatrixSetID: 'w',
    subdomains,  // 负载均衡
    maximumLevel: 18
  })
  viewer.imageryLayers.addImageryProvider(annotation)

  // console.log(viewer)

  viewer._cesiumWidget.creditContainer.style.display = 'none' // 隐藏版权信息
  // 设置地球的背景颜色
  viewer.scene.globe.depthTestAgainstTerrain = true

  // 添加物体
  const box1 = viewer.entities.add({
    id: 'box1',
    name: 'box1',
    position: Cesium.Cartesian3.fromDegrees(117.170494, 31.843763, 10000),
    box: {
      dimensions: new Cesium.Cartesian3(5000.0, 5000.0, 5000.0),
      material: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.WHITE
    }
  })

  const box2 = viewer.entities.add({
    id: 'box2',
    name: 'box2',
    position: Cesium.Cartesian3.fromDegrees(116.170494, 31.843763, 6000),
    box: {
      dimensions: new Cesium.Cartesian3(2000.0, 2000.0, 2000.0),
      material: Cesium.Color.PINK.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.WHITE
    }
  })

  // 视线可观察到物体
  viewer.zoomTo(viewer.entities)
  const box1Entity = viewer.entities.getById('box1')

  // console.log('box1Entity',box1Entity)

  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);//处理用户输入事件
  handler.setInputAction(function (event) {       // 设置左键点击事件
    let pick = viewer.scene.pick(event.position); // 获取 pick 拾取对象
    // 判断是否获取到了 pick
    if (Cesium.defined(pick)) {
      console.log('pick',pick)
      // 放大当前点击的实体

    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


  // 立即跳转
  // viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(
  //     cameraOption.longitude,
  //     cameraOption.latitude,
  //     cameraOption.height,
  //   ), // 经度, 纬度, 高度（可选）
  //   orientation: {
  //     heading: Cesium.Math.toRadians(cameraOption.heading), // 朝向（可选）
  //     pitch: Cesium.Math.toRadians(cameraOption.pitch), // 俯仰角（可选）
  //     roll: Cesium.Math.toRadians(cameraOption.roll), // 翻滚角（可选）
  //   },
  // })
}
import { useDraggable } from '@vueuse/core'

const containerEl = useTemplateRef<HTMLElement>('containerEl')
const el = useTemplateRef<HTMLElement>('el')
const { x, y, style } = useDraggable(el, {
  initialValue: { x: null, y: 140 },
  containerElement: containerEl,
  onStart: (position, e) => {
    if (e.target.classList.toString().includes('tool')) {
      return true
    }
    return false
  }
})

onMounted(() => {
  initCesium()
})
const cameraOption = reactive({
  longitude: 117.126684, // 经度
  latitude: 31.854588, // 纬度
  height: 3000, // 高度

  heading: 0, // 航向
  pitch: -70, // 俯仰角
  roll: 0 // 翻滚角
})

const change = () => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      cameraOption.longitude,
      cameraOption.latitude,
      cameraOption.height
    ), // 经度, 纬度, 高度（可选）
    orientation: {
      heading: Cesium.Math.toRadians(cameraOption.heading), // 朝向（可选）
      pitch: Cesium.Math.toRadians(cameraOption.pitch), // 俯仰角（可选）
      roll: Cesium.Math.toRadians(cameraOption.roll) // 翻滚角（可选）
    }
  })
}
</script>

<template>
  <div class="cesium-container" id="cesium-container" ref="containerEl">
    <div class="tool-box" ref="el" :style="style" style="position: absolute; cursor: move">
      <div class="tool-item">
        <div class="tool-item-label">经度(WGS84)</div>
        <el-input-number
          style="flex: 1"
          :step="0.01"
          v-model="cameraOption.longitude"
          @change="change"
        />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">纬度(WGS84)</div>
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
  top: 10px;
  right: 10px;
  width: 300px;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 6px;

  .tool-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;

    .tool-item-label {
      width: 120px;
    }
  }
}
</style>
