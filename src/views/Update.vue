<template>
  <div class="update-container" v-if="user">
    <h2>Update Information</h2>
    <form @submit.prevent="handleUpdate">
      <!-- Username 字段只读 -->
      <div>
        <label for="username">Username:</label>
        <input v-model="user.username" type="text" id="username" readonly />
      </div>
      <div>
        <label for="email">Email:</label>
        <input v-model="user.email" type="email" id="email" required />
      </div>
      <!-- 添加密码修改字段 -->
      <div>
        <label for="password">New Password:</label>
        <input v-model="user.password" type="password" id="password" />
      </div>
      <button type="submit">Save Changes</button>
    </form>
    <button @click="handleDelete">Delete Account</button>
  </div>
  <div v-else>
    <p>Loading...</p> <!-- 如果没有加载到用户数据，显示加载提示 -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  setup() {
    const user = ref(null); // 初始为空，确保从 localStorage 中加载数据
    const router = useRouter();

    // 页面加载时检查 localStorage 中是否有用户信息
    onMounted(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        user.value = { ...storedUser }; // 确保复制到响应式对象
      } else {
        router.push('/login'); // 如果没有用户信息，跳转到登录页面
      }
    });

    // 更新用户信息
    const handleUpdate = async () => {
      try {
        const userId = user.value.userId;
        const updatedUser = {
          username: user.value.username,  // 用户名保持不变
          email: user.value.email,
          password: user.value.password || ''  // 如果用户没有修改密码，保持为空
        };

        // 更新用户信息
        const response = await axios.put(`http://localhost:8080/api/users/update/${userId}`, updatedUser);

        if (response.status === 200) {
          // 更新成功，返回并跳转到首页或其他页面
          alert('User information updated successfully');
          localStorage.setItem('user', JSON.stringify(response.data.data)); // 更新本地存储的用户信息
          router.push('/home'); // 跳转到首页
        }
      } catch (error) {
        alert('Failed to update user information');
        console.error(error);
      }
    };

    // 删除用户账户
    const handleDelete = async () => {
      try {
        const userId = user.value.userId;
        
        // 发送删除请求
        const response = await axios.delete(`http://localhost:8080/api/users/delete/${userId}`);
        
        if (response.status === 200) {
          // 删除成功，清除 localStorage 并跳转到登录页面
          alert('Account deleted successfully');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } catch (error) {
        alert('Failed to delete account');
        console.error(error);
      }
    };

    return {
      user,
      handleUpdate,
      handleDelete
    };
  }
};
</script>

<style scoped>
.update-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

input {
  margin-bottom: 10px;
  width: 100%;
  padding: 8px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
