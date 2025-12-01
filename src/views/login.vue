<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/index'
import { loadAsyncRouter } from '@/router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

import { loadFireworksPreset } from '@tsparticles/preset-fireworks'
import { tsParticles, type ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";

onMounted(async () => {
  // 使用烟花特效
  // await loadFireworksPreset(tsParticles);
  // tsParticles.load({ id: 'tsparticles', options: { preset: 'fireworks' } });

  // 使用粒子特效
  tsParticles.load({id: 'tsparticles' , options: particlesOptions});

  await loadFull(tsParticles);
})

const particlesOptions: ISourceOptions = {
  background: {
    color: {
      value: '#000',
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'repulse',
      },
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#fff',
    },
    links: {
      color: '#fff',
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce',
        left: null,
        right: null,
        top: null,
        bottom: null,
      },
    },
    number: {
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  preset: 'fireworks',
}

const ruleFormRef = ref()
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}
const ruleForm = reactive({
  username: 'admin',
  password: '123456',
})

const router = useRouter()
const route = useRoute()

const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      const res = await login(ruleForm)
      if (res.code === 200) {
        useUserStore().setToken(res.data.token)
        await loadAsyncRouter()
        ElMessage.success('登录成功')
        router.push(route.query.redirect || '/')
      }
    }
  })
}
</script>

<template>
  <div class="login-wrapper">
    <div id="tsparticles"></div>
    <!-- <vue-particles id="tsparticles" :options="particlesOptions" /> -->
    <div class="login-container">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="ruleForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="ruleForm.password" placeholder="请输入密码" type="password" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-container {
    width: 260px;
  }
}
</style>
