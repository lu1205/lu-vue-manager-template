<template>
  <div class="remote-component-container">
    <div class="action-bar">
      <el-button type="primary" @click="showRemoteChild = true">加载远程Vue组件</el-button>
    </div>
    <div>
      <RemoteChild v-if="showRemoteChild" />
    </div>
    <div v-if="rawCode" class="code-preview">
      <el-divider content-position="left">接口返回内容预览</el-divider>
      <el-input v-model="rawCode" type="textarea" :rows="20" readonly placeholder="接口返回的 Vue 组件代码会显示在这里" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { getVueFile } from '@/api/index'
import { loadModule } from 'vue3-sfc-loader'
import * as Vue from 'vue'
import * as ElementPlus from 'element-plus'
import * as Api from '@/api/index'
import * as Enums from '@/enums/index'
import 'element-plus/dist/index.css'

const showRemoteChild = ref(false)
const rawCode = ref('')

const options = {
  pathResolve({ refPath, relPath }) {
    if (relPath === ".")
      return refPath;
    if (relPath[0] !== "." && relPath[0] !== "/") return relPath;
    return String(
      new URL(relPath, refPath === undefined ? window.location : refPath)
    );
  },
  moduleCache: {
    'vue': Vue,
    'element-plus': ElementPlus,
    '@/api': Api,
    '@/enums/index': Enums,
  },
  async getFile(url: string) {
    // 通过文件系统
    const res = await fetch(url)
    const code = await res.text()
    // 通过接口（JSON格式）
    // const res = await getVueFile()
    // const code = res.data
    console.log('getFile', code);
    rawCode.value = code
    return code
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

const RemoteChild = defineAsyncComponent(async () => {
  const res = await loadModule("http://127.0.0.1:3007/user.vue", options)
  return res
});

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
