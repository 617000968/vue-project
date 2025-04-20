<template>
    <div class="poll-list">

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">加载中...</div>
  
      <!-- 错误状态 -->
      <div v-if="error" class="error">{{ error }}</div>
      <!-- 数据展示 -->
      <div v-for="poll in polls" :key="poll.pollId" class="poll-item" @click="viewPollDetail(poll.pollId)">
        <div class="poll-header">
          <h2>{{ poll.title }}</h2>
          <span class="category">{{ poll.categoryDTO.name }}</span>
        </div>
  
        <div class="poll-body">
          <p class="description">{{ poll.description }}</p>
  
          <div class="time-range">
            <span>开始时间：{{ formatDate(poll.startTime) }}</span>
            <span>结束时间：{{ formatDate(poll.endTime) }}</span>
          </div>
  
          <div class="meta-info">
            <span>创建者：{{ poll.userBasicDTO.nickname }}</span>
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
  import { usePollNavigation } from "@/utils/navigation.js";

  const { viewPollDetail } = usePollNavigation()

  const props = defineProps({
    creatorId: {
      type: Number,
      required: true
    }
  })
  
  // 使用 Store
  const pollStore = usePollStore()
  const { polls, loading, error } = storeToRefs(pollStore)
  
  // 组件挂载时获取数据
  onMounted(() => {
    pollStore.getPollsByUserId(props.creatorId)
  })
  
  // 日期格式化函数
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString()
  }
  </script>
  
  <style scoped>
  .poll-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
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
    margin-bottom: 15px;
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
  