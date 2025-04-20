import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus, { ElMessage } from 'element-plus' // 确保正确导入
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia';
import NavBar from './components/NavBar.vue';

const pinia = createPinia();

const app = createApp(App)

// 配置全局消息参数
app.config.globalProperties.$message = (options) => {
    return ElMessage({
        duration: 2000,     // 显示时长2秒
        offset: 50,         // 距离底部50px
        position: 'bottom', // 显示在底部
        ...options          // 允许覆盖默认配置
    })
}

// 注册其他组件
app
    .component('NavBar', NavBar)
    .use(ElementPlus)
    .use(router)
    .use(pinia)
    .mount('#app')