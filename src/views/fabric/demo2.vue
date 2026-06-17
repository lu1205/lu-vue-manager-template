<script setup lang="ts">
import { ref, unref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
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
let canvas = null

// 画布属性
const canvasProps = reactive({
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
})

// 元素列表
const elList = ref<any[]>([])
// 点击选中的元素
const selectedEl = ref<any>(null)
// 选中元素属性
const selectedElProps = reactive<any>({})

onMounted(() => {
  initCanvas()
  // 检查是否有保存的画布
  if (hasSavedCanvas()) {
    ElMessage.info('发现保存的画布数据，点击「加载画布」即可恢复')
  }
})

const initCanvas = () => {
  const { width, height } = unref(canvasBoxRef).getBoundingClientRect()

  canvas = new Canvas('canvas', {
    width: canvasProps.width,
    height: canvasProps.height,
    backgroundColor: canvasProps.backgroundColor,
  })

  // 监听画布点击事件
  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)
  canvas.on('selection:cleared', handleSelectionCleared)

  // 监听元素变化
  canvas.on('object:modified', updateElList)
  canvas.on('object:added', updateElList)
  canvas.on('object:removed', updateElList)
}

const handleSelection = (e: any) => {
  const activeObj = canvas.getActiveObject()
  if (activeObj) {
    selectedEl.value = activeObj
    updateSelectedProps(activeObj)
  }
}

const handleSelectionCleared = () => {
  selectedEl.value = null
  Object.keys(selectedElProps).forEach(key => delete selectedElProps[key])
}

const updateSelectedProps = (obj: any) => {
  Object.keys(selectedElProps).forEach(key => delete selectedElProps[key])
  Object.assign(selectedElProps, {
    type: obj.type,
    left: Math.round(obj.left),
    top: Math.round(obj.top),
    width: Math.round(obj.width * (obj.scaleX || 1)),
    height: Math.round(obj.height * (obj.scaleY || 1)),
    fill: obj.fill || '#000000',
    stroke: obj.stroke || '',
    strokeWidth: obj.strokeWidth || 0,
    opacity: obj.opacity || 1,
    angle: Math.round(obj.angle || 0),
    fontSize: obj.fontSize || 16,
    text: obj.text || '',
  })
}

const updateElList = () => {
  elList.value = canvas.getObjects().map((obj: any, index: number) => ({
    id: obj.id || index,
    type: obj.type,
    label: `${obj.type}_${index + 1}`,
  }))
}

// 添加文本
const addText = () => {
  const text = new FabricText('双击编辑文字', {
    left: 100,
    top: 100,
    fontSize: 24,
    fill: '#000000',
  })
  canvas.add(text)
  canvas.setActiveObject(text)
  canvas.renderAll()
}

// 添加IText（可编辑文本）
const addIText = () => {
  const iText = new IText('双击编辑文字', {
    left: 100,
    top: 100,
    fontSize: 24,
    fill: '#000000',
  })
  canvas.add(iText)
  canvas.setActiveObject(iText)
  canvas.renderAll()
}

// 添加矩形
const addRect = () => {
  const rect = new Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 80,
    fill: '#409EFF',
    stroke: '',
    strokeWidth: 0,
  })
  canvas.add(rect)
  canvas.setActiveObject(rect)
  canvas.renderAll()
}

// 添加圆形
const addCircle = () => {
  const circle = new Circle({
    left: 100,
    top: 100,
    radius: 50,
    fill: '#67C23A',
    stroke: '',
    strokeWidth: 0,
  })
  canvas.add(circle)
  canvas.setActiveObject(circle)
  canvas.renderAll()
}

// 添加椭圆
const addEllipse = () => {
  const ellipse = new Ellipse({
    left: 100,
    top: 100,
    rx: 60,
    ry: 40,
    fill: '#E6A23C',
    stroke: '',
    strokeWidth: 0,
  })
  canvas.add(ellipse)
  canvas.setActiveObject(ellipse)
  canvas.renderAll()
}

// 删除选中元素
const deleteSelected = () => {
  const activeObj = canvas.getActiveObject()
  if (activeObj) {
    canvas.remove(activeObj)
    canvas.renderAll()
  }
}

// 层级操作
const bringToFront = () => {
  const activeObj = canvas.getActiveObject()
  if (activeObj) {
    // 使用 fabric 6.x 的方法
    const idx = canvas._objects.indexOf(activeObj)
    if (idx !== -1 && idx !== canvas._objects.length - 1) {
      canvas._objects.splice(idx, 1)
      canvas._objects.push(activeObj)
      canvas.renderAll()
    }
  }
}

const sendToBack = () => {
  const activeObj = canvas.getActiveObject()
  if (activeObj) {
    const idx = canvas._objects.indexOf(activeObj)
    if (idx !== -1 && idx !== 0) {
      canvas._objects.splice(idx, 1)
      canvas._objects.unshift(activeObj)
      canvas.renderAll()
    }
  }
}

const bringForward = () => {
  const activeObj = canvas.getActiveObject()
  if (activeObj) {
    const idx = canvas._objects.indexOf(activeObj)
    if (idx !== -1 && idx < canvas._objects.length - 1) {
      canvas._objects.splice(idx, 1)
      canvas._objects.splice(idx + 1, 0, activeObj)
      canvas.renderAll()
    }
  }
}

const sendBackwards = () => {
  const activeObj = canvas.getActiveObject()
  if (activeObj) {
    const idx = canvas._objects.indexOf(activeObj)
    if (idx !== -1 && idx > 0) {
      canvas._objects.splice(idx, 1)
      canvas._objects.splice(idx - 1, 0, activeObj)
      canvas.renderAll()
    }
  }
}

// 属性变更处理
const handlePropChange = (prop: string, value: any) => {
  const activeObj = canvas.getActiveObject()
  if (!activeObj) return

  if (prop === 'width') {
    activeObj.set('scaleX', value / activeObj.width)
  } else if (prop === 'height') {
    activeObj.set('scaleY', value / activeObj.height)
  } else {
    activeObj.set(prop, value)
  }
  canvas.renderAll()
  updateSelectedProps(activeObj)
}

// 画布属性变更
const handleCanvasPropChange = (prop: string, value: any) => {
  canvas.set(prop, value)
  canvas.renderAll()
}

// 导出PNG
const handleDownload = () => {
  const imageSrc = canvas.toDataURL({
    format: 'png',
    quality: 1,
  })
  const a = document.createElement('a')
  a.href = imageSrc
  a.download = 'fabric-editor.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 清空画布
const clearCanvas = () => {
  canvas.clear()
  canvas.set({
    backgroundColor: canvasProps.backgroundColor,
  })
  canvas.renderAll()
  elList.value = []
  selectedEl.value = null
}

// 保存画布到 localStorage
const saveCanvas = () => {
  try {
    const canvasJson = canvas.toJSON()
    const saveData = {
      canvasProps: canvasProps,
      objects: canvasJson.objects
    }
    localStorage.setItem('fabricCanvasData', JSON.stringify(saveData))
    ElMessage.success('画布保存成功！')
  } catch (error) {
    ElMessage.error('保存失败：' + error)
  }
}

// 从 localStorage 加载画布
const loadCanvas = () => {
  try {
    const savedData = localStorage.getItem('fabricCanvasData')
    if (!savedData) {
      ElMessage.warning('没有找到保存的画布数据')
      return
    }

    const data = JSON.parse(savedData)

    // 恢复画布属性
    if (data.canvasProps) {
      canvasProps.width = data.canvasProps.width
      canvasProps.height = data.canvasProps.height
      canvasProps.backgroundColor = data.canvasProps.backgroundColor
      canvas.set({
        width: canvasProps.width,
        height: canvasProps.height,
        backgroundColor: canvasProps.backgroundColor
      })
    }

    // 清空当前画布
    canvas.clear()
    canvas.renderAll()

    // 恢复对象
    if (data.objects && data.objects.length > 0) {
      canvas.loadFromJSON({ objects: data.objects }, () => {
        // 确保所有对象都被正确加载
        canvas.calcOffset()
        updateElList()
        canvas.renderAll()
        // 延迟再次渲染以确保完全加载
        setTimeout(() => {
          canvas.renderAll()
          canvas.requestRenderAll()
        }, 50)
        ElMessage.success('画布加载成功！')
      })
    } else {
      canvas.calcOffset()
      updateElList()
      canvas.renderAll()
      setTimeout(() => {
        canvas.renderAll()
      }, 50)
      ElMessage.success('画布加载成功！')
    }

    selectedEl.value = null
    Object.keys(selectedElProps).forEach(key => delete selectedElProps[key])

  } catch (error) {
    ElMessage.error('加载失败：' + error)
  }
}

// 检查是否有保存的画布
const hasSavedCanvas = () => {
  return localStorage.getItem('fabricCanvasData') !== null
}
</script>

<template>
  <div class="fabric-container">
    <div class="toolbar">
      <h3>工具栏</h3>
      <el-divider />
      <div class="tool-section">
        <h4>基础图形</h4>
        <div class="flex">
          <el-button type="primary" size="small" @click="addText">添加文本</el-button>
          <el-button type="primary" size="small" @click="addIText">可编辑文本</el-button>
        </div>
        <div class="flex">
          <el-button type="primary" size="small" @click="addRect">矩形</el-button>
          <el-button type="primary" size="small" @click="addCircle">圆形</el-button>
        </div>
        <div class="flex">
          <el-button type="primary" size="small" @click="addEllipse">椭圆</el-button>
        </div>
      </div>
      <el-divider />
      <div class="tool-section">
        <h4>操作</h4>
        <div class="flex">
          <el-button size="small" type="danger" @click="deleteSelected" :disabled="!selectedEl">删除选中</el-button>
          <el-button size="small" @click="clearCanvas">清空画布</el-button>
        </div>
      </div>
      <el-divider />
      <div class="tool-section">
        <h4>保存/加载</h4>
        <div class="flex">
          <el-button size="small" type="primary" @click="saveCanvas">保存画布</el-button>
          <el-button size="small" @click="loadCanvas">加载画布</el-button>
        </div>
      </div>
      <el-divider />
      <div class="tool-section">
        <h4>导出</h4>
        <div class="flex">
          <el-button size="small" type="success" @click="handleDownload">导出PNG</el-button>
        </div>
      </div>
      <el-divider />
      <div class="tool-section">
        <h4>元素列表</h4>
        <div class="el-list">
          <div v-for="el in elList" :key="el.id" class="el-item"
            :class="{ active: selectedEl && selectedEl.id === el.id }" @click="() => {
              const obj = canvas.getObjects().find((o: any) => o.id === el.id)
              if (obj) {
                canvas.setActiveObject(obj)
                canvas.renderAll()
              }
            }">
            {{ el.label }}
          </div>
          <div v-if="elList.length === 0" class="empty-text">暂无元素</div>
        </div>
      </div>
    </div>
    <div class="canvas-box" ref="canvasBoxRef">
      <canvas id="canvas"></canvas>
    </div>
    <div class="operate-area">
      <h3>属性设置</h3>
      <el-tabs>
        <el-tab-pane label="元素属性" v-if="selectedEl">
          <div class="prop-group">
            <div class="prop-item">
              <label>类型</label>
              <span>{{ selectedElProps.type }}</span>
            </div>
            <div class="prop-item">
              <label>左边距</label>
              <el-input-number v-model="selectedElProps.left" :min="0" size="small"
                @change="(val) => handlePropChange('left', val)" />
            </div>
            <div class="prop-item">
              <label>顶边距</label>
              <el-input-number v-model="selectedElProps.top" :min="0" size="small"
                @change="(val) => handlePropChange('top', val)" />
            </div>
            <div class="prop-item">
              <label>宽度</label>
              <el-input-number v-model="selectedElProps.width" :min="1" size="small"
                @change="(val) => handlePropChange('width', val)" />
            </div>
            <div class="prop-item">
              <label>高度</label>
              <el-input-number v-model="selectedElProps.height" :min="1" size="small"
                @change="(val) => handlePropChange('height', val)" />
            </div>
            <div class="prop-item">
              <label>旋转角度</label>
              <el-input-number v-model="selectedElProps.angle" :min="0" :max="360" size="small"
                @change="(val) => handlePropChange('angle', val)" />
            </div>
            <div class="prop-item">
              <label>填充颜色</label>
              <el-color-picker v-model="selectedElProps.fill" size="small"
                @change="(val) => handlePropChange('fill', val)" />
            </div>
            <div class="prop-item">
              <label>边框颜色</label>
              <el-color-picker v-model="selectedElProps.stroke" size="small"
                @change="(val) => handlePropChange('stroke', val)" />
            </div>
            <div class="prop-item">
              <label>边框宽度</label>
              <el-input-number v-model="selectedElProps.strokeWidth" :min="0" size="small"
                @change="(val) => handlePropChange('strokeWidth', val)" />
            </div>
            <div class="prop-item">
              <label>透明度</label>
              <el-slider v-model="selectedElProps.opacity" :min="0" :max="1" :step="0.1" size="small"
                @change="(val) => handlePropChange('opacity', val)" />
            </div>
            <template v-if="selectedElProps.type === 'i-text' || selectedElProps.type === 'text'">
              <div class="prop-item">
                <label>字体大小</label>
                <el-input-number v-model="selectedElProps.fontSize" :min="8" :max="200" size="small"
                  @change="(val) => handlePropChange('fontSize', val)" />
              </div>
            </template>
            <el-divider />
            <div class="prop-item">
              <label>层级</label>
              <div class="z-index-buttons">
                <div class="flex">
                  <el-button size="small" @click="sendToBack">到底部</el-button>
                  <el-button size="small" @click="bringToFront">到顶部</el-button>
                </div>
                <div class="flex">
                  <el-button size="small" @click="bringForward">上移</el-button>
                  <el-button size="small" @click="sendBackwards">下移</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="元素属性" v-else>
          <div class="empty-text">请先选中元素</div>
        </el-tab-pane>
        <el-tab-pane label="画布属性">
          <div class="prop-group">
            <div class="prop-item">
              <label>画布宽度</label>
              <el-input-number v-model="canvasProps.width" :min="100" :max="4000" size="small"
                @change="(val) => handleCanvasPropChange('width', val)" />
            </div>
            <div class="prop-item">
              <label>画布高度</label>
              <el-input-number v-model="canvasProps.height" :min="100" :max="4000" size="small"
                @change="(val) => handleCanvasPropChange('height', val)" />
            </div>
            <div class="prop-item">
              <label>背景颜色</label>
              <el-color-picker v-model="canvasProps.backgroundColor" size="small"
                @change="(val) => handleCanvasPropChange('backgroundColor', val)" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="less">
.flex {
  display: flex;
}

.fabric-container {
  height: 100%;
  display: flex;

  .toolbar {
    width: 220px;
    height: 100%;
    overflow: auto;
    padding: 16px;
    background: #fff;
    border-right: 1px solid #e8e8e8;

    h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }

    .tool-section {
      margin-bottom: 16px;

      h4 {
        margin: 8px 0;
        font-size: 13px;
        color: #666;
      }

      .el-button {
        margin-bottom: 8px;
        width: 100%;
      }
    }

    .el-list {
      max-height: 200px;
      overflow-y: auto;

      .el-item {
        padding: 8px 12px;
        margin-bottom: 4px;
        background: #f5f5f5;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;

        &:hover {
          background: #e8e8e8;
        }

        &.active {
          background: #409EFF;
          color: #fff;
        }
      }

      .empty-text {
        color: #999;
        font-size: 13px;
        text-align: center;
        padding: 16px 0;
      }
    }
  }

  .canvas-box {
    flex: 1;
    height: 100%;
    overflow: auto;
    background: #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;

    canvas {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .operate-area {
    width: 260px;
    height: 100%;
    overflow: auto;
    padding: 16px;
    background: #fff;
    border-left: 1px solid #e8e8e8;

    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .prop-group {
      .prop-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        flex-wrap: wrap;

        label {
          font-size: 13px;
          color: #666;
          min-width: 60px;
        }

        .el-input-number,
        .el-slider {
          flex: 1;
          margin-left: 8px;
        }

        .el-color-picker {
          margin-left: 8px;
        }

        .z-index-buttons {
          flex: 1;
          margin-left: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;

          .el-button {
            flex: 1;
            min-width: 0;
          }
        }
      }
    }

    .empty-text {
      color: #999;
      font-size: 13px;
      text-align: center;
      padding: 32px 0;
    }
  }
}
</style>
