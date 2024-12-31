<script setup lang="ts">
defineProps({
  menu: {},
})
</script>

<template>
  <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
    <template #title>
      <svg-icon :icon-class="menu.meta.icon" v-if="menu.meta.icon" />
      <span style="margin-left: 12px">{{ menu.meta.title }}</span>
    </template>
    <MenuItem v-for="item in menu.children" :key="item.path" :menu="item" />
  </el-sub-menu>
  <el-menu-item v-else :index="menu.path">
    <template #title>
      <svg-icon :icon-class="menu.meta.icon" v-if="menu.meta.icon" />
      <span style="margin-left: 12px">{{ menu.meta.title }}</span>
    </template>
  </el-menu-item>
</template>
