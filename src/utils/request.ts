import axios from 'axios'
import router from '@/router/index.js'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

class Request {
  instance: any = null
  abortControllerMap: Map<any, any> | null = null

  constructor(config: any) {
    this.instance = axios.create(config)
    this.abortControllerMap = new Map()

    this.instance.interceptors.request.use(
      async (config: any) => {
        if (config.url !== '/login') {
          config.headers['Authorization'] = useUserStore().getToken()
        }
        const controller = new AbortController()
        const url = config.url || ''
        config.signal = controller.signal
        this.abortControllerMap?.set(url, controller)
        return config
      },
      (err: any) => {
        return Promise.reject(err)
      },
    )

    this.instance.interceptors.response.use(
      async (response: any) => {
        const url = response.config.url || ''
        this.abortControllerMap?.delete(url)

        if (response.data.code === 200) {
          return Promise.resolve(response.data)
        } else if (response.data.code === 403) {
          ElMessage.error('请重新登录')
          await router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath },
            replace: true,
          })
        } else if (response.data.code === 500) {
          ElMessage.error(response.data.message)
          return Promise.reject(null)
        }
      },
      (err: any) => {
        ElMessage.error(err.response.statusText)
        return Promise.reject(null)
      },
    )
  }

  cancelAllRequest() {
    for (const [, controller] of this.abortControllerMap as Map<any, any>) {
      controller.abort()
    }
    this.abortControllerMap?.clear()
  }

  cancelRequest(url: string) {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      this.abortControllerMap?.get(_url)?.abort()
      this.abortControllerMap?.delete(url)
    }
  }

  request(config: any) {
    return this.instance.request(config)
  }
}

const httpRequest = new Request({
  baseURL: '/vue',
})

export const request = (options: any) => {
  // if (options.mock) {
  //   httpRequest.instance.defaults.baseURL = '/mock'
  // } else {
  //   httpRequest.instance.defaults.baseURL = '/api'
  // }
  return httpRequest.request(options)
}
