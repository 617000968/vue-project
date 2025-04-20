<template>
  <div class="update-container">
    <el-card class="update-card" shadow="hover">
      <h2 class="title">个人信息管理</h2>
      <el-skeleton :loading="!user" animated>
        <template #template>
          <el-skeleton-item variant="image" style="height: 200px" />
          <div class="skeleton-content">
            <el-skeleton-item variant="h3" style="width: 50%" />
            <el-skeleton-item variant="text" style="width: 80%" />
            <el-skeleton-item variant="text" style="width: 60%" />
          </div>
        </template>
        
        <el-form :model="user" label-position="top">
          <el-form-item label="账号" class="form-item__readonly">
            <el-input v-model="user.username" readonly>
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="user.email" type="email">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="user.nickname">
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input v-model="user.password" type="password" show-password>
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="action-buttons">
            <el-button 
              type="primary" 
              @click="handleUpdate"
              :loading="updating"
            >
              保存修改
            </el-button>
            <el-button
              type="danger"
              @click="handleDelete"
              :loading="deleting"
            >
              删除账户
            </el-button>
          </div>
        </el-form>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Lock,
  Message,
  Edit
} from '@element-plus/icons-vue'

const user = ref(null)
const router = useRouter()
const updating = ref(false)
const deleting = ref(false)

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'))
  user.value = storedUser ? { ...storedUser } : router.push('/login')
})

const handleUpdate = async () => {
  try {
    updating.value = true
    console.log(user.value)
    const response = await axios.put(`http://localhost:8080/api/auth/update/${user.value.userId}`, {
      email: user.value.email,
      nickname: user.value.nickname,
      password: user.value.password || ''
    })
    
    if (response.data.code === 200) {
      ElMessage.success('信息更新成功')
      localStorage.setItem('user', JSON.stringify(response.data.data))
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '更新失败')
  } finally {
    updating.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('此操作将永久删除账户，是否继续？', '警告', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    
    deleting.value = true
    const response = await axios.delete(`http://localhost:8080/api/auth/delete/${user.value.userId}`)
    if (response.data.code === 200) {
      ElMessage.success('账户已删除')
      localStorage.removeItem('user')
      router.push('/login')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.update-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.update-card {
  width: 600px;
  border-radius: 12px;
}

.title {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #3498db;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.form-item__readonly :deep(.el-input__inner) {
  background-color: #f8f9fa;
  cursor: not-allowed;
}
</style>
