import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia';
import NavBar from './components/NavBar.vue';

const pinia = createPinia();

createApp(App)
    .component('NavBar', NavBar)
    .use(ElementPlus)
    .use(router)
    .use(pinia)
    .mount('#app')
