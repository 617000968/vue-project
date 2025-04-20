import { defineStore } from 'pinia';
import axios from 'axios';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        loading: false,
        error: null
    }),
    actions: {
        async getActiveCategories() {
            this.loading = true,
            this.error = null
            try {
                const response = await axios.get('http://localhost:8080/admin/category/active')
                if (response.data.code === 200) {
                    this.categories = response.data.data
                } else {
                    this.error = response.data.msg || '数据获取失败'
                }
            } catch (err) {
                this.error = '数据获取失败' + err.msg
            } finally {
                this.loading = false;
            }
        }
    }
})