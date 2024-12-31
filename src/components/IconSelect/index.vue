<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    iconSize?: number // 图标大小
    defaultIcon?: string // 默认图标
    placeholder?: string // 占位符
    popoverDisabled?: boolean // 是否禁用
    popoverPlacement?: string // 弹出位置
    popoverTrigger?: string // 弹出触发方式
    popoverWidth?: string | number // 弹出宽度
    iconList: any[] // 图标列表
  }>(),
  {
    iconSize: 20,
    defaultIcon: 'Grid',
    placeholder: '请选择图标',
    iconDisabled: false,
    popoverPlacement: 'bottom',
    popoverTrigger: 'click',
    popoverWidth: 300,
    iconList: (): any[] => [],
  },
)
const visible = ref(false)

const model = defineModel()
const handleClick = (val: string) => {
  model.value = val
  visible.value = false
}
</script>

<template>
  <el-input v-model="model" :placeholder="placeholder" v-bind="$attrs">
    <template #append>
      <el-popover
        :width="popoverWidth"
        :disabled="popoverDisabled"
        :placement="popoverPlacement"
        :trigger="popoverTrigger"
        v-model:visible="visible"
      >
        <template #reference>
          <div
            :style="{
              fontSize: iconSize + 'px',
              cursor: popoverDisabled ? '' : 'pointer',
            }"
          >
            <svg-icon :icon-class="model ? model : defaultIcon" />
          </div>
        </template>
        <div class="icon-box">
          <div v-for="item in iconList" :key="item" @click="handleClick(item)" class="icon-item">
            <svg-icon :icon-class="item" />
          </div>
        </div>
      </el-popover>
    </template>
  </el-input>
</template>

<style scoped lang="less">
:deep(.el-input-group__append) {
  padding: 0 10px;
}

.icon-box {
  height: 300px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;

  .icon-item {
    padding: 4px;
    width: fit-content;
    height: fit-content;
    box-sizing: border-box;
    font-size: 24px;
    cursor: pointer;
  }
}
</style>
