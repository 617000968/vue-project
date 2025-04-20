<template>
  <div class="login-container">
    <div class="card-container" :class="{ 'is-flipped': showAnonymousForm }">
      <!-- 正面：登录表单 -->
      <div class="card-face front">
        <el-card class="login-card">
          <h2 class="login-title">用户登录</h2>

          <el-form
              :model="form"
              :rules="rules"
              ref="loginForm"
              @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                  v-model="form.username"
                  placeholder="请输入用户名"
                  prefix-icon="el-icon-user"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="el-icon-lock"
                  show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                  type="primary"
                  native-type="submit"
                  :loading="isLoading"
                  style="width: 100%"
              >
                立即登录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="footer-links">
            <router-link to="/register">注册账号</router-link>
            <el-divider direction="vertical" />
            <router-link to="/user/forgetPassword">忘记密码</router-link>
          </div>
          <div class="anonymous-entry">
            <el-button
                link
                @click="showAnonymousForm = true"
            >
              使用匿名码参与投票
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 背面：匿名码输入 -->
      <div class="card-face back">
        <el-card class="login-card">
          <h2 class="login-title">匿名投票入口</h2>
          <el-form @submit.prevent="handleAnonymousSubmit">
            <el-form-item>
              <el-input
                  v-model="anonymousCode"
                  placeholder="请输入匿名码"
                  prefix-icon="el-icon-key"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                  type="primary"
                  native-type="submit"
                  :loading="isSubmittingAnonymous"
                  style="width: 100%"
              >
                提交匿名码
              </el-button>
              <el-button
                  link
                  @click="showAnonymousForm = false"
                  style="margin-top: 10px"
              >
                返回登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios';
import resetMessage from '@/utils/resetMessage';
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()

const router = useRouter()  // 获取 router 实例

const form = ref({
  username: '',
  password: ''
})
const showAnonymousForm = ref(false)
const anonymousCode = ref('')
const isSubmittingAnonymous = ref(false)
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' }
  ]
}

const isLoading = ref(false)
const loginForm = ref(null)
const handleAnonymousSubmit = async () => {
  if (!anonymousCode.value) {
    resetMessage.error('请输入匿名码')
    return
  }

  try {
    isSubmittingAnonymous.value = true
    console.log(anonymousCode.value)
    // 调用验证接口
    const response = await axios.get(
        `http://localhost:8080/api/polls/anonymous/${anonymousCode.value}`
    )

    if (response.data.code === 200) {
      resetMessage.success('验证成功')
      // 跳转到匿名投票页面
      await router.push({
        name: 'PollAnonymous',
        params: {anonymousCode: anonymousCode.value}
      })
    } else {
      resetMessage.error(response.data.msg || '匿名码无效')
    }
  } catch (error) {
    console.error('匿名码验证失败:', error)
    const errorMsg = error.response?.data?.msg || '验证失败，请检查匿名码'
    resetMessage.error(errorMsg)
  } finally {
    isSubmittingAnonymous.value = false
  }
}
const handleLogin = async () => {
  try {
    const valid = await loginForm.value.validate()
    if (!valid) {
      resetMessage.error('请填写完整的用户名密码')
      return
    }

    isLoading.value = true

    const response = await axios.post('http://localhost:8080/api/auth/login', {
      username: form.value.username,
      password: form.value.password
    })

    const res = response.data

    if (res.code === 200) {
      const userData = res.data
      localStorage.setItem('user', JSON.stringify(userData))
      userStore.setUser(userData)
      resetMessage.success(res.msg || '登录成功')
      console.log(userData.role)
      if (userData.role === 'ADMIN') {
        await router.push('/admin')
      } else {
        await router.push('/home')
      }
    } else {
      resetMessage.error(res.msg || '用户名或密码错误')
    }
  } catch (error) {
    console.error('登录错误:', error)
    if (error.response) {
      const errorMsg = error.response.data?.msg || '用户名或密码错误'
      resetMessage.error(errorMsg)
    } else if (error.request) {
      resetMessage.error('连接服务器失败，请检查网络连接')
    } else {
      resetMessage.error('登录失败，请重试')
    }
  } finally {
    isLoading.value = false
  }
}
</script>


<style scoped>
.login-container {
  perspective: 1000px;
}

.card-container {
  width: 380px;
  margin: 0 auto;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card-container.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.front {
  transform: rotateY(0deg);
}

.back {
  transform: rotateY(180deg);
}

.anonymous-entry {
  text-align: center;
  margin-top: 15px;
}

.anonymous-entry button {
  color: #909399;
  font-size: 14px;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 380px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.footer-links {
  margin-top: 20px;
  text-align: center;
}

a {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.el-divider {
  margin: 0 12px;
  background-color: #dcdfe6;
}
</style>