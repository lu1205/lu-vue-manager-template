<script setup lang="ts">
import CollapseIcon from './component/CollapseIcon/index.vue'
import Breadcrumb from './component/Breadcrumb/index.vue'
import User from './component/User/index.vue'
</script>

<template>
  <div class="header-wrapper">
    <CollapseIcon style="font-size: 20px" />
    <Breadcrumb style="margin-left: 10px" />

    <div class="right-wrapper">
      <User />
    </div>
  </div>
</template>

<style scoped lang="less">
.header-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 6px 10px;

  .right-wrapper {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
