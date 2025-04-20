<template>
  <div class="navbar-container">
    <nav class="navbar" :style="{ backgroundColor: '#2c3e50' }">
      <div class="nav-content">
        <!-- 导航按钮组 -->
        <div class="nav-buttons">
          <router-link to="/home" class="nav-button">
            所有投票
          </router-link>
          <router-link to="/poll/active" class="nav-button">
            活动投票
          </router-link>
          <router-link to="/poll/create" class="nav-button">
            创建投票
          </router-link>
          <router-link to="/poll/category" class="nav-button">
            投票分类
          </router-link>
        </div>

        <!-- 用户菜单 -->
        <div 
          class="menu-trigger" 
          @mouseenter="showMenu = true"
          @mouseleave="showMenu = false"
        >
          你好, {{ userStore.nickname }}
          <div v-if="showMenu" class="dropdown-menu" style="margin-top: -8px;">
            <div class="menu-item">
              <router-link to="/profile">
                个人中心
              </router-link>
            </div>
            <div class="menu-item" @click="handleLogout">
              退出登录
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const showMenu = ref(false)
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    userStore.setUser(JSON.parse(userData))
  } else {
    router.push('/login')
  }
})

const handleLogout = () => {
  userStore.logout()
  localStorage.removeItem('user')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.navbar-container {
  width: 100%;
}

.navbar {
  height: 60px;
  padding: 0 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-content {
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nav-buttons {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 25px;
}

.nav-button {
  color: white;
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-button.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.menu-trigger {
  cursor: pointer;
  padding: 10px 20px;
  color: white;
  transition: background-color 0.3s;
  margin-left: auto;
}

.menu-trigger:hover {
  background-color: #34495e;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.menu-item {
  padding: 12px 20px;
  color: #333;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-item a {
  color: inherit;
  text-decoration: none;
  display: block;
  width: 100%;
}
</style>