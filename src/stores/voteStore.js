import { defineStore}  from "pinia";
import axios from 'axios'
import { ElMessage } from "element-plus";

export const useVoteStore = defineStore('voteStore', {
    state: () => ({
        votes: [],
        loading: false,
        error: null
    }),
    actions: {
        async submitVote(voteData) {
            try {
                const response = await axios.post('http://localhost:8080/api/votes/create', voteData, {
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    }
                })
                if (response.data.code === 200) {
                    return response.data
                }
                ElMessage.success('投票成功')
            } catch (err) {
                ElMessage.error(err.message)
            } finally {
                this.loading = false;
            }
        },
        async checkHasVoted(optionId, userId) {
            try {
                const response = await axios.get(`
                http://localhost:8080/api/votes/exists?optionId=${optionId}&userId=${userId}`
                )
                return response.data
            } catch (error) {
                ElMessage.error('检查投票状态失败' + error)
            }
        },
        async submitAnonymousVote(voteData) {
            try {
                const response = await axios.post(
                    'http://localhost:8080/api/votes/anonymous',
                    voteData,
                    {
                        headers: {
                            'X-Device-Hash': voteData.deviceHash,
                            'X-Anonymous-Token': voteData.token
                        }
                    }
                )
                return response.data
            } catch (err) {
                throw new Error(err.response?.data?.msg || '投票失败')
            }
        }


    }
})