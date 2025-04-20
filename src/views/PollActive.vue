<template>
  <div class="poll-list">
    <div v-loading="pollStore.loading">
      <el-alert
          v-if="pollStore.error"
          :title="pollStore.error"
          type="error"
          show-icon
          class="error"
      />

      <div v-for="poll in pollStore.activePolls"
           :key="poll.pollId"
           class="poll-item"
           @click="viewPollDetail(poll.pollId)">
        <div class="poll-header">
          <h2>{{ poll.title }}</h2>
          <div class="header-right">
            <span v-if="poll.anonymous" class="anonymous-tag">匿名</span>
            <span
                class="category"
                @click.stop.prevent="selectCategory(poll.categoryDTO.categoryId)"
            >{{ poll.categoryDTO.name }}</span>
          </div>
        </div>

        <div class="poll-body">
          <p class="description">{{ poll.description }}</p>

          <div class="time-range">
            <span>开始时间：{{ formatDate(poll.startTime) }}</span>
            <span>结束时间：{{ formatDate(poll.endTime) }}</span>
          </div>

          <div class="meta-info">
            <span @click.stop.prevent="selectUser(poll.userBasicDTO.userId)">
              创建者：{{ poll.userBasicDTO.nickname }}
            </span>
            <span>创建时间：{{ formatDate(poll.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePollStore } from '@/stores/pollStore'
import { onMounted } from 'vue'
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import resetMessage from '@/utils/resetMessage';

const router = useRouter()
const pollStore = usePollStore()

const viewPollDetail = (pollId) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const userId = user?.userId || null
  router.push({
    name: 'PollDetail',
    params: { pollId },
    query: { userId }
  })
  pollStore.setSelectedPollId(pollId)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const refreshPolls = async () => {
  try {
    await pollStore.fetchActivePolls()
    ElMessage.success('投票列表已刷新')
  } catch (error) {
    resetMessage.error('刷新失败: ' + error.message)
  }
}

const selectCategory = async (categoryId) => {
  try {
    await pollStore.getPollsByCategoryId(categoryId)
    await router.push({
      name: 'CategoryPolls',
      params: { categoryId }
    })
  } catch (error) {
    resetMessage.error(`加载失败: ${error.message}`)
  }
}

const selectUser = async (creatorId) => {
  try {
    const numericCreatorId = Number(creatorId)
    await pollStore.getPollsByUserId(numericCreatorId)
    await router.push({
      name: 'CreatorPolls',
      params: { creatorId: numericCreatorId }
    })
  } catch (error) {
    resetMessage.error(`加载失败: ${error.message}`)
  }
}

onMounted(async () => {
  await pollStore.fetchActivePolls()
})
</script>

<style scoped>
.poll-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.error {
  margin: 20px 0;
}

.poll-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.poll-item:hover {
  transform: translateY(-3px);
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.anonymous-tag {
  background: #ffebee;
  color: #d32f2f;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s;
}

.category:hover {
  background: #bbdefb;
}

.time-range {
  display: flex;
  gap: 15px;
  margin: 10px 0;
  color: #666;
  font-size: 0.9em;
}

.meta-info {
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 0.9em;
  color: #888;
}

.meta-info span {
  cursor: pointer;
  transition: color 0.2s;
}

.meta-info span:hover {
  color: #1976d2;
}

.description {
  color: #444;
  margin: 10px 0;
  font-size: 0.95em;
  line-height: 1.5;
}
</style>