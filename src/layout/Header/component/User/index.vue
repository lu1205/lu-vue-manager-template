<script setup lang="ts">
import { logout } from '@/api'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const userName = computed(() => useUserStore().getUserInfo()?.nickname)

const router = useRouter()

const handleLogout = async () => {
  const res = await logout()
  if (res.code === 200) {
    ElMessage.success('退出成功')
    useUserStore().clearAll()
    router.replace('/login')
    // router.push('/login', { replace: true })
  }
}
</script>

<template>
  <el-dropdown trigger="click">
    <div>
      <span style="margin-right: 4px">{{ userName }}</span>
      <svg-icon icon-class="CaretBottom" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
