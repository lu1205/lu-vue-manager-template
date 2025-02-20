<script setup lang="ts">
import { ref, unref, onMounted } from 'vue'
import Cropper from 'cropperjs'
import { useDebounceFn } from '@vueuse/core'

const imgElRef = ref(null)
const cropper = ref()

// 获取图片数据，并发送父级
const getImgData = (cvs) => {
  const imgData = cvs.toDataURL('image/jpg', 0.75)
  previewData.value = imgData
}

const debounce = useDebounceFn((cvs) => {
  getImgData(cvs)
}, 80)

const previewData = ref()
onMounted(() => {
  const imgEl = unref(imgElRef)
  cropper.value = new Cropper(imgEl, {})
  const cropperImage = cropper.value.getCropperCanvas()
  cropperImage.$ready = (value) => {
    console.log(value)
  }
  console.log(cropperImage)
})
</script>

<template>
  <div class="cropper-container">
    <div class="image-box">
      <img
        class="image"
        ref="imgElRef"
        src="https://fengyuanchen.github.io/cropperjs/v2/picture.jpg"
      />
    </div>
    <div class="preview-box">
      <img v-if="previewData" :src="previewData" alt="" class="preview-image" />
    </div>
  </div>
</template>

<style scoped lang="less">
.cropper-container {
  display: flex;
  justify-content: space-between;

  .image-box {
    width: 400px;
    height: 400px;
  }

  .preview-box {
    width: 400px;
    height: 400px;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
}
</style>

<style lang="less">
.cropper-container .image-box cropper-canvas {
  height: 100% !important;
}
</style>
