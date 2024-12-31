import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref('' || sessionStorage.getItem('token'))
  const userInfo = ref({})
  const menuList = ref([])
  const routes = ref([])
  const asyncRoutes = ref([])

  function setToken(value) {
    token.value = value
    sessionStorage.setItem('token', value)
  }

  function getToken() {
    return token.value
  }

  function setUserInfo(value) {
    userInfo.value = value
  }

  function getUserInfo() {
    return userInfo.value
  }

  function setMenuList(value) {
    menuList.value = value
  }

  function getMenuList() {
    return menuList.value
  }

  function setRoutes(value) {
    routes.value = value
  }

  function getRoutes() {
    return routes.value
  }

  function setAsyncRoutes(value) {
    asyncRoutes.value = value
  }

  function getAsyncRoutes() {
    return asyncRoutes.value
  }

  function clearAll() {
    token.value = ''
    userInfo.value = {}
    menuList.value = []
    routes.value = []
    asyncRoutes.value = []
  }

  return {
    setToken,
    getToken,
    setUserInfo,
    getUserInfo,
    setMenuList,
    getMenuList,
    setRoutes,
    getRoutes,
    setAsyncRoutes,
    getAsyncRoutes,
    clearAll,
  }
})
