<script setup lang="ts">
import { addMenu, deleteMenu, editMenu, getMenuDetail, getMenuList } from '@/api'
import { toTree } from '@/utils/util'
import { computed, nextTick, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { statusOptions, menuTypeOptions, keepAliveOptions } from '@/enums/index'
import IconSelect from '@/components/IconSelect/index.vue'

const tableData = ref<Array<any>>([])

const sourceList = [{ id: 0, pid: null, fullname: '根目录', type: 'F' }]
const treeData = computed(() => {
  let list = []
  if (addEditForm.value.type === 'F' || addEditForm.value.type === 'M') {
    list = sourceList.map((v: any) => {
      if (v.type === 'F') {
        v.disabled = false
      } else {
        v.disabled = true
      }
      v.label = v.fullname
      return v
    })
  } else {
    list = sourceList.map((v: any) => {
      if (v.type === 'M') {
        v.disabled = false
      } else {
        v.disabled = true
      }
      v.label = v.fullname
      return v
    })
  }
  return toTree(list)
})

const getData = async () => {
  const res = await getMenuList()
  if (res.code === 200) {
    expandRowKeys.value = res.data.map((v: any) => v.id + '')
    sourceList.push(...res.data)
    tableData.value = toTree(res.data)
  }
}
getData()

const beforeChange = () => {
  return new Promise((resolve) => {
    ElMessageBox.confirm('确定要切换状态?', '切换状态', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        return resolve(true)
      })
      .catch(() => {})
  })
}

const queryFormRef = ref()
const queryParams = ref({
  fullname: '',
})

// 查询
const handleQuery = () => {
  getData()
}

// 重置表单(查询/新增/修改)
const resetForm = (formEl: any) => {
  if (!formEl) return
  formEl?.resetFields()
}

const expandAll = ref(true)
const expandRowKeys = ref([])
const changeExpandAll = () => {
  expandAll.value = !expandAll.value
}

const showAddEditModal = ref(false)
const addEditFormRef = ref()
const addEditFormRules = {
  fullname: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}
const addEditForm = ref({
  pid: null,
  id: null,
  fullname: '',
  path: '',
  sort: null,
  icon: '',
  component: '',
  type: 'F',
  status: 0,
  keepAlive: 0,
  permissionCode: '',
})
const addEditDialogTitle = ref('新增')

// 新增/修改
const handleClickAddEdit = (val: any, type: string = 'add') => {
  showAddEditModal.value = true
  addEditDialogTitle.value = '新增'
  if (val) {
    nextTick(async () => {
      if (type === 'edit') {
        addEditDialogTitle.value = '修改'
        const res = await getMenuDetail({ id: val })
        if (res.code === 200) {
          Object.keys(addEditForm.value).forEach((key: string) => {
            addEditForm.value[key] = res.data[key]
          })
        }
      } else {
        addEditForm.value.pid = val
      }
    })
  }
}

// 关闭dialog(新增/修改)
const closeAddEditDialog = (formEl: any) => {
  showAddEditModal.value = false
  addEditForm.value.id = null
  if (formEl) {
    formEl.resetFields()
  }
}

// 提交(新增/修改)
const addEditSubmit = async (formEl: any) => {
  formEl.validate(async (valid: any) => {
    if (valid) {
      console.log(addEditForm.value)
      let res = {}
      if (addEditForm.value.id) {
        res = await editMenu(addEditForm.value)
      } else {
        res = await addMenu(addEditForm.value)
      }
      if (res.code === 200) {
        ElMessage.success('操作成功')
        closeAddEditDialog(formEl)
        getData()
      }
    }
  })
}

// 删除
const handleDelete = async (id: number) => {
  const res = await deleteMenu({ id: [id] })
  if (res.code === 200) {
    ElMessage.success('删除成功')
    getData()
  }
}

const list = import.meta.glob(['@/assets/svgIcon/**.svg'])
const iconList: any[] = Object.keys(list)?.map((v: string) => {
  return v.split('/').pop()?.split('.')[0]
})
</script>

<template>
  <div class="table-page-wrapper">
    <div class="query-form">
      <el-form :inline="true" :model="queryParams" ref="queryFormRef">
        <el-form-item label="菜单名称" prop="fullname" style="width: 240px">
          <el-input v-model="queryParams.fullname" placeholder="请输入名称" />
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
          <el-button type="primary" @click="handleClickAddEdit('')">新增</el-button>
        </div>
        <div class="action-right">
          <el-tooltip effect="dark" content="展开/收起" placement="top-start">
            <div class="icon-btn" style="margin-left: 10px" @click="changeExpandAll">
              <svg-icon icon-class="Switch" />
            </div>
          </el-tooltip>
        </div>
      </div>

      <el-table
        element-loading-background="rgba(122, 122, 122, 0.8)"
        :data="tableData"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        :expand-row-keys="expandAll ? expandRowKeys : []"
      >
        <el-table-column label="名称" prop="fullname" min-width="160" />
        <el-table-column
          label="类型"
          prop="type"
          width="80"
          align="center"
          :formatter="
            (row: any, column: any, cellValue: string) => {
              return { F: '目录', M: '菜单', B: '按钮' }[cellValue]
            }
          "
        />
        <el-table-column label="路由" prop="path" min-width="140" />
        <el-table-column label="排序" prop="sort" width="60" align="center" />
        <el-table-column label="图标" prop="icon" width="80" align="center">
          <template #default="{ row }">
            <svg-icon v-if="row.icon" :icon-class="row.icon"></svg-icon>
          </template>
        </el-table-column>
        <el-table-column label="权限标识" prop="permissionCode" min-width="160" />
        <el-table-column label="组件路径" prop="component" min-width="120" />
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :before-change="beforeChange"
              :active-value="0"
              :inactive-value="1"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="是否缓存"
          prop="keepAlive"
          width="80"
          align="center"
          :formatter="
            (row: any, column: any, cellValue: string) => {
              return { 0: '否', 1: '是' }[cellValue]
            }
          "
        />
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <div style="display: flex; justify-content: flex-end">
              <!-- <el-button
                v-if="row.type !== 'B'"
                type="primary"
                @click="handleClickAddEdit(row.id, 'add')"
              >
                新增
              </el-button> -->
              <el-button type="primary" size="small" @click="handleClickAddEdit(row.id, 'edit')">
                修改
              </el-button>
              <el-popconfirm
                confirm-button-text="确定"
                cancel-button-text="取消"
                title="确定要删除当前及下属所有数据?"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
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
        inline
      >
        <el-form-item label="类型" prop="type" class="form-item-one-row">
          <el-segmented
            v-model="addEditForm.type"
            :options="menuTypeOptions"
            @change="() => (addEditForm.pid = null)"
            class="custom-segmented-style"
          />
          <!-- <el-radio-group v-model="addEditForm.type" @change="() => (addEditForm.pid = null)">
            <el-radio-button label="目录" value="F" />
            <el-radio-button label="菜单" value="M" />
            <el-radio-button label="按钮" value="B" />
          </el-radio-group> -->
        </el-form-item>
        <el-form-item label="所属上级" prop="pid" class="form-item-half-row">
          <el-tree-select
            v-model="addEditForm.pid"
            :data="treeData"
            check-strictly
            node-key="id"
            :render-after-expand="false"
            placeholder="请选择"
          />
        </el-form-item>

        <el-form-item label="名称" prop="fullname" class="form-item-half-row">
          <el-input v-model="addEditForm.fullname" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="路由" prop="path" class="form-item-half-row">
          <el-input v-model="addEditForm.path" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="排序" prop="sort" class="form-item-half-row">
          <el-input v-model.number="addEditForm.sort" type="number" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" class="form-item-half-row">
          <el-input v-model="addEditForm.component" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" class="form-item-half-row">
          <!-- <el-input v-model="addEditForm.icon" placeholder="请输入" /> -->
          <IconSelect v-model="addEditForm.icon" readonly :icon-list="iconList"></IconSelect>
        </el-form-item>
        <el-form-item label="权限标识" prop="permissionCode" class="form-item-half-row">
          <el-input v-model="addEditForm.permissionCode" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="状态" prop="status" class="form-item-half-row">
          <el-segmented
            v-model="addEditForm.status"
            :options="statusOptions"
            class="custom-segmented-style"
          />
          <!-- <el-switch
            v-model="addEditForm.status"
            :active-value="0"
            :inactive-value="1"
            active-text="启用"
            inactive-text="停用"
          /> -->
        </el-form-item>
        <el-form-item label="是否缓存" prop="keepAlive" class="form-item-half-row">
          <el-segmented
            v-model="addEditForm.keepAlive"
            :options="keepAliveOptions"
            class="custom-segmented-style"
          />
          <!-- <el-switch
            v-model="addEditForm.keepAlive"
            :active-value="1"
            :inactive-value="0"
            active-text="缓存"
            inactive-text="不缓存"
          /> -->
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button @click="closeAddEditDialog(addEditFormRef)">取消</el-button>
          <el-button type="primary" @click="addEditSubmit(addEditFormRef)"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
