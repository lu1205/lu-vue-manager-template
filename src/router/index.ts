import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store/user'
import { toTree } from '@/utils/util'
import { getUserInfo, getUserPermission } from '@/api'

const routes = [
  {
    path: '/',
    name: 'layout',
    meta: {
      title: '首页',
      icon: 'House',
    },
    component: Layout,
    children: [],
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
    },
    component: () => import('@/views/login.vue'),
  },
  // 防止控制台显示，No match found for location with path ""
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404',
    },
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

const ROUTE_WHITE_LIST = ['/login', '/404']

const modules = import.meta.glob(['@/views/**/*.vue', '@/views/**/*.tsx', '@/views/**/*.jsx'])

// 获取组件实例
export function getComponent(path: string) {
  if (!path) return ''
  return (
    modules[`/src/views/${path}.vue`] ||
    modules[`/src/views/${path}.tsx`] ||
    modules[`/src/views/${path}.jsx`]
  )
}

export async function loadAsyncRouter() {
  const { data } = await getUserInfo()
  useUserStore().setUserInfo(data)
  const res = await getUserPermission()

  const routes = res.data
    ?.filter((v) => v.type !== 'B')
    .map((item) => {
      return {
        ...item,
        meta: {
          title: item.fullname,
          icon: item.icon,
          keepAlive: item.keepAlive,
        },
      }
    })

  // const menuList = arrayToTree(JSON.parse(JSON.stringify(routes)), 0)
  const menuList = toTree(JSON.parse(JSON.stringify(routes)))

  const convertRoute = routes?.map((item) => {
    return {
      ...item,
      component: getComponent(item.component || null),
    }
  })
  // const asyncRouteList = arrayToTree(convertRoute, 0)
  const asyncRouteList = toTree(convertRoute)

  asyncRouteList.forEach((item) => {
    router.addRoute('layout', item)
  })

  useUserStore().setRoutes(routes)
  useUserStore().setMenuList(menuList)
  useUserStore().setAsyncRoutes(asyncRouteList)
}

router.beforeEach(async (to, from, next) => {
  // 白名单跳过
  if (ROUTE_WHITE_LIST.includes(to.path)) return next()
  // 未登录跳转
  if (!useUserStore().getToken()) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  // 刷新时获取用户信息，用户信息不存储到本地
  if (!useUserStore().getUserInfo()?.id) {
    await loadAsyncRouter()
    // 使用addRoute添加动态路由后，必须使用replace，否则匹配不到新添加的路由
    next({ path: to.path, query: to.query, replace: true })
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title}`
})

export default router
