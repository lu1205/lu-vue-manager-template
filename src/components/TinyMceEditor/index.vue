<template>
  <div class="tinymce-editor">
    <Editor
      v-model="content"
      :init="editorConfig"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import tinymce from 'tinymce/tinymce'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'
import 'tinymce/models/dom'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/help'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/quickbars'

interface Props {
  modelValue?: string
  height?: number | string
  menubar?: string | boolean
  toolbar?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: 500,
  menubar: 'file edit view insert format tools table help',
  toolbar: 'undo redo | blocks fontfamily | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor | link image media | code | removeformat',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const content = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (newVal !== content.value) {
    content.value = newVal
  }
})

const handleInput = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 获取 base 路径，支持开发和生产环境
const getBasePath = () => {
  return (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
}

const editorConfig = computed(() => {
  const basePath = getBasePath()
  return {
    // 关键：不使用 api_key，使用 tinymce 对象
    tinymce,
    base_url: `${basePath}/tinymce`,
    suffix: '.min',
    height: props.height,
    menubar: props.menubar,
    toolbar: props.toolbar,
    branding: false,
    statusbar: true,
    resize: true,
    language: 'zh_CN',
    language_url: `${basePath}/tinymce/zh_CN.js`,
    skin: 'oxide',
    skin_url: `${basePath}/tinymce/skins/ui/oxide`,
    content_css: `${basePath}/tinymce/skins/content/default/content.min.css`,
    fontsize_formats: '10px 11px 12px 14px 16px 18px 20px 24px 28px 32px 36px 48px',
    fontfamily_formats: '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋=simsun,serif;黑体=simhei,serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'quickbars'
    ],
    block_formats: 'Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3; Header 4=h4; Header 5=h5; Header 6=h6; Preformatted=pre',
    quickbars_selection_toolbar: 'removeformat | bold italic | quicklink blockquote',
    contextmenu: 'copy cut paste | link image inserttable | cell row column deletetable',
    link_list: [
      { title: '预链接1', value: 'https://www.example.com' },
      { title: '预链接2', value: 'https://www.google.com' }
    ],
    image_list: [
      { title: '图片1', value: 'https://www.example.com/image1.jpg' }
    ],
    image_class_list: [
      { title: 'None', value: '' },
      { title: 'Some class', value: 'class-name' }
    ],
    importcss_append: true,
    file_picker_callback: (callback: any, value: any, meta: any) => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      
      if (meta.filetype === 'image') {
        input.setAttribute('accept', 'image/*')
      } else if (meta.filetype === 'media') {
        input.setAttribute('accept', 'video/*')
      } else {
        input.setAttribute('accept', '*/*')
      }
      
      input.onchange = function() {
        const file = (this as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = function() {
            const id = 'blobid' + (new Date()).getTime()
            const blobCache = (window as any).tinymce.activeEditor.editorUpload.blobCache
            const base64 = (reader.result as string).split(',')[1]
            const blobInfo = blobCache.create(id, file, base64)
            blobCache.add(blobInfo)
            callback(blobInfo.blobUri(), { title: file.name })
          }
          reader.readAsDataURL(file)
        }
      }
      
      input.click()
    },
    content_style: `
      body {
        font-family: Microsoft YaHei, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      a {
        color: #409EFF;
      }
    `,
    min_height: 350,
    max_height: 800,
    auto_focus: true,
    invalid_styles: {
      'span': 'color font-size',
      'p': 'color font-size line-height'
    },
    style_formats: [
      {
        title: '标题1',
        format: 'h1',
        styles: { fontSize: '2em', fontWeight: 'bold' }
      },
      {
        title: '标题2',
        format: 'h2',
        styles: { fontSize: '1.5em', fontWeight: 'bold' }
      },
      {
        title: '标题3',
        format: 'h3',
        styles: { fontSize: '1.17em', fontWeight: 'bold' }
      },
      {
        title: '引用',
        format: 'blockquote',
        wrapper: true
      },
      {
        title: '代码块',
        format: 'pre',
        wrapper: true
      }
    ],
  }
})
</script>

<style scoped>
.tinymce-editor {
  width: 100%;
  line-height: normal;
}

.tinymce-editor :deep(.tox-tinymce) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.tinymce-editor :deep(.tox-promotion) {
  display: none !important;
}
</style>
