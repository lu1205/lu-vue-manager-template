<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const list = computed(() => route.matched)
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in list" :key="item.path">
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
