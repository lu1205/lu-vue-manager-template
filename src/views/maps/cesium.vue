<script setup lang="ts">
// import {
//   Viewer,
//   Terrain,
//   Cartesian3,
//   ScreenSpaceEventHandler,
//   ScreenSpaceEventType,
//   defined,
//   Cartographic,
//   Math,
// } from 'cesium'
import * as Cesium from 'cesium'
import { onMounted, reactive, ref, useTemplateRef } from 'vue'

let viewer: null | any = null

const viewerOption = reactive({
  animation: true, // Animation小部件,左下角的球
  baseLayerPicker: true, // 选择底图的控件
  fullscreenButton: false, // 全屏按钮
  homeButton: true, // 主页按钮
  infoBox: true, // 信息框
  selectionIndicator: true, // 选择指示器
  timeline: true, // 时间轴
  sceneModePicker: true, // 3D/2D切换控件
  navigationHelpButton: true, // 帮助按钮
  geocoder: true, // 地名查询控件
})

// 初始化Cesium
const initCesium = () => {
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
        preserveDrawingBuffer: true,
      },
    },
  })
  console.log(viewer)

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
      let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6)
      let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6)
      let height = cartographic.height.toFixed(2)
      console.log('点击坐标点', longitude, latitude, height)
      // 高度
    } else {
      console.log('没有点击到地球')
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // 平滑过度
  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(117.170494, 31.843763, 10000),
  // })

  // 立即跳转
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      cameraOption.longitude,
      cameraOption.latitude,
      cameraOption.height,
    ), // 经度, 纬度, 高度（可选）
    orientation: {
      heading: Cesium.Math.toRadians(cameraOption.heading), // 朝向（可选）
      pitch: Cesium.Math.toRadians(cameraOption.pitch), // 俯仰角（可选）
      roll: cameraOption.roll, // 翻滚角（可选）
    },
  })
}
import { useDraggable } from '@vueuse/core'
const containerEl = useTemplateRef<HTMLElement>('containerEl')
const el = useTemplateRef<HTMLElement>('el')
const { x, y, style } = useDraggable(el, {
  initialValue: { x: null, y: 60 },
  containerElement: containerEl,
  onStart: (position, e) => {
    if (e.target.classList.toString().includes('tool')) {
      return true
    }
    return false
  },
})

onMounted(() => {
  initCesium()
})
const cameraOption = reactive({
  longitude: 117.170494, // 经度
  latitude: 31.843763, // 纬度
  height: 3000, // 高度

  heading: 0, // 航向
  pitch: -70, // 俯仰角
  roll: 0, // 翻滚角
})

const change = () => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      cameraOption.longitude,
      cameraOption.latitude,
      cameraOption.height,
    ), // 经度, 纬度, 高度（可选）
    orientation: {
      heading: Cesium.Math.toRadians(cameraOption.heading), // 朝向（可选）
      pitch: Cesium.Math.toRadians(cameraOption.pitch), // 俯仰角（可选）
      roll: cameraOption.roll, // 翻滚角（可选）
    },
  })
}
</script>

<template>
  <div class="cesium-container" id="cesium-container" ref="containerEl">
    <div class="tool-box" ref="el" :style="style" style="position: absolute; cursor: move">
      <div class="tool-item">
        <div class="tool-item-label">高度</div>
        <el-input-number v-model="cameraOption.height" @change="change" />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">航向</div>
        <el-input-number v-model="cameraOption.heading" @change="change" />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">俯仰角</div>
        <el-input-number v-model="cameraOption.pitch" @change="change" />
      </div>
      <div class="tool-item">
        <div class="tool-item-label">翻滚角</div>
        <el-input-number v-model="cameraOption.roll" @change="change" />
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

  .tool-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;

    .tool-item-label {
      width: 60%;
    }
  }
}
</style>
