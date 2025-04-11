import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import HomePage from '../views/HomePage.vue';
import UserLogin from '../views/UserLogin.vue';
import UserRegister from '../views/UserRegister.vue';
import UserUpdate from '../views/UserUpdate.vue';
import UserHome from '../views/UserHome.vue';
import PollCreate from '@/views/PollCreate.vue';
import CategoryList from '@/views/CategoryList.vue';
import UserForgetPassword from '@/views/UserForgetPassword.vue';
import PollCategory from '@/views/PollCategory.vue';
import PollCreator from '@/views/PollCreator.vue'
import PollDetail from '@/views/PollDetail.vue';


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login',
     component: UserLogin,
      meta: {hideNavbar: true} },
  { path: '/register',
     component: UserRegister,
    meta:{hideNavbar: true} },
  { path: '/home', component: HomePage },
  { path: '/user/update', component: UserUpdate },
  { path: '/profile', component: UserHome},
  { path: '/poll/create', component: PollCreate},
  { path: '/user/forgetPassword',
     component: UserForgetPassword,
    meta: {hideNavbar: true}},
  { path: '/poll/category', component: CategoryList},
  { path: '/category/poll/:categoryId',
    component: PollCategory,
    name: 'CategoryPolls',
    props: route => ({ categoryId: Number(route.params.categoryId) })
  },
  {
    path: '/poll/creator/:creatorId',
    component: PollCreator,
    name: 'CreatorPolls',
    props: route => ({ creatorId: Number(route.params.creatorId) })
  },
  {
    path: '/poll/:pollId',
    component: PollDetail,
    name: 'PollDetail',
    props: route => ({
      pollId: route.params.pollId,
      userId: route.query.userId
    })
  },
  {
    path: '/admin',
    component: () => import('@/views/AdminPage.vue')
  },
  {
    path: '/poll/anonymous/:anonymousCode', // 正确路径
    component: () => import('@/views/PollAnonymous.vue'), // 正确组件
    name: 'PollAnonymous',
    props: true,
    meta: {hideNavbar: true}
  }
];

const router = createRouter({
  history: createWebHistory(), // 使用 Web History 模式
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})
export default router;
