<template>
    <div class="user-container">
      <el-card class="user-info-card" shadow="hover">
        <template v-slot:header>
<div  class="clearfix">
          <span>用户中心</span>
          <el-button style="float: right; margin-right: 30px;" type="primary" size="mini" @click="openUserUpdatePage">更新信息</el-button>
        </div>
</template>
        <el-row :gutter="70" style="padding-top: 30px;">
          <el-col :span="12">
            <div class="info-row">
              <span class="label">用户名：</span>
              <el-tag>{{ userStore.username }}</el-tag>
            </div>
            <div class="info-row">
              <span class="label">昵&nbsp;&nbsp;&nbsp;称：</span>
              <el-tag type="success">{{ userStore.nickname }}</el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-row">
              <span class="label">邮&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;箱：</span>
              <el-tag type="info">{{ userStore.email }}</el-tag>
            </div>
            <div class="info-row">
              <span class="label">注册时间：</span>
              <el-tag type="warning">{{ formatTime(userStore.createTime) }}</el-tag>
            </div>
            <div class="info-row">
              <span class="label">最后更新：</span>
              <el-tag type="danger">{{ formatTime(userStore.updateTime) }}</el-tag>
            </div>
          </el-col>
        </el-row>
      </el-card>
  
      <!-- 编辑用户信息对话框 -->
      <el-dialog title="编辑用户信息" v-model:visible="editDialogVisible">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="昵称">
            <el-input v-model="editForm.nickname"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
<div  class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">确 定</el-button>
        </div>
</template>
      </el-dialog>
  
      <!-- 选项卡导航 -->
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="我创建的投票" name="myPolls">
          <PollCreator
              :creator-id="userStore.userId"
              :show-header="false"
              class="creator-polls"
          />
        </el-tab-pane>
        <el-tab-pane label="我参与的投票" name="1">
          <div v-loading="loading">
            <el-table
                :data="voteList"
                style="width: 100%"
                empty-text="暂无参与记录"
            >
              <el-table-column prop="pollName" label="投票名称" width="200" />
              <el-table-column prop="optionText" label="所选选项">
                <template #default="{ row }">
                  <el-tag type="success">{{ row.optionText }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="参与时间">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '@/stores/user'
  import dayjs from 'dayjs'
  import { useRouter } from 'vue-router'
  import {ElMessage} from "element-plus";
  import axios from "axios";
  import PollCreator from "@/views/PollCreator.vue";

  const router = useRouter()

  const voteList = ref([])
  const loading = ref(false)
  const userStore = useUserStore()
  const activeTab = ref('myPolls')
  const editDialogVisible = ref(false)
  const editForm = ref({
    nickname: userStore.nickname,
    email: userStore.email
  })
  
  // 时间格式化方法
  const formatTime = (timestamp) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  }
  const fetchVoteHistory = async () => {
    try {
      loading.value = true
      const response = await axios.get(
          `http://localhost:8080/api/votes/user/${userStore.userId}`
      )
      if (response.data.code === 200) {
        voteList.value = response.data.data
      }
    } catch (error) {
      ElMessage.error('获取参与记录失败：' + error.message)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchVoteHistory()
  })
  const openUserUpdatePage = () => {
    editForm.value.nickname = userStore.nickname
    editForm.value.email = userStore.email
    editDialogVisible.value = true
    router.push('/user/update')
  }
  
  // 提交编辑信息
  const submitEdit = () => {
    // 在此处添加更新用户信息的逻辑，例如调用 API
    userStore.nickname = editForm.value.nickname
    userStore.email = editForm.value.email
    editDialogVisible.value = false
    
  }
  </script>
  <style scoped>
  .creator-polls {
    margin-top: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 15px;
  }
  .user-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
  }
  
  .user-info-card {
    margin-bottom: 30px;
  }
  
  .info-row {
    margin-bottom: 15px;
    font-size: 16px;
  }
  
  .label {
    display: inline-block;
    width: 100px;
    color: #666;
    font-weight: 500;
  }
  </style>
  