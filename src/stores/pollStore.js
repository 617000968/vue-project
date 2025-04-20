import { defineStore } from "pinia";
import axios  from "axios";
import {ElMessage} from "element-plus";


export const usePollStore = defineStore('poll', {
    state: () => ({
        polls: [],
        loading: false,
        error: null
    }),
    actions: {
        async createPoll(pollData) {
            this.loading = true
            this.error = null
            try{
                const response = await axios.post(
                    'http://localhost:8080/api/polls/create', pollData, {
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        }
                    })
                if (response.data.code === 200) {
                    ElMessage.success('投票创建成功')
                } else {
                    this.error = response.data.msg || '投票创建失败'
                }
            } catch (err) {
                this.error = '数据获取失败' + err.msg
            } finally {
                this.loading = false
            }

        },
        async getAllPolls() {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get('http://localhost:8080/api/polls/all')
                if (response.data.code === 200) {
                    this.polls = response.data.data
                } else {
                    this.error = response.data.msg || '数据获取失败'
                }
            } catch (err) {
                this.error = '数据获取失败' + err.msg
            } finally {
                this.loading = false
            }
        },
        async getPollsByCategoryId(categoryId) {
            this.loading = true
            this.error = null
            try {
              const response = await axios.get(
                `http://localhost:8080/api/polls/category/${categoryId}`
              )
              if (response.data.code === 200) {
                this.polls = response.data.data
              } else {
                this.error = response.data.msg || '数据获取失败'
              }
            } catch (err) {
              if (err.response && err.response.data) {
                this.error = err.response.data.msg || '数据获取失败'
              } else {
                this.error = '数据获取失败：' + err.message
              }
            } finally {
              this.loading = false
            }
          },
          async getPollsByUserId(creatorId) {
            this.loading = true
            this.error = null
            try {
              const response = await axios.get(
                `http://localhost:8080/api/polls/user/${creatorId}`
              )
              if (response.data.code === 200) {
                this.polls = response.data.data
              } else {
                this.error = response.data.msg || '数据获取失败'
              }
            } catch (err) {
              if (err.response && err.response.data) {
                this.error = err.response.data.msg || '数据获取失败'
              } else {
                this.error = '数据获取失败' + err.message
              }
            } finally {
              this.loading = false 
            }
          },
        async getPollDetail(pollId, userId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/polls/detailed/${pollId}`,
                    {params: { userId }
                });
                if (response.data.code === 200) {
                    return response.data;
                } else {
                    this.error = response.data.msg || '数据获取失败';
                }
            } catch (err) {
                this.error = err.response?.data?.msg || '数据获取失败';
            } finally {
                this.loading = false;
            }
        },
        async fetchActivePolls() {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get('http://localhost:8080/api/polls/active')
                if (response.data.code === 200) {
                    this.activePolls = response.data.data
                } else {
                    this.error = response.data.msg || '获取活动投票失败'
                }
            } catch (err) {
                this.error = '获取活动投票失败: ' + (err.response?.data?.msg || err.message)
            } finally {
                this.loading = false
            }
        },
        async viewPollDetail(pollId){
            try {
                const response = await axios.get(`http://localhost:8080/api/polls/detailed/${pollId}`)
                if (response.data.code === 200) {
                    return response.data
                } else {
                    ElMessage.error('获取投票详情失败')
                }
            } catch (error) {
                ElMessage.error('获取投票详情失败' + error)
            }
        }
    }
})