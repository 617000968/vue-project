import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: '',
        username: '',
        password: '',
        nickname: '',
        email: '',
        createTime: '',
        updateTime: '',
        isAuthenticated: false,
    }),
    actions: {
        setUser(userData) {
            this.userId = userData.userId
            this.username = userData.username
            this.password = userData.password
            this.nickname = userData.nickname
            this.email = userData.email
            this.createTime = userData.createTime
            this.updateTime = userData.updateTime
            this.isAuthenticated = true
        },
        logout() {
            this.userId = '',
            this.username = '',
            this.password = '',
            this.nickname = '',
            this.email = '',
            this.createTime = '',
            this.updateTime = '',
            this.isAuthenticated = false
        }
        
    }
})