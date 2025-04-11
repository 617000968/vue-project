<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">用户登录</h2>

      <el-form
        :model="form"
        :rules="rules"
        ref="loginForm"
        @submit.native.prevent="handleLogin"
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
        <router-link to="/forgot-password">忘记密码</router-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
import resetMessage from '@/utils/resetMessage';

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      },
      isLoading: false
    };
  },
  methods: {
    async handleLogin() {
      try {
        const valid = await this.$refs.loginForm.validate();
        if (!valid) {
          resetMessage.error('请填写完整的用户名和密码');
          return;
        }

        this.isLoading = true;

        const response = await axios.post('http://localhost:8080/api/auth/login', {
          username: this.form.username,
          password: this.form.password
        });

        const res = response.data;
        if (res.code === 200) {
          localStorage.setItem('user', JSON.stringify(res.data));
          resetMessage.success(res.msg || '登录成功');
          this.$router.push('/home');
        } else {
          resetMessage.error(res.msg || '用户名或密码错误');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.msg || '连接服务器失败';
        resetMessage.error(errorMsg);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
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
