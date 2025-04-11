<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="username">Username:</label>
        <input v-model="username" type="text" id="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input v-model="password" type="password" id="password" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input v-model="email" type="email" id="email" required />
      </div>
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <router-link to="/login">Login here</router-link></p>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      username: '',
      password: '',
      email: ''
    };
  },
  methods: {
    async handleRegister() {
      try {
        const response = await axios.post('http://localhost:8080/api/users/register', {
          username: this.username,
          password: this.password,
          email: this.email
        });

        if (response.status === 200) {
          alert('Registration successful!');
          this.$router.push('/login'); // Redirect to login page after successful registration
        }
      } catch (error) {
        alert('Registration failed: ' + error.response.data.message);
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  width: 300px;
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
