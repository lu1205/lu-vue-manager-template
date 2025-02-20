<script setup lang="ts">
import { ref, unref, onMounted } from 'vue'
import {
  Canvas,
  Rect,
  FabricText,
  Path,
  Polyline,
  Polygon,
  Circle,
  Ellipse,
  FabricImage,
  IText,
  Textbox,
} from 'fabric'

const canvasBoxRef = ref(null)

onMounted(() => {
  // 获取canvas父级元素的宽高
  const { width, height } = unref(canvasBoxRef).getBoundingClientRect()

  // 设置canvas宽高
  const canvas = new Canvas('canvas', { width, height })

  // 创建Text文本
  const helloWorld = new FabricText('Hello world!')
  helloWorld.on('mousedown', (e) => {
    console.log('mousedown', e)
    helloWorld.set({
      fill: 'blue',
    })
  })

  // 创建Text文本
  const iText = new IText('IText!')
  iText.set({
    fontSize: 30,
    fill: 'red',
  })
  iText.on('editing:exited', () => {
    console.log('editing:exited')
  })

  // 创建矩形
  const rect = new Rect({
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: 'red',
  })

  // const fabricImage = new FabricImage('https://fengyuanchen.github.io/cropperjs/v2/picture.jpg')

  // canvas中添加元素
  canvas.add(rect)
  canvas.add(helloWorld)
  canvas.add(iText)
  // canvas.add(fabricImage)

  // 设置元素居中
  canvas.centerObject(helloWorld)
})
</script>

<template>
  <div class="fabric-container">
    <div class="canvas-box" ref="canvasBoxRef">
      <canvas id="canvas"></canvas>
    </div>
  </div>
</template>

<style scoped lang="less">
.fabric-container {
  height: 100%;

  .canvas-box {
    width: 100%;
    height: 100%;
  }
}
</style>
