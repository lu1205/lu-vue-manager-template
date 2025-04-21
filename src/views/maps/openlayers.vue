<script setup lang="ts">
import { onMounted } from 'vue'

import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'

// 使用XYZ加载图层时，需要配合fromLonLat进行坐标转换
import XYZ from 'ol/source/XYZ'
import { fromLonLat, transform } from 'ol/proj'

// 使用WMTS加载图层
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection } from 'ol/proj'
import { getTopLeft, getWidth } from 'ol/extent'

import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { Gcj02ToWgs84, Wgs84ToGcj02 } from '@/utils/gisTools'

import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Vector from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Overlay from 'ol/Overlay'

const TD_TK = import.meta.env.VITE_TD_TOKEN

let map = null

// 自带OSM
const osm = new TileLayer({
  source: new OSM(),
})

// XYZ方式加载图层
const initXYZLoadLayers = () => {
  // 创建天地图矢量图层
  const tdtVec = new TileLayer({
    title: '天地图矢量图层',
    source: new XYZ({
      url:
        'http://t0.tianditu.gov.cn/vec_w/wmts?' +
        'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&' +
        'FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
        TD_TK,
      crossOrigin: 'anonymous',
    }),
  })

  // 创建天地图矢量注记图层
  const tdtVecLabel = new TileLayer({
    title: '天地图矢量注记',
    source: new XYZ({
      url:
        'http://t0.tianditu.gov.cn/cva_w/wmts?' +
        'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&' +
        'FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
        TD_TK,
      crossOrigin: 'anonymous',
    }),
  })

  // 使用XYZ加载图层时，需要配合fromLonLat进行坐标转换
  const center = fromLonLat([117.227267, 31.820567])

  const view = new View({
    center: center, // 使用XYZ加载图层时，需要配合fromLonLat进行坐标转换
    zoom: 10,
  })

  return {
    tdtVec,
    tdtVecLabel,
    center,
    view,
  }
}

// WMTS方式加载图层
const initWMTSLoadLayers = () => {
  // 定义WMTS参数
  const projection = getProjection('EPSG:3857')
  const projectionExtent = projection.getExtent()
  const origin = getTopLeft(projectionExtent)
  const resolutions = []
  const matrixIds = []
  const width = getWidth(projectionExtent)
  const maxResolution = width / 256

  // 计算分辨率和矩阵ID
  for (let i = 0; i < 19; i++) {
    resolutions[i] = maxResolution / Math.pow(2, i)
    matrixIds[i] = i
  }

  // 创建WMTS网格
  const wmtsTileGrid = new WMTSTileGrid({
    origin: origin,
    resolutions: resolutions,
    matrixIds: matrixIds,
  })
  // 创建矢量底图图层
  const vecLayer = new TileLayer({
    title: '天地图矢量图层',
    source: new WMTS({
      url: 'http://t0.tianditu.gov.cn/vec_w/wmts?tk=' + TD_TK,
      layer: 'vec',
      format: 'tiles',
      matrixSet: 'w',
      projection: projection,
      tileGrid: wmtsTileGrid,
      style: 'default',
      wrapX: true,
      crossOrigin: 'anonymous',
    }),
  })
  // 创建矢量注记图层
  const vecLabelLayer = new TileLayer({
    title: '天地图矢量注记',
    source: new WMTS({
      url: 'http://t0.tianditu.gov.cn/cva_w/wmts?tk=' + TD_TK,
      layer: 'cva',
      format: 'tiles',
      matrixSet: 'w',
      projection: projection,
      tileGrid: wmtsTileGrid,
      style: 'default',
      wrapX: true,
      crossOrigin: 'anonymous',
    }),
  })

  const center = fromLonLat([117.227267, 31.820567])

  const view = new View({
    center: center,
    zoom: 10,
    projection: projection,
  })

  return {
    tdtVec: vecLayer,
    tdtVecLabel: vecLabelLayer,
    center,
    view,
  }
}

// WMTS(EPSG:4326)方式加载图层
const initWMTSLoadLayers_EPSG4326 = () => {
  // 注册EPSG:4326投影
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs')
  register(proj4)

  // 定义WMTS参数
  const projection = getProjection('EPSG:4326')
  const projectionExtent = [-180, -90, 180, 90]
  const resolutions = []
  const matrixIds = []

  // 计算分辨率和矩阵ID
  for (let i = 1; i <= 18; i++) {
    resolutions.push(180 / (Math.pow(2, i - 1) * 256))
    matrixIds.push(i)
  }

  // 创建WMTS网格
  const wmtsTileGrid = new WMTSTileGrid({
    origin: [-180, 90],
    resolutions: resolutions,
    matrixIds: matrixIds,
  })

  // 创建矢量底图图层
  const vecLayer = new TileLayer({
    title: '天地图矢量图层',
    source: new WMTS({
      url: 'http://t0.tianditu.gov.cn/vec_c/wmts?tk=' + TD_TK,
      layer: 'vec',
      format: 'tiles',
      matrixSet: 'c',
      projection: projection,
      tileGrid: wmtsTileGrid,
      style: 'default',
      wrapX: true,
      crossOrigin: 'anonymous',
    }),
  })

  // 创建矢量注记图层
  const vecLabelLayer = new TileLayer({
    title: '天地图矢量注记',
    source: new WMTS({
      url: 'http://t0.tianditu.gov.cn/cva_c/wmts?tk=' + TD_TK,
      layer: 'cva',
      format: 'tiles',
      matrixSet: 'c',
      projection: projection,
      tileGrid: wmtsTileGrid,
      style: 'default',
      wrapX: true,
      crossOrigin: 'anonymous',
    }),
  })

  // const center = [117.227221,31.821578] // gcj02
  const center = [117.221734, 31.823572] //wgs84

  const view = new View({
    center: center, // 直接使用经纬度坐标
    zoom: 10,
    projection: projection,
    extent: projectionExtent,
  })

  return {
    tdtVec: vecLayer,
    tdtVecLabel: vecLabelLayer,
    center,
    view,
  }
}

// const { tdtVec, tdtVecLabel, view } = initXYZLoadLayers()
// const { tdtVec, tdtVecLabel, view } = initWMTSLoadLayers()
const { tdtVec, tdtVecLabel, view } = initWMTSLoadLayers_EPSG4326()

const layers = [
  // osm, // 自带OSM
  tdtVec, // 天地图矢量图层
  tdtVecLabel, // 天地图矢量注记图层
]

onMounted(() => {
  map = new Map({
    target: 'openlayers-map',
    layers: layers,
    view: view,
  })

  const pointPositions = [
    [117.344643, 31.916269],
    [117.190834, 31.908029],
    [117.299324, 31.710275],
    [117.407814, 31.783059],
    [117.388588, 31.938241],
    [117.24302, 32.09617],
    [117.061745, 31.902536],
    [117.064492, 31.706155],
    [117.133156, 31.611398],
    [117.248513, 31.575692],
  ]

  // 创建多个点要素
  const points = pointPositions.map((position, index) => {
    return new Feature({
      geometry: new Point(position), // 直接使用经纬度坐标
      name: `这是一个监听点击事件点要素,id:${index}`,
      id: index,
    })
  })

  // 创建一个点要素
  const point = new Feature({
    geometry: new Point([117.221734, 31.823572]), // 直接使用经纬度坐标
    name: '这是一个自定义事件点元素',
    id: 100,
    onClick: () => {
      alert('点击自定义事件点元素，id为100')
      console.log(`点要素自定义事件触发，id为100`)
    },
  })

  // 创建一个点要素
  const point2 = new Feature({
    geometry: new Point([117.298638, 31.864084]), // 直接使用经纬度坐标
    name: '这是一个悬停显示点要素',
    id: 101,
    type: 'hover',
    onClick: () => {
      console.log(`这是一个悬停显示点要素，id为101`)
    },
  })

  // 创建一个矢量图层来存放点要素
  const vectorLayer = new Vector({
    source: new VectorSource({
      features: [point, point2, ...points], // 将点要素添加到矢量图层中
    }),
    style: new Style({
      image: new Circle({
        radius: 5, // 点的半径
        fill: new Fill({
          color: 'red', // 点的填充颜色
        }),
        stroke: new Stroke({
          color: 'white', // 点的描边颜色
          width: 2, // 点的描边宽度
        }),
      }),
    }),
  })
  map.addLayer(vectorLayer) // 将矢量图层添加到地图中

  // 创建 Popup 覆盖物
  const popup = new Overlay({
    element: document.getElementById('popup'), // HTML 中需要有对应的元素
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -10],
  })

  // 将 Popup 添加到地图
  map.addOverlay(popup)

  // 添加鼠标移入移出效果
  map.on('pointermove', function (evt) {
    const pixel = map.getEventPixel(evt.originalEvent)
    const hit = map.hasFeatureAtPixel(pixel)

    // 改变鼠标样式
    map.getTargetElement().style.cursor = hit ? 'pointer' : ''

    // 可以添加悬停效果
    map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      // 处理悬停效果
      // 例如改变标记样式或显示提示信息
      if (feature.get('type') === 'hover') {
        console.log(feature.getProperties())
        const properties = feature.getProperties()
        const coordinate = properties.geometry.getCoordinates()

        console.log('鼠标悬停在点要素上')
        // 创建弹窗内容
        const content = `
            <div>
                <h3>${properties.name}</h3>
                <p>ID: ${properties.id}</p>
                <p>坐标: ${coordinate.join(', ')}</p>
            </div>
        `

        // 如果使用 Popup 显示信息
        if (popup) {
          popup.setPosition(coordinate)
          popup.getElement().innerHTML = content
        }
      }
    })
  })

  map.on('click', (event) => {
    // EPSG:3857（Web墨卡托投影）显示大数值的原因是因为它使用米作为单位，而不是经纬度
    // EPSG:4326（WGS84）显示小数值的原因是因为它使用经纬度作为单位，而不是米
    console.log('当前点击的坐标：', event.coordinate)
    // console.log(event.coordinate,'Wgs84ToGcj02',Wgs84ToGcj02(transform(event.coordinate,'EPSG:3857', 'EPSG:4326')))
    // console.log(event.coordinate,'Wgs84ToGcj02',Wgs84ToGcj02(event.coordinate))
    // console.log(event)

    const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
      return feature
    })

    if (feature) {
      // console.log(feature)

      if (feature.get('onClick')) {
        // 点元素有自定义事件，执行自定义事件
        feature.get('onClick')()
      } else {
        // 获取要素属性
        const properties = feature.getProperties()
        console.log('properties', properties)
        const coordinate = properties.geometry.getCoordinates()

        // 创建弹窗内容
        const content = `
            <div>
                <h3>${properties.name}</h3>
                <p>ID: ${properties.id}</p>
                <p>坐标: ${coordinate.join(', ')}</p>
            </div>
        `

        // 如果使用 Popup 显示信息
        if (popup) {
          popup.setPosition(coordinate)
          popup.getElement().innerHTML = content
        }
      }
    }
  })
})
</script>

<template>
  <div class="openlayer-container">
    <div id="openlayers-map"></div>
    <div id="popup" class="ol-popup">
      <div id="popup-content"></div>
      <a href="#" id="popup-closer" class="ol-popup-closer">X</a>
    </div>
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

  .ol-popup {
    position: absolute;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 280px;
  }
}
</style>
