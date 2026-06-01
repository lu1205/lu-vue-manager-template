<template>
  <div class="cinema-seat-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button class="tool-btn" @click="addRow">➕ 添加行</button>
        <button class="tool-btn" @click="addColumn">➕ 添加列</button>
        <button class="tool-btn danger" @click="removeRow">➖ 删除行</button>
        <button class="tool-btn danger" @click="removeColumn">➖ 删除列</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn primary" @click="addHorizontalAisle">📏 添加横向过道</button>
        <button class="tool-btn primary" @click="addVerticalAisle">📐 添加纵向过道</button>
        <button class="tool-btn warning" @click="clearAisles">🗑️ 清除所有过道</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" @click="toggleSeatStatus">🪑 切换座位状态</button>
        <button class="tool-btn" @click="clearAll">🗑️ 清空所有</button>
        <button class="tool-btn" @click="exportData">💾 导出配置</button>
        <button class="tool-btn" @click="triggerImport">📂 导入配置</button>
        <input
          ref="importFileInput"
          type="file"
          style="display:none"
          accept=".json"
          @change="importData"
        >
      </div>
    </div>

    <!-- 信息栏 -->
    <div class="info-bar">
      <div class="stats">
        <div>📊 总座位数: <span>{{ totalSeats }}</span></div>
        <div>✅ 可用座位: <span>{{ availableSeats }}</span></div>
        <div>❌ 禁用座位: <span>{{ disabledSeats }}</span></div>
        <div>🛤️ 横向过道: <span>{{ horizontalAisleCount }}</span></div>
        <div>📏 纵向过道: <span>{{ verticalAisleCount }}</span></div>
      </div>
      <div class="current-mode">
        当前模式: <span style="color:#3498db; font-weight:bold">编辑模式</span>
        <span style="font-size:12px; color:#7f8c8d">(点击座位可编辑，点击过道可删除)</span>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-area">
      <div class="screen">
        <div class="screen-text">🎬 银 幕 🎬</div>
      </div>
      <div class="seats-wrapper">
        <div class="seats-grid">
          <template v-for="i in rows" :key="'row-' + i">
            <!-- 横向过道 -->
            <div
              v-if="horizontalAisles.has(i - 1)"
              class="aisle-horizontal"
              :data-position="i - 1"
              @click="deleteHorizontalAisle(i - 1)"
            >
              🛤️ {{ getHorizontalAisleText(i - 1) }}
            </div>

            <!-- 座位行 -->
            <div class="seat-row">
              <div class="row-label">{{ getRowCode(i - 1) }}</div>
              <div class="seats-container">
                <template v-for="j in cols" :key="'seat-' + i + '-' + j">
                  <!-- 纵向过道 -->
                  <div
                    v-if="verticalAisles.has(j - 1)"
                    class="aisle-vertical"
                    :data-position="j - 1"
                    @click="deleteVerticalAisle(j - 1)"
                    :title="getVerticalAisleText(j - 1)"
                  >
                    🛤️
                  </div>

                  <!-- 座位 -->
                  <div
                    class="seat"
                    :class="{
                      'disabled': seats[i-1] && seats[i-1][j-1]?.status === 'disabled',
                      'selected-for-edit': selectedSeat && selectedSeat.row === i-1 && selectedSeat.col === j-1
                    }"
                    @click="onSeatClick(i-1, j-1)"
                    :title="getSeatTitle(i-1, j-1)"
                  >
                    <template v-if="seats[i-1] && seats[i-1][j-1]?.status === 'available' && seats[i-1][j-1]?.id">
                      {{ seats[i-1][j-1].id }}
                    </template>
                    <template v-else>
                      ✕
                    </template>
                  </div>
                </template>

                <!-- 最后一列后的纵向过道 -->
                <div
                  v-if="verticalAisles.has(cols)"
                  class="aisle-vertical"
                  @click="deleteVerticalAisle(cols)"
                  :title="getVerticalAisleText(cols)"
                >
                  🛤️
                </div>
              </div>
            </div>
          </template>

          <!-- 最后一行后的横向过道 -->
          <div
            v-if="horizontalAisles.has(rows)"
            class="aisle-horizontal"
            @click="deleteHorizontalAisle(rows)"
          >
            🛤️ {{ getHorizontalAisleText(rows) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧属性面板 -->
    <div
      class="properties-panel"
      v-show="selectedSeat"
      ref="propertiesPanel"
    >
      <div class="panel-title">座位属性</div>
      <div class="property-item">
        <label class="property-label">座位编号</label>
        <input type="text" class="property-value" :value="selectedSeatNumber" readonly>
      </div>
      <div class="property-item">
        <label class="property-label">座位状态</label>
        <select class="property-value" v-model="selectedSeatStatus" @change="updateSeatStatus">
          <option value="available">可用</option>
          <option value="disabled">禁用/损坏</option>
        </select>
      </div>
      <div class="property-item">
        <button class="tool-btn danger" style="width:100%" @click="deleteCurrentSeat">删除此座位</button>
      </div>
      <div class="row-stats" v-if="selectedSeat">
        📊 {{ getRowCode(selectedSeat.row) }}排统计：<br>
        总座位数: {{ getRowStats(selectedSeat.row).total }} |
        可用: {{ getRowStats(selectedSeat.row).available }} |
        已编号: {{ getRowStats(selectedSeat.row).numbered }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  initialRows: {
    type: Number,
    default: 6
  },
  initialCols: {
    type: Number,
    default: 8
  },
  hallName: {
    type: String,
    default: '1号厅'
  }
})

// Emits
const emit = defineEmits(['update:layout', 'update:stats'])

// 响应式数据
const rows = ref(props.initialRows)
const cols = ref(props.initialCols)
const seats = ref([])
const horizontalAisles = ref(new Set())
const verticalAisles = ref(new Set())
const selectedSeat = ref(null)
const importFileInput = ref(null)
const propertiesPanel = ref(null)

// 计算属性
const totalSeats = computed(() => {
  let total = 0
  for (let i = 0; i < rows.value; i++) {
    for (let j = 0; j < cols.value; j++) {
      total++
    }
  }
  return total
})

const availableSeats = computed(() => {
  let available = 0
  for (let i = 0; i < rows.value; i++) {
    for (let j = 0; j < cols.value; j++) {
      if (seats.value[i]?.[j]?.status === 'available') {
        available++
      }
    }
  }
  return available
})

const disabledSeats = computed(() => {
  return totalSeats.value - availableSeats.value
})

const horizontalAisleCount = computed(() => horizontalAisles.value.size)
const verticalAisleCount = computed(() => verticalAisles.value.size)

const selectedSeatNumber = computed(() => {
  if (!selectedSeat.value) return ''
  const seat = seats.value[selectedSeat.value.row]?.[selectedSeat.value.col]
  if (seat?.status === 'available' && seat?.id) {
    return seat.id
  }
  return '未分配（禁用座位）'
})

const selectedSeatStatus = computed({
  get: () => {
    if (!selectedSeat.value) return 'available'
    return seats.value[selectedSeat.value.row]?.[selectedSeat.value.col]?.status || 'available'
  },
  set: (value) => {
    if (selectedSeat.value) {
      updateSeatStatusValue(value)
    }
  }
})

// 初始化座位
const initSeats = () => {
  seats.value = []
  for (let i = 0; i < rows.value; i++) {
    seats.value[i] = []
    for (let j = 0; j < cols.value; j++) {
      seats.value[i][j] = {
        id: null,
        row: i,
        col: j,
        rowCode: String.fromCharCode(65 + i),
        colNumber: j + 1,
        status: 'available',
        selected: false
      }
    }
  }
  updateSeatNumbers()
}

// 更新座位编号（每行独立编号）
const updateSeatNumbers = () => {
  for (let i = 0; i < rows.value; i++) {
    let seatCounter = 1
    for (let j = 0; j < cols.value; j++) {
      if (seats.value[i][j].status === 'available') {
        seats.value[i][j].id = `${seats.value[i][j].rowCode}${seatCounter}`
        seats.value[i][j].seatNumber = seatCounter
        seatCounter++
      } else {
        seats.value[i][j].id = null
        seats.value[i][j].seatNumber = null
      }
    }
  }
  emitLayoutUpdate()
}

// 获取行代码
const getRowCode = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex)
}

// 获取座位标题
const getSeatTitle = (row, col) => {
  const seat = seats.value[row]?.[col]
  if (seat?.status === 'available' && seat?.id) {
    return `座位 ${seat.id}`
  }
  return '禁用座位（不占座位号）'
}

// 获取横向过道文本
const getHorizontalAisleText = (position) => {
  if (position === 0) return '屏幕前过道'
  if (position === rows.value) return '最后排后过道'
  return `第${position}排后过道`
}

// 获取纵向过道文本
const getVerticalAisleText = (position) => {
  if (position === 0) return '最左侧过道 - 点击删除'
  if (position === cols.value) return '最右侧过道 - 点击删除'
  return `第${position}列后过道 - 点击删除`
}

// 获取行统计
const getRowStats = (rowIndex) => {
  let total = 0
  let available = 0
  let numbered = 0

  for (let j = 0; j < cols.value; j++) {
    total++
    if (seats.value[rowIndex][j].status === 'available') {
      available++
      if (seats.value[rowIndex][j].id) {
        numbered++
      }
    }
  }

  return { total, available, numbered }
}

// 座位点击
const onSeatClick = (row, col) => {
  selectedSeat.value = { row, col, data: seats.value[row][col] }
}

// 更新座位状态
const updateSeatStatusValue = (newStatus) => {
  if (!selectedSeat.value) return

  const oldStatus = seats.value[selectedSeat.value.row][selectedSeat.value.col].status
  if (oldStatus !== newStatus) {
    seats.value[selectedSeat.value.row][selectedSeat.value.col].status = newStatus
    updateSeatNumbers()
  }
}

const updateSeatStatus = () => {
  updateSeatStatusValue(selectedSeatStatus.value)
}

// 删除当前座位
const deleteCurrentSeat = () => {
  if (!selectedSeat.value) return

  if (seats.value[selectedSeat.value.row][selectedSeat.value.col].status !== 'disabled') {
    seats.value[selectedSeat.value.row][selectedSeat.value.col].status = 'disabled'
    updateSeatNumbers()
    selectedSeat.value = null
  } else {
    alert('该座位已经是禁用状态')
  }
}

// 切换座位状态
const toggleSeatStatus = () => {
  if (!selectedSeat.value) {
    alert('请先点击选择一个座位')
    return
  }

  const currentStatus = seats.value[selectedSeat.value.row][selectedSeat.value.col].status
  const newStatus = currentStatus === 'available' ? 'disabled' : 'available'
  seats.value[selectedSeat.value.row][selectedSeat.value.col].status = newStatus
  updateSeatNumbers()
}

// 添加行
const addRow = () => {
  if (rows.value >= 26) {
    alert('最多支持26行！')
    return
  }

  const newRow = []
  for (let j = 0; j < cols.value; j++) {
    newRow.push({
      id: null,
      row: rows.value,
      col: j,
      rowCode: String.fromCharCode(65 + rows.value),
      colNumber: j + 1,
      status: 'available',
      selected: false
    })
  }

  seats.value.push(newRow)
  rows.value++
  updateSeatNumbers()
}

// 删除行
const removeRow = () => {
  if (rows.value <= 1) {
    alert('至少保留1行！')
    return
  }

  // 调整过道位置
  const newHorizontalAisles = new Set()
  for (let pos of horizontalAisles.value) {
    if (pos < rows.value - 1) {
      newHorizontalAisles.add(pos)
    } else if (pos === rows.value - 1) {
      newHorizontalAisles.add(pos)
    } else if (pos === rows.value) {
      newHorizontalAisles.add(rows.value - 1)
    }
  }

  horizontalAisles.value = newHorizontalAisles
  seats.value.pop()
  rows.value--
  updateSeatNumbers()
}

// 添加列
const addColumn = () => {
  if (cols.value >= 20) {
    alert('最多支持20列！')
    return
  }

  for (let i = 0; i < rows.value; i++) {
    seats.value[i].push({
      id: null,
      row: i,
      col: cols.value,
      rowCode: String.fromCharCode(65 + i),
      colNumber: cols.value + 1,
      status: 'available',
      selected: false
    })
  }

  cols.value++
  updateSeatNumbers()
}

// 删除列
const removeColumn = () => {
  if (cols.value <= 1) {
    alert('至少保留1列！')
    return
  }

  // 调整纵向过道位置
  const newVerticalAisles = new Set()
  for (let pos of verticalAisles.value) {
    if (pos < cols.value - 1) {
      newVerticalAisles.add(pos)
    } else if (pos === cols.value - 1) {
      newVerticalAisles.add(pos)
    } else if (pos === cols.value) {
      newVerticalAisles.add(cols.value - 1)
    }
  }

  verticalAisles.value = newVerticalAisles

  for (let i = 0; i < rows.value; i++) {
    seats.value[i].pop()
  }

  cols.value--
  updateSeatNumbers()
}

// 添加横向过道
const addHorizontalAisle = () => {
  let position = prompt('请输入过道位置（行号之后，0-' + rows.value + '）:\n0=屏幕前\n1=第1排后\n2=第2排后\n...\n' + rows.value + '=最后排后', '3')

  if (position === null) return

  position = parseInt(position)
  if (isNaN(position) || position < 0 || position > rows.value) {
    alert(`请输入0到${rows.value}之间的数字`)
    return
  }

  if (horizontalAisles.value.has(position)) {
    alert('该位置已存在过道')
    return
  }

  horizontalAisles.value.add(position)
}

// 删除横向过道
const deleteHorizontalAisle = (position) => {
  if (confirm(`确定要删除${getHorizontalAisleText(position)}吗？`)) {
    horizontalAisles.value.delete(position)
  }
}

// 添加纵向过道
const addVerticalAisle = () => {
  let position = prompt('请输入过道位置（列号之后，0-' + cols.value + '）:\n0=最左侧\n1=第1列后\n2=第2列后\n...\n' + cols.value + '=最右侧', '4')

  if (position === null) return

  position = parseInt(position)
  if (isNaN(position) || position < 0 || position > cols.value) {
    alert(`请输入0到${cols.value}之间的数字`)
    return
  }

  if (verticalAisles.value.has(position)) {
    alert('该位置已存在过道')
    return
  }

  verticalAisles.value.add(position)
}

// 删除纵向过道
const deleteVerticalAisle = (position) => {
  if (confirm(`确定要删除${getVerticalAisleText(position)}吗？`)) {
    verticalAisles.value.delete(position)
  }
}

// 清除所有过道
const clearAisles = () => {
  if (confirm('确定要清除所有过道吗？')) {
    horizontalAisles.value.clear()
    verticalAisles.value.clear()
  }
}

// 清空所有
const clearAll = () => {
  if (confirm('确定要清空所有座位吗？这将重置为默认布局。')) {
    rows.value = props.initialRows
    cols.value = props.initialCols
    horizontalAisles.value.clear()
    verticalAisles.value.clear()
    initSeats()
  }
}

// 导出数据
const exportData = () => {
  const config = {
    hallName: props.hallName,
    rows: rows.value,
    cols: cols.value,
    horizontalAisles: Array.from(horizontalAisles.value),
    verticalAisles: Array.from(verticalAisles.value),
    seats: seats.value.map(row =>
      row.map(seat => ({
        rowCode: seat.rowCode,
        colNumber: seat.colNumber,
        status: seat.status
      }))
    ),
    exportTime: new Date().toISOString()
  }

  const dataStr = JSON.stringify(config, null, 2)
  const blob = new Blob([dataStr], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cinema_seats_${config.hallName}_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  alert('导出成功！')
}

// 触发导入
const triggerImport = () => {
  importFileInput.value.click()
}

// 导入数据
const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result)
      rows.value = config.rows
      cols.value = config.cols

      // 重建座位数据
      seats.value = []
      for (let i = 0; i < rows.value; i++) {
        seats.value[i] = []
        for (let j = 0; j < cols.value; j++) {
          const importedSeat = config.seats[i][j]
          seats.value[i][j] = {
            id: null,
            row: i,
            col: j,
            rowCode: importedSeat.rowCode,
            colNumber: importedSeat.colNumber,
            status: importedSeat.status,
            selected: false
          }
        }
      }

      horizontalAisles.value = new Set(config.horizontalAisles || [])
      verticalAisles.value = new Set(config.verticalAisles || [])

      // 重新生成座位编号
      updateSeatNumbers()
      alert('导入成功！')
    } catch (error) {
      alert('导入失败：配置文件格式错误')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

// 触发布局更新事件
const emitLayoutUpdate = () => {
  const layoutData = {
    rows: rows.value,
    cols: cols.value,
    seats: seats.value,
    horizontalAisles: Array.from(horizontalAisles.value),
    verticalAisles: Array.from(verticalAisles.value),
    totalSeats: totalSeats.value,
    availableSeats: availableSeats.value
  }
  emit('update:layout', layoutData)
  emit('update:stats', {
    total: totalSeats.value,
    available: availableSeats.value,
    disabled: disabledSeats.value
  })
}

// 点击外部关闭属性面板
const handleClickOutside = (event) => {
  if (propertiesPanel.value && !propertiesPanel.value.contains(event.target) &&
      !event.target.classList.contains('seat')) {
    selectedSeat.value = null
  }
}

// 生命周期
onMounted(() => {
  initSeats()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.cinema-seat-editor {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
  position: relative;
}

.toolbar {
  background: #2c3e50;
  padding: 15px 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 3px solid #3498db;
}

.tool-group {
  display: flex;
  gap: 10px;
  background: rgba(255,255,255,0.1);
  padding: 8px 15px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.tool-btn {
  background: #34495e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.tool-btn:hover {
  background: #3498db;
  transform: translateY(-2px);
}

.tool-btn.primary {
  background: #27ae60;
}

.tool-btn.danger {
  background: #e74c3c;
}

.tool-btn.warning {
  background: #f39c12;
}

.info-bar {
  background: #ecf0f1;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stats span {
  color: #2c3e50;
  font-weight: bold;
}

.canvas-area {
  padding: 30px;
  background: #f5f5f5;
  overflow-x: auto;
}

.screen {
  text-align: center;
  margin-bottom: 40px;
}

.screen-text {
  background: #34495e;
  color: white;
  display: inline-block;
  padding: 12px 60px;
  border-radius: 10px 10px 20px 20px;
  font-size: 18px;
  letter-spacing: 4px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.seats-wrapper {
  display: flex;
  justify-content: center;
}

.seats-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.seat-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.row-label {
  width: 40px;
  font-weight: bold;
  color: #7f8c8d;
  font-size: 16px;
  text-align: center;
}

.seats-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.seat {
  width: 50px;
  height: 50px;
  background: #4CAF50;
  border-radius: 8px 8px 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  position: relative;
}

.seat:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.seat.disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

.seat.disabled:hover {
  transform: none;
}

.seat.selected-for-edit {
  background: #f39c12;
  box-shadow: 0 0 0 3px #e67e22;
}

.aisle-horizontal {
  width: 100%;
  height: 30px;
  background: repeating-linear-gradient(
    45deg,
    #ecf0f1,
    #ecf0f1 10px,
    #bdc3c7 10px,
    #bdc3c7 20px
  );
  margin: 5px 0;
  text-align: center;
  line-height: 30px;
  color: #7f8c8d;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.aisle-horizontal:hover {
  background: repeating-linear-gradient(
    45deg,
    #e74c3c,
    #e74c3c 10px,
    #c0392b 10px,
    #c0392b 20px
  );
  color: white;
  transform: scale(1.01);
}

.aisle-vertical {
  width: 30px;
  height: 50px;
  background: repeating-linear-gradient(
    135deg,
    #ecf0f1,
    #ecf0f1 10px,
    #bdc3c7 10px,
    #bdc3c7 20px
  );
  margin: 0 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.2s;
}

.aisle-vertical:hover {
  background: repeating-linear-gradient(
    135deg,
    #e74c3c,
    #e74c3c 10px,
    #c0392b 10px,
    #c0392b 20px
  );
  color: white;
  transform: scale(1.05);
}

.properties-panel {
  position: fixed;
  right: 20px;
  top: 100px;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  padding: 20px;
  z-index: 100;
}

.panel-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
}

.property-item {
  margin-bottom: 15px;
}

.property-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
  display: block;
}

.property-value {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.row-stats {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .seat {
    width: 35px;
    height: 35px;
    font-size: 10px;
  }
  .aisle-vertical {
    width: 20px;
  }
  .properties-panel {
    position: fixed;
    top: auto;
    bottom: 20px;
    right: 20px;
    left: 20px;
    width: auto;
  }
}
</style>
