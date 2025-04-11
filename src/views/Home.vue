<template>
  <div class="home-container" v-if="user">
    <h2>Welcome, {{ user.nickname }}</h2>
    <p><strong>Username:</strong> {{ user.username }}</p>
    <p><strong>Email:</strong> {{ user.email }}</p>
    <router-link to="/update">Update Information</router-link>
    <button @click="handleLogout">Logout</button>
  </div>
  <div v-else>
    <p>Loading...</p> <!-- 如果用户信息还没有加载，则显示加载提示 -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const user = ref(null); // 初始设置为 null，确保不会读取 undefined
    const router = useRouter();

    // 页面加载时检查 localStorage 中是否有用户信息
    onMounted(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      if (storedUser) {
        user.value = storedUser; // 如果有，赋值给响应式变量
      } else {
        router.push('/login'); // 如果没有用户信息，跳转到登录页面
      }
    });

    // 退出登录
    const handleLogout = () => {
      localStorage.removeItem('user'); // 清除 localStorage 中的用户数据
      router.push('/login'); // 跳转到登录页面
    };

    return {
      user,
      handleLogout
    };
  }
};
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

button {
  margin-top: 20px;
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #e53935;
}
</style>
