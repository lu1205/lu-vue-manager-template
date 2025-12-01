// import './assets/main.css'

import '@/styles/index.less'

import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'

// Cesium
import * as Cesium from 'cesium'
Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 全局引入，使用vue-particles组件引入
// import Particles from '@tsparticles/vue3'
// import { loadFull } from 'tsparticles'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// app.use(Particles, {
//   init: async (engine) => {
//     await loadFull(engine)
//   },
// })

app.component('svg-icon', SvgIcon)

app.mount('#app')
