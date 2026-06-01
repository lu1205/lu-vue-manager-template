<script setup lang="ts">
import {
  getRoomDetail,
  getRoomList,
  addRoom,
  editRoom,
  deleteRoom,
  batchDeleteRoom,
} from '@/api'
import { ElMessage } from 'element-plus'
import { nextTick, ref } from 'vue'
import CinemaSeatEditor from './CinemaSeatEditor.vue'

// 查询表单实例
const queryFormRef = ref()
// 查询参数
const queryParams = ref({
  name: '',
})
// 分页参数
const pageParams = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})
// 列表数据
const tableData = ref([])

// 列表数据
const getData = async () => {
  const res = await getRoomList(
    {
      pageNum: pageParams.value.pageNum,
      pageSize: pageParams.value.pageSize,
    },
    { name: queryParams.value.name },
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

const showAddEditModal = ref(false)
const addEditDialogTitle = ref('新增')
const addEditFormRef = ref()
const addEditForm = ref({
  id: null,
  name: '',
  remark: null,
})
const addEditFormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

// 显示添加/修改 dialog
const handleClickAddEdit = (val: any = null) => {
  showAddEditModal.value = true
  addEditDialogTitle.value = '新增'
  if (val) {
    addEditDialogTitle.value = '编辑'
    nextTick(async () => {
      const res = await getRoomDetail({ id: val })
      if (res.code === 200) {
        Object.keys(addEditForm.value).forEach((key: string) => {
          addEditForm.value[key] = res.data[key]
        })
      }
    })
  }
}
// 关闭新增/修改 dialog
const closeAddEditDialog = (formEl: any) => {
  showAddEditModal.value = false
  addEditForm.value.id = null
  if (!formEl) return
  formEl.resetFields()
}
// 提交新增/修改 dialog
const addEditSubmit = (formEl: any) => {
  formEl.validate(async (valid: any) => {
    if (valid) {
      const data: any = {
        ...addEditForm.value,
      }
      if (!data.id) {
        const res = await addRoom(data)
        if (res.code === 200) {
          ElMessage.success('添加成功')
          closeAddEditDialog(formEl)
          getData()
        }
      } else {
        const res = await editRoom(data)
        if (res.code === 200) {
          ElMessage.success('修改成功')
          closeAddEditDialog(formEl)
          getData()
        }
      }
    }
  })
}

// 列表选中数据
const selectArr = ref([])
// 批量删除
const batchDel = async () => {
  const res = await batchDeleteRoom(selectArr.value)
  if (res.code === 200) {
    ElMessage.success('删除成功')
    handleQuery()
  }
}
// 设置选中数据
const handleSelectionChange = (val: any) => {
  selectArr.value = val.map((v: any) => v.id)
}
// 删除
const handleDelete = async (id: number) => {
  const res = await deleteRoom({ id })
  if (res.code === 200) {
    ElMessage.success('删除成功')
    handleQuery()
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

// 座位布局 dialog
const showAddEditSeatModal = ref(false)
const addEditSeatDialogTitle = ref('新增')
const cinemaSeatEditorRef = ref()
const handleClickAddEditSeat = (val: any = null) => {
  showAddEditSeatModal.value = true
  addEditSeatDialogTitle.value = '新增'
  if (val) {
    addEditSeatDialogTitle.value = '编辑'
  }
}
// 提交座位布局 dialog
const addEditSeatSubmit = () => {
  cinemaSeatEditorRef.value.submit()
}
// 关闭座位布局 dialog
const closeAddEditSeatDialog = () => {
  showAddEditSeatModal.value = false
}
</script>

<template>
  <div class="table-page-wrapper">
    <div class="query-form">
      <el-form :model="queryParams" ref="queryFormRef" inline>
        <el-form-item label="名称" prop="name" style="width: 240px">
          <el-input v-model="queryParams.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="info" @click="resetForm(queryFormRef)">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <div class="action-left">
          <el-button type="primary" @click="handleClickAddEdit()">新增</el-button>
          <el-button type="danger" :disabled="!selectArr.length" @click="batchDel">
            批量删除
          </el-button>
        </div>
        <div class="action-right">
          <el-tooltip effect="dark" content="刷新" placement="top-start">
            <div class="icon-btn" style="margin-left: 10px" @click="getData">
              <svg-icon icon-class="Refresh" />
            </div>
          </el-tooltip>
        </div>
      </div>

      <el-table :data="tableData" style="height: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="名称" prop="name" min-width="100" />
        <el-table-column label="备注" prop="remark" min-width="100" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleClickAddEditSeat(row.id)">
              座位布局
            </el-button>
            <el-button type="primary" size="small" @click="handleClickAddEdit(row.id)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
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
    <el-dialog
      v-model="showAddEditModal"
      :title="addEditDialogTitle"
      @closed="closeAddEditDialog(addEditFormRef)"
    >
      <el-form
        :model="addEditForm"
        ref="addEditFormRef"
        :rules="addEditFormRules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="addEditForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addEditForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button @click="closeAddEditDialog(addEditFormRef)">取消</el-button>
          <el-button type="primary" @click="addEditSubmit(addEditFormRef)"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      width="80vw"
      v-model="showAddEditSeatModal"
      :title="addEditSeatDialogTitle"
      @closed="closeAddEditSeatDialog"
    >
      <CinemaSeatEditor ref="cinemaSeatEditorRef" />

      <template #footer>
        <div>
          <el-button @click="closeAddEditSeatDialog">取消</el-button>
          <el-button type="primary" @click="addEditSeatSubmit"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
