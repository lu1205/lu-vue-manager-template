<script setup lang="ts">
import { ref, computed } from 'vue'
import { downloadFileStream } from '@/api'
import { useUserStore } from '@/store/user'
import streamSaver from 'streamsaver'

const handleDownload = async () => {
  const res = await downloadFileStream()
  // 获取文件名
  const fileName = decodeURIComponent(res.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, ''))
  // 处理文件流
  const blob = res.data
  const url = URL.createObjectURL(new Blob([blob]))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  // 下载完成后，释放内存
  a.remove()
  URL.revokeObjectURL(url)
}


const percentage = ref(0)
const downloadFileName = ref('')
const handleDownload2 = async () => {
  const url = location.origin + '/vue/other/getFileStream'
  fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": useUserStore().getToken()
    }
  })
    .then(async (res: any) => {
      console.log('res', res)
      // 获取文件名
      const fileName = decodeURIComponent(res.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, ''))
      downloadFileName.value = fileName
      const fileStream = streamSaver.createWriteStream(fileName)
      //  读取数据块
      const writer = fileStream.getWriter();
      const reader = res.body.getReader();
      // 文件大小 注意转为数字
      const contentLength = +res.headers.get("Content-Length");
      let receivedLength = 0; // 已下载的字节数
      // 在 body 下载时，一直为无限循环
      while (true) {
        // 当最后一块下载完成时，done 值为 true
        // value 是块字节的 Uint8Array
        const { done, value } = await reader.read();
        if (done) break;
        receivedLength += value.length; // 累加已下载的字节数
        const progress = Math.round((receivedLength / contentLength) * 100);
        percentage.value = progress
        console.log(`Progress: ${progress}%`, value.length);
        await writer.write(value); //数据逐块写入文件
      }
      await writer.close(); // 关闭文件写入流 触发浏览器弹出文件保存对话框。
      console.log("Download complete");
    }).catch((err) => {
      console.log(err)
    })
}
</script>

<template>
  <div class="download-container">
    <div>
      <el-button type="primary" @click="handleDownload">下载文件(a标签)</el-button>
      <el-button type="primary" @click="handleDownload2">下载文件(streamSaver)</el-button>
    </div>
    <div class="download-progress-card-container">
      <div v-if="downloadFileName" class="download-progress-card">
        <el-progress :percentage="percentage" :stroke-width="15" />
        <div class="download-file-name">下载文件名：{{ downloadFileName }}</div>
      </div>
      <div class="tips-text">
        点击【下载文件(streamSaver)】按钮展示下载进度
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.download-container {
  padding: 20px;
}

.download-progress-card-container {
  margin-top: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 5px;
}

.download-progress-card {
  border-radius: 5px;
  padding: 10px;
  background-color: #f5f7fa;
}

.download-file-name {
  font-size: 14px;
  color: #909399;
}

.tips-text {
  font-size: 14px;
  color: #909399;
}
</style>
