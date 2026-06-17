<script setup lang="ts">
import { ref } from 'vue'
import { getSeatMapDetail, getRoomList, getSelectedSeats } from '@/api'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

// 查询表单实例
const queryFormRef = ref()
// 查询参数
const queryParams = ref({
  roomId: '',
  date: dayjs().format('YYYY-MM-DD'),
})

const roomList = ref([])
// 房间列表
const getRoomListData = async () => {
  const res = await getRoomList({
    pageNum: 1,
    pageSize: 100,
  }, {})
  if (res.code === 200) {
    roomList.value = res.data.list
  }
}
getRoomListData()

const seatData = ref({})

// 获取房间座位数据
const getData = async () => {
  const res = await getSeatMapDetail({ id: queryParams.value.roomId })
  if (res.code === 200) {
    seatData.value = {
      ...res.data,
      seatMap: JSON.parse(res.data.seatMap),
    }
    getSelectedSeatsData()
  }
}

const selectedSeatsSync = ref([])
// 获取已选座位
const getSelectedSeatsData = async () => {
  const res = await getSelectedSeats({
    roomId: queryParams.value.roomId,
    date: queryParams.value.date,
  })
  if (res.code === 200) {
    selectedSeatsSync.value = res.data
    // 座位状态更新，去除已选中的(seatData.value?.seatMap?.seats为二维数组)
    updateSeatStatus(seatData?.value?.seatMap?.seats, selectedSeatsSync.value)
    drawSeatMap()
  }
}

/**
 * 更新座位房间座位状态
 * @param sourceData 座位数据(二维数组)
 * @param list 已选座位列表
 */
const updateSeatStatus = (sourceData: any[][], list: any[]) => {
  if (!sourceData || !list) return
  // sourceData为二维数组，每个元素为座位对象
  // list为已选座位列表，每个元素为座位对象
  // 通过二维数组的每个座位对象的id与list中座位对象的seatName进行比较，若相同则座位已被选择，状态设置为occupied
  sourceData.forEach((itemList) => {
    itemList.forEach((item) => {
      const { id: seatName } = item
      const index = list.findIndex((seat) => seat.seatName === seatName)
      if (index >= 0) {
        item.status = 'occupied'
      }
    })
  })
}

// 查询
const handleQuery = () => {
  clearCanvas()
  getData()
}
// 重置表单
const resetForm = (formEl: any) => {
  if (!formEl) return
  formEl.resetFields()
  clearCanvas()
}

// 清空canvas座位图
const clearCanvas = () => {
  selectedSeatsSync.value = []
  selectedSeats.value = []
  const canvas = document.querySelector('.seats-area')?.querySelector('#seats-canvas') as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const selectedSeats = ref([])

// 绘制canvas座位图
const drawSeatMap = () => {
  const { seatMap } = seatData.value
  if (!seatMap) return
  const { rows, cols, seats, horizontalAisles, verticalAisles } = seatMap
  const seatsArea = document.querySelector('.seats-area')
  if (!seatsArea) return
  const canvas = seatsArea.querySelector('#seats-canvas') as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const seatSize = 40
  const seatGap = 10
  const aisleWidth = 40
  const padding = 30

  let totalWidth = padding * 2
  let totalHeight = padding * 2

  for (let col = 0; col < cols; col++) {
    totalWidth += seatSize + seatGap
    if (verticalAisles.includes(col + 1)) {
      totalWidth += aisleWidth
    }
  }
  totalWidth -= seatGap

  for (let row = 0; row < rows; row++) {
    totalHeight += seatSize + seatGap
    if (horizontalAisles.includes(row + 1)) {
      totalHeight += aisleWidth
    }
  }
  totalHeight -= seatGap

  canvas.width = totalWidth
  canvas.height = totalHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f0f2f5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let currentX = padding
  let currentY = padding

  const drawAisle = (startX: number, startY: number, width: number, height: number, isHorizontal: boolean) => {
    const gradient = isHorizontal
      ? ctx.createLinearGradient(startX, startY, startX, startY + height)
      : ctx.createLinearGradient(startX, startY, startX + width, startY)
    gradient.addColorStop(0, '#e8eaed')
    gradient.addColorStop(0.5, '#dcdfe6')
    gradient.addColorStop(1, '#e8eaed')
    ctx.fillStyle = gradient
    ctx.fillRect(startX, startY, width, height)

    ctx.fillStyle = '#c0c4cc'
    ctx.beginPath()
    if (isHorizontal) {
      for (let x = startX + 10; x < startX + width - 10; x += 15) {
        ctx.moveTo(x, startY + height / 2 - 5)
        ctx.lineTo(x + 10, startY + height / 2)
        ctx.lineTo(x, startY + height / 2 + 5)
      }
    } else {
      for (let y = startY + 10; y < startY + height - 10; y += 15) {
        ctx.moveTo(startX + width / 2 - 5, y)
        ctx.lineTo(startX + width / 2, y + 10)
        ctx.lineTo(startX + width / 2 + 5, y)
      }
    }
    ctx.fill()
  }

  for (let row = 0; row < rows; row++) {
    currentX = padding

    for (let col = 0; col < cols; col++) {
      const seat = seats[row][col]

      if (seat.status === 'available') {
        ctx.fillStyle = '#67C23A'
      } else if (seat.status === 'disabled') {
        ctx.fillStyle = '#909399'
      } else if (seat.status === 'occupied') {
        ctx.fillStyle = '#F56C6C'
      } else {
        ctx.fillStyle = '#409EFF'
      }

      if (seat.selected) {
        ctx.fillStyle = '#409EFF'
      }

      ctx.fillRect(currentX, currentY, seatSize, seatSize)

      ctx.strokeStyle = '#303133'
      ctx.lineWidth = 2
      ctx.strokeRect(currentX, currentY, seatSize, seatSize)

      if (seat.id) {
        ctx.fillStyle = '#fff'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(seat.id, currentX + seatSize / 2, currentY + seatSize / 2)
      }

      currentX += seatSize + seatGap

      if (verticalAisles.includes(col + 1)) {
        drawAisle(currentX, padding, aisleWidth, totalHeight - padding * 2, false)
        currentX += aisleWidth
      }
    }

    currentY += seatSize + seatGap

    if (horizontalAisles.includes(row + 1)) {
      drawAisle(padding, currentY, totalWidth - padding * 2, aisleWidth, true)
      currentY += aisleWidth
    }
  }

  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let clickX = padding
    let clickY = padding

    for (let row = 0; row < rows; row++) {
      clickX = padding

      for (let col = 0; col < cols; col++) {
        const seat = seats[row][col]

        if (x >= clickX && x <= clickX + seatSize && y >= clickY && y <= clickY + seatSize) {
          if (seat.status === 'available') {
            seat.selected = !seat.selected
            if (seat.selected) {
              selectedSeats.value.push(seat)
            } else {
              selectedSeats.value = selectedSeats.value.filter((item) => item.id !== seat.id)
            }
          }
          drawSeatMap()
          return
        }

        clickX += seatSize + seatGap

        if (verticalAisles.includes(col + 1)) {
          clickX += aisleWidth
        }
      }

      clickY += seatSize + seatGap

      if (horizontalAisles.includes(row + 1)) {
        clickY += aisleWidth
      }
    }
  }
}

// 保存
const handleSubmit = async () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.error('请选择座位')
    return
  }
}
</script>

<template>
  <div class="table-page-wrapper">
    <div class="query-form">
      <el-form :model="queryParams" ref="queryFormRef" inline>
        <el-form-item label="房间" prop="roomId" style="width: 240px">
          <el-select v-model="queryParams.roomId" @change="handleQuery" placeholder="请选择房间">
            <el-option v-for="item in roomList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date" style="width: 240px">
          <el-date-picker v-model="queryParams.date" :clearable="false" @change="handleQuery" type="date"
            value-format="YYYY-MM-DD" placeholder="选择日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="info" @click="resetForm(queryFormRef)">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <div class="action-left"></div>
        <div class="action-right">
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </div>
      <div class="seats-area">
        <canvas id="seats-canvas" width="500" height="500"></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.seats-area {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}
</style>
