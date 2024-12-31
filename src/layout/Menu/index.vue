<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import MenuItem from './menuItem.vue'

const menuList = useUserStore().getMenuList()
const isCollapse = computed(() => useSettingStore().getCollapse())
</script>
<template>
  <div>
    <div
      style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 16px 0;
      "
    >
      <img
        src="../../assets/img/lu.png"
        style="width: 40px; height: 40px; border-radius: 50%"
        alt=""
      />
      <div v-show="!isCollapse" style="margin-top: 10px">管理系统</div>
    </div>
    <el-menu :collapse="isCollapse" :default-active="$route.path" router style="border-right: 0">
      <MenuItem v-for="item in menuList" :key="item.path" :menu="item" />
    </el-menu>
  </div>
</template>
