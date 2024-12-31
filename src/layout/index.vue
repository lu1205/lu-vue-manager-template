<script setup lang="ts">
import { computed } from 'vue'
import Menu from './menu/index.vue'
import Header from './Header/index.vue'
import { useSettingStore } from '@/store/setting'
const menuWidth = computed(() => (useSettingStore().getCollapse() ? '64px' : '200px'))
</script>

<template>
  <div class="app-wrapper">
    <div class="menu-wrapper" :style="{ width: menuWidth }">
      <Menu />
    </div>
    <div class="main-wrapper">
      <div class="header-wrapper">
        <Header />
      </div>
      <div class="container-wrapper">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.app-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;

  .menu-wrapper {
    max-width: 200px;
    height: 100%;
    // border-right: 1px solid #dcdfe6;
    transition: width 0.3s ease-in;
  }

  .main-wrapper {
    flex: 1;
    border-left: 1px solid #dcdfe6;
    display: flex;
    flex-direction: column;
    overflow: auto;

    .header-wrapper {
      height: 48px;
    }

    .container-wrapper {
      flex: 1;
      padding: 10px;
      overflow: auto;
    }
  }
}
</style>
