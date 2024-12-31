<script setup lang="ts">
import Error404 from '@/assets/svgIcon/404.svg'
</script>

<template>
  <div class="empty-wrapper">
    <el-empty :image="Error404" description="页面未找到" />
  </div>
</template>

<style scoped lang="less">
.empty-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
