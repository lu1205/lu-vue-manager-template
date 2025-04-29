<script setup lang="ts">
import { onMounted, ref } from 'vue'

import 'ol/ol.css'
import { Feature, Map, Overlay, View } from 'ol'
import { Cluster, Vector, XYZ } from 'ol/source'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
// 导入 Draw 模块
import Draw from 'ol/interaction/Draw'
import { ElMessage } from 'element-plus'
import Point from 'ol/geom/Point'
import Icon from 'ol/style/Icon'
import Text from 'ol/style/Text'
import { debounce } from 'lodash-es'

let gaodeKey = import.meta.env.VITE_GAODE_KEY

let map = null

const zoom = ref(4)

// 弹出框
let popup = null
// 显示弹出框
const showPopup = (center, content) => {
  if (popup) {
    popup.setPosition(center)
    popup.getElement().innerHTML = content
  }
}
// 隐藏弹出框
const hidePopup = () => {
  if (popup) {
    popup.setPosition(undefined)
    popup.getElement().innerHTML = ''
  }
}

const city = ref('')
const cityLocation = ref([])
const adcode = ref('')
const searchCity = ref('')
// 获取当前城市
const getCityName = async () => {
  try {
    const temp = await fetch('https://restapi.amap.com/v3/ip?key=' + gaodeKey)
    const res = await temp.json()
    city.value = typeof res.city === 'string' ? res.city : '合肥市'
    adcode.value = typeof res.adcode === 'string' ? res.adcode : '340100'
  } catch (error) {
    city.value = '合肥市'
    adcode.value = '340100'
  }
  console.log('getCityName', city.value, adcode.value)
}

// 获取城市的经纬度
const getCityLocation = async (cityName: string) => {
  console.log('cityName', cityName)

  try {
    const locationTemp = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?key=${gaodeKey}&address=${cityName}`,
    )
    const locationRes = await locationTemp.json()
    cityLocation.value = locationRes.geocodes[0].location.split(',').map(Number)
  } catch (error) {
    cityLocation.value = [117.227267, 31.820567]
  }
  console.log('getCityLocation', cityLocation.value)
}

// 城市边界图层
let cityLayer = null
// 加载城市边界
const loadCityBoundary = async () => {
  console.log('loadCityBoundary===adcode.value', adcode.value)

  if (!adcode.value) {
    return
  }
  if (cityLayer) {
    map.removeLayer(cityLayer)
  }
  cityLayer = new VectorLayer({
    source: new VectorSource({
      url: `https://geo.datav.aliyun.com/areas_v3/bound/${adcode.value}.json`,
      format: new GeoJSON(),
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
  })
  map.addLayer(cityLayer)

  // 视窗定位到当前城市
  map.getView().animate({
    center: cityLocation.value, // 目标中心点
    zoom: 8, // 目标缩放级别
    duration: 1000, // 动画持续时间（毫秒）
  })
}

// 切换城市
const changeCity = async () => {
  if (!searchCity.value) {
    return
  }
  hidePopup()

  const locationTemp = await fetch(
    `https://restapi.amap.com/v3/geocode/geo?key=${gaodeKey}&address=${searchCity.value}`,
  )
  const locationRes = await locationTemp.json()
  if (locationRes.status !== '1') {
    ElMessage.error('未查询到该城市')
    return
  }
  adcode.value = locationRes.geocodes[0].adcode
  cityLocation.value = locationRes.geocodes[0].location.split(',').map(Number)
  loadCityBoundary()
}

const graphicsType = ref('')
// 图形类型列表
const graphicsTypeList = [
  { label: '退出绘制', value: 'exit' },
  { label: '直线', value: 'line' },
  { label: '圆形', value: 'circle' },
  { label: '多边形', value: 'polygon' },
  { label: '自由画笔', value: 'freehand' },
  { label: '清除绘画', value: 'clear' },
]
// 图形图层
const graphicsLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.2)', // 填充颜色
    }),
    stroke: new Stroke({
      color: '#ff0000', // 边框颜色
      width: 2, // 边框宽度
    }),
  }),
})
// 图形
let graphics = null

// 切换图层类型
const changeGraphicsType = () => {
  if (selectedIcon) {
    map.removeInteraction(selectedIcon) // 移除之前的交互，避免重复添加交互导致的问题，如无法点击标记
    selectedIcon = null
    markerType.value = ''
  }
  // hidePopup()
  if (graphics) {
    map.removeInteraction(graphics)
    graphics = null
  }
  if (graphicsType.value === 'exit') {
    graphicsType.value = ''
    map.removeInteraction(graphics)
  } else if (graphicsType.value === 'clear') {
    graphicsType.value = ''
    graphicsLayer?.getSource().clear()
  } else {
    if (graphicsType.value === 'line') {
      graphics = new Draw({ type: 'LineString', source: graphicsLayer.getSource() })
    } else if (graphicsType.value === 'circle') {
      graphics = new Draw({ type: 'Circle', source: graphicsLayer.getSource() })
    } else if (graphicsType.value === 'polygon') {
      graphics = new Draw({ type: 'Polygon', source: graphicsLayer.getSource() })
    } else if (graphicsType.value === 'freehand') {
      // graphics = new Draw({ type: 'Freehand', source: graphicsLayer.getSource() })
      graphics = new Draw({ type: 'LineString', source: graphicsLayer.getSource(), freehand: true })
    }
    map.addInteraction(graphics)
  }
}

const markerType = ref('')
// 标记类型列表
const markerTypeList = [
  { label: '退出标记', value: 'exit' },
  { label: '充电站', value: 'charge' },
  { label: '公交站', value: 'bus' },
  { label: '停车场', value: 'park' },
  { label: '清除标记', value: 'clear' },
]
const PARKICON = new URL('/src/assets/svgIcon/park.svg', import.meta.url).href
import CHARGEICON from '/src/assets/svgIcon/charge.svg'
import BUSICON from '/src/assets/svgIcon/bus.svg'
import CircleStyle from 'ol/style/Circle'

let selectedIcon = null
// 切换标记类型
const changeMarker = () => {
  if (graphics) {
    map.removeInteraction(graphics) // 移除之前的交互，避免重复添加交互导致的问题，如无法点击标记
    graphics = null
    graphicsType.value = ''
  }
  hidePopup()
  if (markerType.value === 'clear') {
    markerType.value = ''
    selectedIcon = null
    markerSource.clear()
  } else if (markerType.value === 'exit') {
    markerType.value = ''
    selectedIcon = null
  } else if (markerType.value === 'charge') {
    selectedIcon = CHARGEICON
  } else if (markerType.value === 'bus') {
    selectedIcon = BUSICON
  } else if (markerType.value === 'park') {
    selectedIcon = PARKICON
  }
}
// 标注图层数据源
const markerSource = new Vector({
  features: [],
})
// 标注图层
const markerLayer = new VectorLayer({
  source: markerSource,
})
// 添加标注
const addMarker = (coordinate) => {
  const feature = new Feature({
    geometry: new Point(coordinate),
  })
  feature.setStyle(
    new Style({
      image: new Icon({
        src: selectedIcon,
        width: 30,
        height: 30,
      }),
    }),
  )

  markerSource.addFeature(feature)
}

const position = [117.227267, 31.820567]
// 聚合点数据
const clusterData = new Vector({
  features: [],
})
// 添加聚合点
const addCluster = (number: number) => {
  for (let i = 0; i < number; i++) {
    const feature = new Feature({
      geometry: new Point([
        position[0] + Math.random() * 10 - 5,
        position[1] + Math.random() * 10 - 5,
      ]),
    })
    clusterData.addFeature(feature)
  }
}
addCluster(10000)
// 创建聚合点
const handleCreateCluster = (point, features) => {
  const count = features.length // 聚合点数量
  const feature = features[0] // 聚合点
  const cluster = new Feature({
    geometry: feature.getGeometry().clone(), // 聚合点的几何
    count: count, // 聚合点数量
  })

  // 聚合点样式
  const circleStyle = {
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({
        color: 'rgba(255, 0, 0, 1)', // 填充颜色
      }),
      stroke: new Stroke({
        color: '#ff0000', // 边框颜色
        width: 2, // 边框宽度
      }),
    }),
  }

  // 聚合点文本样式
  const textStyle = {
    text: new Text({
      text: count.toString(), // 聚合点数量
      fill: new Fill({
        color: '#fff', // 文本颜色
      }),
      stroke: new Stroke({
        color: '#000', // 文本边框颜色
        width: 2, // 文本边框宽度
      }),
    }),
  }

  // 设置聚合点样式
  const styleOption = count > 1 ? { ...circleStyle, ...textStyle } : circleStyle
  cluster.setStyle(new Style(styleOption))
  return cluster
}
// 点聚合
const clusterSource = new Cluster({
  distance: 40, // 聚合半径
  source: clusterData, // 数据源
  createCluster: handleCreateCluster, // 创建聚合点
})
/* // 存储上一次的聚合结果
let lastClusterFeatures = [];
const handleClusterChange = debounce(() => {
  const view = map.getView();
  const zoom = view.getZoom();

  if (zoom < 5) {
    // 如果缩放级别小于5，使用上一次的聚合结果
    clusterSource.clear();
    clusterSource.addFeatures(lastClusterFeatures);
  } else {
    // 否则正常更新并存储当前聚合结果
    lastClusterFeatures = clusterSource.getFeatures();
  }
},20)
clusterSource.on('change', handleClusterChange) */
// 是否开启点聚合
const cluster = ref(false)
// 点聚合图层
const clusterLayer = new VectorLayer({
  source: clusterSource,
  visible: cluster.value,
})
// 切换点聚合显示状态
const changeCluster = () => {
  clusterLayer.setVisible(cluster.value)
}

onMounted(async () => {
  map = new Map({
    target: 'openlayers-map',
    view: new View({
      projection: 'EPSG:4326',
      center: [120.193827, 30.28708],
      zoom: 4,
    }),
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        }),
      }),
      graphicsLayer,
      markerLayer,
      clusterLayer,
    ],
  })
  await getCityName()
  await getCityLocation(city.value)

  // 设置地图中心点
  setTimeout(() => {
    // 加载当前城市的边界
    loadCityBoundary()
  }, 1000)

  // 地图缩放事件
  map.getView().on('change:resolution', function (e) {
    // const zoom = this.getZoom()
    zoom.value = this.getZoom()

    if (zoom.value > 10) {
      cityLayer?.setVisible(false)
      graphicsLayer?.setVisible(false)
    } else {
      cityLayer?.setVisible(true)
      graphicsLayer?.setVisible(true)
    }
  })

  // 创建 Popup 覆盖物
  popup = new Overlay({
    element: document.getElementById('popup'), // HTML 中需要有对应的元素
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -10],
  })

  // 将 Popup 添加到地图
  map.addOverlay(popup)

  // 地图点击事件
  map.on('click', function (e) {
    const features = map.getFeaturesAtPixel(e.pixel)
    // console.log(features)

    if (selectedIcon) {
      addMarker(e.coordinate)
    } else {
      if (features.length > 0 && features[features.length - 1].get('name') && !graphics) {
        const feature = features[features.length - 1]

        const name = feature.get('name')
        const adcode = feature.get('adcode')
        const center = feature.get('center')
        // 创建弹窗内容
        const content = `
            <div style="position: absolute;background-color: rgb(255, 212, 212);padding: 15px;border-radius: 10px;min-width: 280px;">
                <h3>${name}</h3>
                <p>adcode: ${adcode}</p>
                <p>坐标: ${center.join(', ')}</p>
            </div>
        `

        // 如果使用 Popup 显示信息
        showPopup(center, content)
      } else {
        // 隐藏 Popup
        hidePopup()
      }
    }

    /* if (features.length > 0) {
      const feature = features.find((item) => item.get('name'))
      if (feature && !graphics) {
        const name = feature.get('name')
        const adcode = feature.get('adcode')
        const center = feature.get('center')
        console.log('点击的坐标:', name, adcode, center)
        // 创建弹窗内容
        const content = `
            <div>
                <h3>${name}</h3>
                <p>adcode: ${adcode}</p>
                <p>坐标: ${center.join(', ')}</p>
            </div>
        `

        // 如果使用 Popup 显示信息
        showPopup(center, content)
      } else {
        // 隐藏 Popup
        hidePopup()
      }
    } else {
      // 隐藏 Popup
      hidePopup()
    } */
  })
})
</script>

<template>
  <div class="openlayer-container">
    <div class="top-area">
      <div class="item">{{ city }}</div>
      <div class="item">
        <el-input v-model="searchCity" @change="changeCity" placeholder="请输入搜索的城市" />
      </div>
      <div class="item">
        <el-select v-model="graphicsType" @change="changeGraphicsType" placeholder="请选择绘制图形">
          <el-option
            v-for="item in graphicsTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="item">
        <el-select v-model="markerType" @change="changeMarker" placeholder="请选择标记类型">
          <el-option
            v-for="item in markerTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="item">
        <el-select v-model="cluster" @change="changeCluster" placeholder="是否显示点聚合数据">
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </div>
    </div>
    <div id="openlayers-map"></div>
    <div id="popup"></div>
  </div>
</template>

<style scoped lang="less">
.openlayer-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .top-area {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3d52c9;
    color: #fff;

    .item {
      // flex: 1;
      width: 20%;
      margin: 0 10px;
      // text-align: center;
    }
  }

  #openlayers-map {
    // width: 100%;
    // height: 100%;
    flex: 1;
  }
}
</style>
