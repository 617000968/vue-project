<template>
    <div class="poll-list">
      <div v-if="loading" class="loading">加载中...</div>
  
      <div v-if="error" class="error">{{ error }}</div>
  
      <div v-for="poll in polls" :key="poll.pollId" class="poll-item" @click="viewPollDetail(poll.pollId)">
        <div class="poll-header">
          <h2>{{ poll.title }}</h2>
          <div class="tags">
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
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { usePollStore } from '@/stores/pollStore'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import resetMessage from '@/utils/resetMessage';
  import { usePollNavigation } from "@/utils/navigation.js";

  const { viewPollDetail } = usePollNavigation();

  const router = useRouter();
  const pollStore = usePollStore()
  const { polls, loading, error } = storeToRefs(pollStore)
  // eslint-disable-next-line no-unused-vars
  const user = localStorage.getItem('user')
  onMounted(() => {
    pollStore.getAllPolls()
  })
  

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString()
  }
  const selectCategory = async (categoryId) => {
    console.log('Selecting category:', categoryId)
    try {
      await pollStore.getPollsByCategoryId(categoryId);
      await router.push({
        name: 'CategoryPolls',
        params: { categoryId }
      });
    } catch (error) {
      resetMessage.error(`加载失败: ${error.message}`);
    }
  };
  const selectUser = async (creatorId) => {
    console.log('Selecting user:', creatorId)
    try {
      const numericCreatorId = Number(creatorId); // 或使用 +creatorId
      await pollStore.getPollsByUserId(numericCreatorId);
      await router.push({
        name: 'CreatorPolls',
        params: { creatorId: numericCreatorId }
      });
    } catch (error) {
      resetMessage.error(`加载失败: ${error.message}`);
    }
  };

  </script>
  
  <style scoped>
  .poll-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  .tags {
  display: flex;
  align-items: center;
  gap: 8px;
}
  .poll-item {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    padding: 20px;
  }
  
  .poll-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
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
}
  
  .time-range {
    display: flex;
    gap: 15px;
    margin: 10px 0;
    color: #666;
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
  
  .loading, .error {
    text-align: center;
    padding: 20px;
    font-size: 1.2em;
  }
  </style>
  