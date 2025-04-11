import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Update from '../views/Update.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/update', component: Update } // 确保配置了 Update 路由
];

const router = createRouter({
  history: createWebHistory(), // 使用 Web History 模式
  routes
});

export default router;
