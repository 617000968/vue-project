<template>
  <div class="register-container">
    <el-card class="register-card" shadow="hover">
      <h2 class="title">用户注册</h2>
      <el-form :model="form" :rules="rules" ref="registerForm" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称"
            :prefix-icon="UserFilled"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            :prefix-icon="Message"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            class="submit-btn"
            :loading="loading"
          >
            立即注册
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  UserFilled,
  Message
} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '用户名长度应在4到16个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '昵称长度应在2到10个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ]
}

const registerForm = ref(null)

const handleSubmit = () => {
  registerForm.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const response = await axios.post('http://localhost:8080/api/auth/register', form)
        const res = response.data
        if (res.code === 200) {
          ElMessage.success({
            message: res.msg || '注册成功',
            duration: 1500,
            onClose: () => router.push('/login')
          })
        } else {
          ElMessage.error(res.msg || '注册失败')
        }
      } catch (error) {
        console.error('注册错误', error)
        ElMessage.error('注册过程中发生错误')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.register-card {
  width: 500px;
  border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  position: relative;
  padding-bottom: 15px;
}

.title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #3498db;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  letter-spacing: 2px;
  font-weight: 500;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #4a5568;
}
</style>