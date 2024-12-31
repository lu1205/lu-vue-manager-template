<script setup lang="ts">
import locale from 'element-plus/es/locale/lang/zh-cn'
</script>

<template>
  <el-config-provider :locale="locale">
    <RouterView />
  </el-config-provider>
</template>
