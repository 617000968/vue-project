<template>
  <div class="poll-detail-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="pollData" class="poll-detail">
      <!-- 投票标题和基本信息 -->
      <div class="poll-header">
        <h1>{{ pollData.title }}</h1>
        <div class="meta-info">
          <span>创建者：{{ pollData.userBasicDTO.nickname }}</span>
          <span>分类：{{ pollData.categoryDTO.name }}</span>
          <span>截止时间：{{ formatDate(pollData.endTime) }}</span>
        </div>
      </div>

      <!-- 投票描述 -->
      <div class="poll-description">
        <p>{{ pollData.description }}</p>
      </div>

      <!-- 投票选项 -->
      <div class="vote-options">
        <div
            v-for="option in pollData.voteCountResponseDTO"
            :key="option.optionId"
            class="option-item"
            @click="toggleOption(option.optionId)"
            :class="{
            'selected': isOptionSelected(option.optionId),
            'disabled': pollData.voted
          }"
        >
          <label class="option-content">
            <div class="selection-control">
              <input
                  v-if="pollData.maxChoice === 1"
                  type="radio"
                  :checked="singleSelected === option.optionId"
                  :disabled="pollData.voted"
                  :name="'poll-radio-' + pollId"
              />
              <input
                  v-else
                  type="checkbox"
                  :checked="multiSelected.includes(option.optionId)"
                  :disabled="pollData.voted"
              />
            </div>
            <div class="option-text">
              <span class="text">{{ option.optionText }}</span>
              <span v-if="showResults" class="vote-count">
                {{ option.count }}票 ({{ calculatePercentage(option.count) }}%)
                <span v-if="hasVotedOptions[option.optionId]" class="voted-tag">✓ 我的选择</span>
              </span>
            </div>
          </label>
        </div>
      </div>

      <!-- 投票操作区域 -->
      <div class="vote-actions">
        <template v-if="pollData.voted">
          <button class="voted-button" disabled>已投票</button>
        </template>
        <template v-else>
          <template v-if="pollData.anonymous">
            <!-- 匿名投票：仅未登录可投 -->
            <template v-if="isLoggedIn">
              <button class="vote-button" disabled>该投票仅限未登录用户参与</button>
            </template>
            <template v-else>
              <button
                  @click="handleVote"
                  :disabled="!canSubmit"
                  class="vote-button"
              >
                提交投票（已选 {{ selectedCount }} / {{ pollData.maxChoice }}）
              </button>
            </template>
          </template>
          <template v-else>
            <!-- 实名投票：仅登录可投 -->
            <template v-if="!isLoggedIn">
              <button class="vote-button" disabled>请登录后投票</button>
            </template>
            <template v-else>
              <button
                  @click="handleVote"
                  :disabled="!canSubmit"
                  class="vote-button"
              >
                提交投票（已选 {{ selectedCount }} / {{ pollData.maxChoice }}）
              </button>
            </template>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePollStore } from '@/stores/pollStore'
import resetMessage from '@/utils/resetMessage'
import { useVoteStore } from "@/stores/voteStore.js"

const hasVotedOptions = ref({})
const route = useRoute()
const pollStore = usePollStore()
const voteStore = useVoteStore()
const pollData = ref(null)
const loading = ref(false)
const error = ref(null)
const showResults = ref(false)
const singleSelected = ref(null)
const multiSelected = ref([])

// 新增方法：切换选项
const toggleOption = (optionId) => {
  if (pollData.value?.voted) return

  // 处理单选
  if (pollData.value.maxChoice === 1) {
    singleSelected.value = singleSelected.value === optionId ? null : optionId
    return
  }

  // 处理多选
  const index = multiSelected.value.indexOf(optionId)
  if (index === -1) {
    if (multiSelected.value.length < pollData.value.maxChoice) {
      multiSelected.value.push(optionId)
    }
  } else {
    multiSelected.value.splice(index, 1)
  }
}

// 新增方法：判断选项是否选中
const isOptionSelected = (optionId) => {
  return pollData.value.maxChoice === 1
      ? singleSelected.value === optionId
      : multiSelected.value.includes(optionId)
}

// 检查投票状态
const checkOptionVotedStatus = async () => {
  if (!isLoggedIn.value) return

  try {
    const promises = pollData.value.voteCountResponseDTO.map(option =>
        voteStore.checkHasVoted(option.optionId, userId)
    )

    const results = await Promise.all(promises)

    const votedStatus = {}
    results.forEach((result, index) => {
      const optionId = pollData.value.voteCountResponseDTO[index].optionId
      votedStatus[optionId] = result.data
    })

    hasVotedOptions.value = votedStatus
  } catch (error) {
    console.error('检查投票状态失败:', error)
    resetMessage.error('无法获取投票状态')
  }
}

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user')
})

const selectedOptions = computed(() => {
  if (pollData.value?.maxChoice === 1) {
    return singleSelected.value !== null ? [singleSelected.value] : []
  } else {
    return multiSelected.value.filter(id => id !== null)
  }
})

const pollId = parseInt(route.params.pollId)
const userId = JSON.parse(localStorage.getItem('user'))?.userId

const selectedCount = computed(() => {
  return selectedOptions.value.length
})

const canSubmit = computed(() => {
  return selectedOptions.value.length > 0 &&
      selectedOptions.value.length <= pollData.value?.maxChoice
})

// 初始化加载数据
onMounted(async () => {
  try {
    loading.value = true
    const response = await pollStore.getPollDetail(pollId, userId)
    if (response?.code === 200) {
      pollData.value = response.data
      showResults.value = response.data.voted
      await checkOptionVotedStatus()
    }
  } catch (err) {
    error.value = err.message || '加载投票详情失败'
  } finally {
    loading.value = false
  }
})

// 处理投票提交
const handleVote = async () => {
  try {
    const currentTime = Date.now()
    const endTime = new Date(pollData.value.endTime).getTime()

    if (currentTime > endTime) {
      resetMessage.error('投票已结束，无法提交')
      return
    }

    if (pollData.value.anonymous && isLoggedIn.value) {
      resetMessage.error('该投票仅限未登录用户参与')
      return
    }
    if (!pollData.value.anonymous && !isLoggedIn.value) {
      resetMessage.error('请登录后投票')
      return
    }

    if (selectedOptions.value.length === 0) {
      resetMessage.error('请至少选择一个选项')
      return
    }

    const voteData = {
      pollId: pollId,
      userId: userId,
      optionId: selectedOptions.value
    }

    const result = await voteStore.submitVote(voteData)
    if (result.code === 200) {
      resetMessage.success('投票成功！')
      const response = await pollStore.getPollDetail(pollId, userId)
      pollData.value = response.data
      showResults.value = true
      singleSelected.value = null
      multiSelected.value = []
    }
  } catch (err) {
    resetMessage.error(err.message || '投票提交失败')
  }
}

// 工具方法
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const calculatePercentage = (count) => {
  const total = pollData.value.voteCountResponseDTO.reduce((sum, o) => sum + o.count, 0)
  return total === 0 ? 0 : Math.round((count / total) * 100)
}
</script>

<style scoped>
.poll-detail-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.poll-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.meta-info {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
}

.poll-description {
  margin-bottom: 25px;
  line-height: 1.6;
  color: #444;
}

.vote-options {
  margin: 25px 0;
}

.option-item {
  cursor: pointer;
  border: 2px solid #eee;
  border-radius: 8px;
  margin: 10px 0;
  transition: all 0.2s ease;
}

.option-item:hover:not(.disabled) {
  border-color: #2196F3;
  background-color: #f5faff;
}

.option-item.selected:not(.disabled) {
  border-color: #2196F3;
  background-color: #e3f2fd;
}

.option-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  margin: 0;
}

.selection-control {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.selection-control input {
  margin: 0;
  width: 18px;
  height: 18px;
}

.option-text {
  flex-grow: 1;
  min-width: 0;
}

.text {
  display: block;
  margin-bottom: 5px;
  font-size: 1.1em;
}

.vote-count {
  color: #666;
  font-size: 0.9em;
  display: block;
}

.voted-tag {
  color: #4CAF50;
  margin-left: 10px;
  font-weight: 500;
}

.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.vote-actions {
  margin-top: 30px;
  text-align: center;
}

.vote-button {
  background: #2196F3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 1em;
}

.vote-button:disabled {
  background: #90CAF9;
  cursor: not-allowed;
}

.voted-button {
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
}

.loading, .error {
  text-align: center;
  padding: 30px;
  font-size: 1.2em;
  color: #666;
}
</style>