// import './assets/main.css'

import '@/styles/index.less'

import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('svg-icon', SvgIcon)

app.mount('#app')
