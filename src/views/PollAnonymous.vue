<template>
  <div class="poll-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载投票数据中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- 投票主体 -->
    <div v-if="pollData" class="poll-content">
      <h1>{{ pollData.title }}</h1>
      <p class="deadline">截止时间：{{ formatDate(pollData.endTime) }}</p>
      <p class="max-choice">最多选择 {{ pollData.maxChoice }} 个选项</p>

      <!-- 单选模式 -->
      <div v-if="pollData.maxChoice === 1">
        <div
            v-for="option in pollData.voteCountResponseDTO"
            :key="option.optionId"
            class="option-item"
        >
          <label>
            <input
                type="radio"
                v-model="selectedOptions"
                :value="option.optionId"
                :disabled="pollData.voted"
            />
            <!-- 明确显示选项文字 -->
            <span class="option-text">{{ option.optionText }}</span>
          </label>
        </div>
      </div>

      <!-- 多选模式 -->
      <div v-else>
        <div
            v-for="option in pollData.voteCountResponseDTO"
            :key="option.optionId"
            class="option-item"
        >
          <label>
            <input
                type="checkbox"
                v-model="selectedOptions"
                :value="option.optionId"
                :disabled="pollData.voted || selectedOptions.length >= pollData.maxChoice"
            />
            <!-- 明确显示选项文字 -->
            <span class="option-text">{{ option.optionText }}</span>

          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button
            v-if="pollData.voted"
            class="voted-btn"
            disabled
        >
          已参与投票
        </button>
        <button
            v-else
            @click="handleSubmit"
            :disabled="selectedOptions.length === 0"
            class="submit-btn"
        >
          提交投票（已选 {{ selectedOptions.length }} / {{ pollData.maxChoice }}）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import {ElMessage} from "element-plus";

const route = useRoute()

// 响应式数据
const pollData = ref(null)
const loading = ref(false)
const error = ref(null)
const selectedOptions = ref([])
const deviceHash = ref('')

// 获取匿名码
const anonymousCode = route.params.anonymousCode

// 初始化设备指纹
const initDeviceHash = async () => {
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    deviceHash.value = result.visitorId
  } catch (err) {
    console.error('设备指纹生成失败:', err)
    deviceHash.value = `fallback_hash_${Date.now()}`
  }
}

// 获取投票数据
const fetchPollData = async () => {
  try {
    loading.value = true
    const headers = {}

    const response = await axios.get(
        `http://localhost:8080/api/polls/anonymous/${anonymousCode}`,
        { headers }
    )

    if (response.data.code === 200) {
      pollData.value = response.data.data
      // 保存新令牌
    }
  } catch (err) {
    ElMessage.error('获取投票数据失败：' + err.message)
  } finally {
    loading.value = false
  }
}

// 提交投票
const submitVote = async () => {
  try {
    const headers = {
      'Device-Hash': deviceHash.value
    }
    const payload = {
      pollId: pollData.value.pollId,
      optionId: pollData.value.maxChoice === 1
          ? [selectedOptions.value]
          : selectedOptions.value
    }
    console.log(payload)
    const response = await axios.post(
        'http://localhost:8080/api/anonymousVote/create',
        payload,
        {headers}
    )

    if (response.data.code === 200) {
      // 刷新数据
      await fetchPollData()
      ElMessage.success('投票成功！')
    }
  } catch (err) {
    handleError(err)
  }
}

// 错误处理
const handleError = (err) => {
  if (err.response) {
    switch (err.response.status) {
      case 400:
        error.value = '请求参数错误'
        break
      case 401:
        error.value = '身份验证失败'
        break
      case 404:
        error.value = '投票不存在'
        break
      default:
        error.value = err.response.data?.msg || '请求失败'
    }
  } else {
    error.value = '网络连接失败'
  }
}

// 处理提交
const handleSubmit = () => {
  if (selectedOptions.value.length === 0) {
    error.value = '请至少选择一个选项'
    return
  }
  if (selectedOptions.value.length > pollData.value.maxChoice) {
    error.value = `最多选择 ${pollData.value.maxChoice} 个选项`
    return
  }
  submitVote()
}

// 时间格式化
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期钩子
onMounted(async () => {
  await initDeviceHash()
  await fetchPollData()
})
</script>

<style scoped>
.option-text {
  margin-left: 8px;
  font-size: 16px;
  color: #333;
}
.poll-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.deadline {
  color: #666;
  font-size: 0.9em;
}


.option-item {
  margin: 10px 0;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-item label {
  align-items: center;
  gap: 10px;
}

.actions {
  text-align: center;
  margin-top: 30px;
}

.submit-btn {
  background: #2196F3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #90CAF9;
  cursor: not-allowed;
}

.voted-btn {
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
}
</style>