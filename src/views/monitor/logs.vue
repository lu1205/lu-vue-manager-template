<script setup lang="ts">
import { getLogDetail, getLogList } from '@/api'
import { ref, computed } from 'vue'

// 查询表单实例
const queryFormRef = ref()
// 查询参数
const queryParams = ref({
  module: '',
})
// 分页参数
const pageParams = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
})
// 列表数据
const tableData = ref([])
const allColumns = [
  {
    label: '操作人',
    prop: 'username',
    minWidth: 80,
  },
  {
    label: '操作模块',
    prop: 'module',
    width: 80,
  },
  {
    label: '操作类型',
    prop: 'type',
    minWidth: 100,
    showOverflowTooltip: true,
  },
  {
    label: '请求类型',
    prop: 'method',
    width: 80,
  },
  {
    label: '请求地址',
    prop: 'path',
    minWidth: 200,
    showOverflowTooltip: true,
  },
  {
    label: '请求query',
    prop: 'query',
    minWidth: 120,
    showOverflowTooltip: true,
  },
  {
    label: '请求params',
    prop: 'params',
    minWidth: 120,
    showOverflowTooltip: true,
  },
  {
    label: '请求body',
    prop: 'body',
    minWidth: 120,
    showOverflowTooltip: true,
  },
  {
    label: '操作结果类型',
    prop: 'resultType',
    width: 110,
    formatter: (row: any, column: any, cellValue: string) => {
      return { 1: '操作成功', 0: '操作失败' }[cellValue]
    },
  },
  {
    label: '操作结果',
    prop: 'result',
    minWidth: 100,
    showOverflowTooltip: true,
  },
  {
    label: '操作时间',
    prop: 'createTime',
    width: 190,
  },
  {
    label: '操作结果时间',
    prop: 'updateTime',
    width: 190,
  },
]

const selectedColumns = ref([
  'username',
  'module',
  'type',
  'method',
  'path',
  'query',
  'params',
  'body',
  'resultType',
  'result',
  'createTime',
  'updateTime',
])
const tableColumns = computed(() =>
  allColumns.filter((v) => selectedColumns.value.includes(v.prop)),
)

// 列表数据
const getData = async () => {
  const res = await getLogList(
    {
      pageNum: pageParams.value.pageNum,
      pageSize: pageParams.value.pageSize,
    },
    { module: queryParams.value.module },
  )
  if (res.code === 200) {
    tableData.value = res.data.list
    pageParams.value.total = res.data.total
  }
}
getData()

// 查询
const handleQuery = () => {
  pageParams.value.pageNum = 1
  getData()
}
// 重置表单
const resetForm = (formEl: any) => {
  if (!formEl) return
  formEl.resetFields()
}

const showDetailModal = ref(false)
const detailForm = ref({
  username: '',
  module: '',
  type: '',
  method: '',
  path: '',
  query: '',
  params: '',
  body: '',
  resultType: 0,
  result: '',
  createTime: '',
  updateTime: '',
})

// 显示添加/修改 dialog
const handleClickDetail = async (val: string) => {
  showDetailModal.value = true
  const res = await getLogDetail({ uuid: val })
  if (res.code === 200) {
    detailForm.value = res.data
  }
}
// 关闭新增/修改 dialog
const closeDetailDialog = () => {
  showDetailModal.value = false
  detailForm.value = {
    username: '',
    module: '',
    type: '',
    method: '',
    path: '',
    query: '',
    params: '',
    body: '',
    resultType: 0,
    result: '',
    createTime: '',
    updateTime: '',
  }
}

// 切换分页数量
const handleSizeChange = (val: number) => {
  pageParams.value.pageSize = val
  getData()
}
// 切换分页页码
const handleCurrentChange = (val: number) => {
  pageParams.value.pageNum = val
  getData()
}
</script>

<template>
  <div class="table-page-wrapper">
    <div class="query-form">
      <el-form :model="queryParams" ref="queryFormRef" inline>
        <el-form-item label="模块名称" prop="module" style="width: 240px">
          <el-input v-model="queryParams.module" placeholder="请输入模块名称" />
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
          <el-tooltip effect="dark" content="刷新" placement="top-start">
            <div class="icon-btn" style="margin-left: 10px" @click="getData">
              <svg-icon icon-class="Refresh" />
            </div>
          </el-tooltip>
          <el-popover placement="bottom" :width="150" trigger="click">
            <template #reference>
              <span>
                <el-tooltip effect="dark" content="设置列" placement="top-start">
                  <div class="icon-btn" style="margin-left: 10px">
                    <svg-icon icon-class="Setting" />
                  </div>
                </el-tooltip>
              </span>
            </template>
            <el-scrollbar height="260px">
              <el-checkbox-group v-model="selectedColumns">
                <el-checkbox
                  v-for="item in allColumns"
                  :key="item.prop"
                  :label="item.label"
                  :value="item.prop"
                />
              </el-checkbox-group>
            </el-scrollbar>
          </el-popover>
        </div>
      </div>

      <el-table :data="tableData" style="height: 100%">
        <el-table-column
          v-for="(item, index) in tableColumns"
          :key="index"
          :label="item.label"
          :prop="item.prop"
          :formatter="item.formatter"
          :min-width="item.minWidth"
          :width="item.width"
          :show-overflow-tooltip="item.showOverflowTooltip"
        />
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleClickDetail(row.uuid)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        background
        :current-page="pageParams.pageNum"
        :page-size="pageParams.pageSize"
        :total="pageParams.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-drawer v-model="showDetailModal" title="详情" destroy-on-close @closed="closeDetailDialog">
      <div style="width: 100%">
        <el-row :gutter="20" class="item">
          <el-col :span="8">操作人：</el-col>
          <el-col :span="16">{{ detailForm.username }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">操作模块：</el-col>
          <el-col :span="16">{{ detailForm.module }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">操作类型：</el-col>
          <el-col :span="16">{{ detailForm.type }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">请求类型：</el-col>
          <el-col :span="16">{{ detailForm.method }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">请求地址：</el-col>
          <el-col :span="16">{{ detailForm.path }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">请求query：</el-col>
          <el-col :span="16">{{ detailForm.query }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">请求params：</el-col>
          <el-col :span="16">{{ detailForm.params }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">请求body：</el-col>
          <el-col :span="16">{{ detailForm.body }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">操作结果类型：</el-col>
          <el-col :span="16">{{ detailForm.resultType === 1 ? '操作成功' : '操作失败' }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">操作结果：</el-col>
          <el-col :span="16">{{ detailForm.result }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">操作时间：</el-col>
          <el-col :span="16">{{ detailForm.createTime }}</el-col>
        </el-row>
        <el-row :gutter="20" class="item">
          <el-col :span="8">操作结果时间：</el-col>
          <el-col :span="16">{{ detailForm.updateTime }}</el-col>
        </el-row>
      </div>
      <template #footer>
        <div>
          <el-button @click="closeDetailDialog">关闭</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="less">
.item {
  background-color: #e5e9f2;
  border-radius: 4px;
  padding: 8px 0;
  margin-bottom: 10px;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
