<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/store/setting'

const handleCollapse = () => {
  useSettingStore().changeCollapse()
}

const iconName = computed(() => {
  return useSettingStore().getCollapse() ? 'Expand' : 'Fold'
})
</script>

<template>
  <svg-icon @click="handleCollapse" :icon-class="iconName" />
</template>
