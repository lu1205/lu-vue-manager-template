<script setup lang="ts">
import 'cropperjs/dist/cropper.css'
import { ref, unref, onMounted } from 'vue'
import Cropper from 'cropperjs'
import { useDebounceFn } from '@vueuse/core'

const imgElRef = ref(null)
const cropper = ref()

const previewData = ref()
// 获取图片数据，并发送父级
const getImgData = (cvs) => {
  const imgData = cvs.toDataURL('image/jpg', 0.75)
  previewData.value = imgData
}

const debounce = useDebounceFn((cvs) => {
  getImgData(cvs)
}, 80)

onMounted(() => {
  const imgEl = unref(imgElRef)
  cropper.value = new Cropper(imgEl, {
    aspectRatio: 1 / 1, //裁剪比例 → [1 / 1, 19 / 9 ,...........]
    viewMode: 1, //裁剪模式 [0,1,2,3]
    dragMode: 'move',
    // 重点：加载完成将第一次裁剪的图片数据发给父级
    ready() {
      console.log('ready', getImgData(this.cropper.getCroppedCanvas()))
    },
    // 鼠标、手指移开触发
    crop() {
      debounce(this.cropper.getCroppedCanvas())
    },
    // 缩放触发
    zoom() {
      debounce(this.cropper.getCroppedCanvas())
    },
  })
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

    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
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
