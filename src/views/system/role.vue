<script setup lang="ts">
import {
  addRole,
  batchDeleteRole,
  changeRoleStatus,
  deleteRole,
  editPermissions,
  editRole,
  getMenuList,
  getPermissionDetail,
  getRoleDetail,
  getRoleList,
} from '@/api'
import { toTree } from '@/utils/util'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, ref } from 'vue'
import { statusOptions } from '@/enums/index'

// 查询表单实例
const queryFormRef = ref()
// 查询参数
const queryParams = ref({
  fullname: '',
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
  const res = await getRoleList(
    {
      pageNum: pageParams.value.pageNum,
      pageSize: pageParams.value.pageSize,
    },
    { fullname: queryParams.value.fullname },
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
  fullname: '',
  remark: '',
  status: 0,
})
const addEditFormRules = {
  roleName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
}

// 显示添加/修改 dialog
const handleClickAddEdit = (val: any = null) => {
  showAddEditModal.value = true
  addEditDialogTitle.value = '新增'
  if (val) {
    addEditDialogTitle.value = '编辑'
    nextTick(async () => {
      const res = await getRoleDetail({ id: val })
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
        const res = await addRole(data)
        if (res.code === 200) {
          ElMessage.success('添加成功')
          closeAddEditDialog(formEl)
          getData()
        }
      } else {
        const res = await editRole(data)
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
  const res = await batchDeleteRole(selectArr.value)
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
  const res = await deleteRole({ id })
  if (res.code === 200) {
    ElMessage.success('删除成功')
    handleQuery()
  }
}

const beforeChange = (val: any) => {
  return new Promise((resolve) => {
    ElMessageBox.confirm('确定要切换状态?', '切换状态', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        const res = await changeRoleStatus({ id: val.id, status: val.status === 1 ? 0 : 1 })
        if (res.code === 200) {
          ElMessage.success('操作成功')
          return resolve(true)
        } else {
          return resolve(false)
        }
      })
      .catch(() => {})
  })
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
const allPermissionList = ref({})
const getAllPermissionList = async () => {
  const res = await getMenuList()
  if (res.code === 200) {
    allPermissionList.value = toTree(res.data)
  }
}
getAllPermissionList()

const permissionTreeRef = ref()
const showPermissionDrawer = ref(false)
const permissionForm = ref({
  id: '',
  permissions: [],
})

const handleClickPermissions = async (id: number) => {
  const res = await getPermissionDetail({ id })
  if (res.code === 200) {
    permissionForm.value = {
      id: res.data.id,
      permissions: res.data.permissions?.split(','),
    }

    showPermissionDrawer.value = true
    nextTick(() => {
      permissionForm.value.permissions?.forEach((v) => {
        permissionTreeRef.value.setChecked(v, true, false)
      })
    })
  }
}

const handleChangePermission = (_, { checkedKeys, halfCheckedKeys }) => {
  permissionForm.value.permissions = [...halfCheckedKeys, ...checkedKeys]
}

const closePermissionsDrawer = () => {
  showPermissionDrawer.value = false
  permissionForm.value.id = null
  permissionForm.value.permissions = []
}

const submitPermission = async () => {
  console.log(permissionForm.value)
  const res = await editPermissions(permissionForm.value)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    closePermissionsDrawer()
    getData()
  }
}
</script>

<template>
  <div class="table-page-wrapper">
    <div class="query-form">
      <el-form :model="queryParams" ref="queryFormRef" inline>
        <el-form-item label="角色名称" prop="fullname" style="width: 240px">
          <el-input v-model="queryParams.fullname" placeholder="请输入角色名" />
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
        <el-table-column label="名称" prop="fullname" min-width="100" />
        <el-table-column label="权限" prop="permissionsName" min-width="200" />
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :before-change="() => beforeChange(row)"
              :active-value="0"
              :inactive-value="1"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleClickPermissions(row.id)">设置权限</el-button>
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
        <el-form-item label="角色名称" prop="fullname">
          <el-input v-model="addEditForm.fullname" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-segmented
            v-model="addEditForm.status"
            :options="statusOptions"
            class="custom-segmented-style"
          />
          <!-- <el-switch v-model="addEditForm.status" :active-value="0" :inactive-value="1" /> -->
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addEditForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button @click="closeAddEditDialog(addEditFormRef)">取消</el-button>
          <el-button type="primary" @click="addEditSubmit(addEditFormRef)"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="showPermissionDrawer" title="设置权限" destroy-on-close>
      <el-tree
        ref="permissionTreeRef"
        :data="allPermissionList"
        show-checkbox
        default-expand-all
        node-key="id"
        :props="{
          children: 'children',
          label: 'fullname',
        }"
        @check="handleChangePermission"
      />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="closePermissionsDrawer">取消</el-button>
          <el-button type="primary" @click="submitPermission">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>
