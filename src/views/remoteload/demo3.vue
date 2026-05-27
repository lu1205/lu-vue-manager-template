<template>
  <div class="remote-component-container">
    <div class="action-bar">
      <el-button @click="loadLocalTestVue" :loading="loading">加载本地test.vue</el-button>
    </div>

    <div class="component-wrapper" v-if="dynamicComponent">
      <component :is="dynamicComponent" />
    </div>
    <div v-else-if="loading" class="loading-tip">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>{{ loadingMessage }}</span>
    </div>
    <div v-else class="empty-tip">
      点击上方按钮加载远程Vue组件
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, shallowRef } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const loadingMessage = ref('正在加载组件...')
const dynamicComponent = shallowRef<any>(null)

import LocalTestVue from './test.vue'
// 加载本地 test.vue 内容
const loadLocalTestVue = async () => {
  loading.value = true
  loadingMessage.value = '正在加载本地test.vue...'
  dynamicComponent.value = null
  try {
    dynamicComponent.value = markRaw(LocalTestVue)
    console.log('LocalTestVue', LocalTestVue);
    ElMessage.success('本地test.vue加载成功')
  } catch (error) {
    console.error('加载本地test.vue失败:', error)
    ElMessage.error('加载本地test.vue失败: ' + (error as Error).message)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.remote-component-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.component-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
}

.code-preview {
  margin-top: 20px;
}

.loading-tip,
.empty-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  padding: 40px 20px;
  justify-content: center;
}
</style>
