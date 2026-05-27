<template>
  <div class="remote-component-container">
    <div class="action-bar">
      <el-button type="primary" @click="fetchVueFile">加载远程Vue组件</el-button>
      <el-button @click="loadLocalTest">加载本地test.vue(演示)</el-button>
    </div>
    <div class="component-wrapper" v-if="dynamicComponent">
      <component :is="dynamicComponent" />
    </div>
    <div v-else-if="loading" class="loading-tip">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>正在加载组件...</span>
    </div>
    <div v-else class="empty-tip">
      点击上方按钮加载远程Vue组件
    </div>
    <div v-if="rawCode" class="code-preview">
      <el-divider content-position="left">接口返回内容预览</el-divider>
      <el-input v-model="rawCode" type="textarea" :rows="20" readonly placeholder="接口返回的 Vue 组件代码会显示在这里" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, shallowRef } from 'vue'
import { getVueFile } from '@/api/index'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TestComponent from './test.vue'

import { loadModule } from 'vue3-sfc-loader'
import * as Vue from 'vue'
import * as ElementPlus from 'element-plus'
import * as Api from '@/api/index'
import * as Enums from '@/enums/index'
import 'element-plus/dist/index.css'

const options = {
  moduleCache: {
    'vue': Vue,
    'element-plus': ElementPlus,
    '@/api': Api,
    '@/enums/index': Enums,
  },
  async getFile(url: string) {
    console.log('getFile called for:', url)
    return {
      getContentData: (asBinary: boolean) => asBinary ? new ArrayBuffer(0) : ''
    }
  },
  addStyle(textContent: string) {
    console.log('addStyle called')
    const style = Object.assign(document.createElement('style'), { textContent })
    const ref = document.head.getElementsByTagName('style')[0] || null
    document.head.insertBefore(style, ref)
  },
  log: (type: string, ...args: any[]) => {
    console.log(`[vue3-sfc-loader] ${type}:`, ...args)
  }
}

// 编译并加载组件
const loadComponent = async (code: string) => {
  const customOptions = {
    ...options,
    getFile: () => Promise.resolve({
      getContentData: (asBinary: boolean) => asBinary ? new ArrayBuffer(0) : code
    })
  }

  return await loadModule('./remote-component.vue', customOptions)
}

const loading = ref(false)
const dynamicComponent = shallowRef<any>(null)
const rawCode = ref('')

// 从API获取.vue文件内容并渲染
const fetchVueFile = async () => {
  loading.value = true
  rawCode.value = ''
  try {
    const response = await getVueFile()
    const code = response.data
    rawCode.value = code
    if (code) {
      dynamicComponent.value = await loadComponent(code)
      ElMessage.success('组件加载成功')
    }
  } catch (error) {
    console.error('获取Vue文件失败:', error)
    ElMessage.error('获取Vue文件失败')
  } finally {
    loading.value = false
  }
}

// 加载本地 test.vue 内容（用于演示）
const loadLocalTest = async () => {
  loading.value = true
  rawCode.value = ''
  try {
    dynamicComponent.value = markRaw(TestComponent)
  } catch (error) {
    console.error('加载组件失败:', error)
    ElMessage.error('加载组件失败')
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
