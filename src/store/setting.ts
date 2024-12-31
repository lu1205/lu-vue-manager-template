import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', () => {
  const isCollapse = ref(false)

  function changeCollapse() {
    isCollapse.value = !isCollapse.value
  }

  function getCollapse() {
    return isCollapse.value
  }

  return {
    changeCollapse,
    getCollapse,
  }
})
