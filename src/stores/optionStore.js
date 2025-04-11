import { defineStore } from "pinia";
import axios from "axios";
import { ElMessage } from "element-plus";

export const useOptionStore = defineStore("optionStore", {
    state: () => ({
        options: [],
        loading: false,
        error: null,
    }),
    actions: {
        async getOptions() {
            this.loading = true,
                this.error = null
            try {
                const response = await axios.get('http://localhost:8080/api/option/all')
                if (response.data.code === 200) {
                    this.options = response.data.data
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