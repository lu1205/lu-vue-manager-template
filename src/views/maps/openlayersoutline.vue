<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { fromLonLat } from 'ol/proj'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import ChinaGeoJson from '@/static/mapJson/china.json'

let map: Map | null = null

onMounted(() => {
  // 初始化地图
  map = new Map({
    target: 'openlayers-map',
    layers: [
      new VectorLayer({
        source: new VectorSource({
          // url: '/static/mapJson/china.json', // 文件需放在public目录下
          features: new GeoJSON().readFeatures(ChinaGeoJson), // 读取GeoJSON数据
          format: new GeoJSON({
            dataProjection: 'EPSG:4326', // 原始数据的坐标系
            featureProjection: 'EPSG:4326', // 转换为 Web Mercator 投影
          }),
        }),
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.2)', // 填充颜色
          }),
          stroke: new Stroke({
            color: '#ff0000', // 边框颜色
            width: 2, // 边框宽度
          }),
        }),
      }),
    ],
    view: new View({
      center: [104.912777, 34.730746], // 初始中心点坐标（根据实际GeoJSON调整）
      zoom: 5,
      projection: 'EPSG:4326', // 使用 Web Mercator 投影
    }),
  })

  setTimeout(() => {
    if (map) {
      const view = map.getView()
      const center = view.getCenter()
      console.log(center)

      view.setCenter([center[0], (center[1] += 5)])
      map.render()

      nextTick(() => {
        console.log('nextTick', view.getCenter())
      })
    }
  }, 3000)
})

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined)
    map = null
  }
})
</script>

<template>
  <div class="openlayer-container">
    <div id="openlayers-map"></div>
  </div>
</template>

<style scoped lang="less">
.openlayer-container {
  width: 100%;
  height: 100%;

  #openlayers-map {
    width: 100%;
    height: 100%;
  }
}
</style>
