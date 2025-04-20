<template>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
  
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
  
      <el-form-item>
        <el-button type="primary" @click="verifyUser" :loading="verifying">验证用户</el-button>
      </el-form-item>
  
      <el-form-item v-if="verified" label="新密码" prop="password">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
  
      <el-form-item v-if="verified">
        <el-button type="success" @click="resetPassword" :loading="resetting">重置密码</el-button>
      </el-form-item>
    </el-form>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  
  const router = useRouter()
  const formRef = ref(null)
  const verified = ref(false)
  const verifying = ref(false)
  const resetting = ref(false)
  
  const form = reactive({
    username: '',
    email: '',
    password: ''
  })
  
  const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    password: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
  }
  
  const verifyUser = async () => {
    verifying.value = true
    try {
      const { username, email } = form
      const response = await axios.post('http://localhost:8080/api/auth/verifyUser', null, {
        params: { username, email }
      })
      if (response.data.code === 200) {
        ElMessage.success('验证成功，请输入新密码')
        verified.value = true
      } else {
        ElMessage.error(response.data.msg || '验证失败')
      }
    } catch  {
      ElMessage.error('验证请求失败')
    } finally {
      verifying.value = false
    }
  }
  
  const resetPassword = async () => {
    resetting.value = true
    try {
      const { username, password } = form
      const response = await axios.post('http://localhost:8080/api/auth/forgetPassword', null, {
        params: { username, password }
      })
      if (response.data.code === 200) {
        ElMessage.success('密码重置成功，请登录')
        router.push('/login')
      } else {
        ElMessage.error(response.data.msg || '密码重置失败')
      }
    } catch{
      ElMessage.error('密码重置请求失败')
    } finally {
      resetting.value = false
    }
  }
  </script>
  