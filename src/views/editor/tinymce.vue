<script setup lang="ts">
import { ref } from 'vue'
import TinyMceEditor from '@/components/TinyMceEditor/index.vue'

const content = ref('<p>这是一个TinyMCE富文本编辑器示例！</p>')

const handleChange = (value: string) => {
  console.log('内容已改变:', value)
  content.value = value
}
</script>

<template>
  <div class="tinymce-container">
    <el-card header="TinyMCE富文本编辑器示例">
      <template #header>
        <div class="card-header">
          <span>TinyMCE富文本编辑器</span>
          <el-button type="primary" @click="content = '<p>重置内容！</p>'">
            重置内容
          </el-button>
        </div>
      </template>

      <TinyMceEditor
        v-model="content"
        :height="600"
        @change="handleChange"
      />

      <div class="content-preview">
        <h4>编辑器内容：</h4>
        <div v-html="content" class="preview-box"></div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="less">
.tinymce-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-preview {
  margin-top: 20px;

  h4 {
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 600;
  }

  .preview-box {
    padding: 15px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #f5f7fa;
    min-height: 100px;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}
</style>
