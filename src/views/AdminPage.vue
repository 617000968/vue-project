<template>
  <div class="admin-container">
    <!-- 导航菜单 -->
    <nav>
      <button @click="currentTab = 'categories'">分类管理</button>
      <button @click="currentTab = 'polls'">投票管理</button>
      <button @click="currentTab = 'users'">用户管理</button>
    </nav>

    <!-- 分类管理 -->
    <div v-if="currentTab === 'categories'" class="category-management">
      <h2>分类管理</h2>

      <!-- 创建分类 -->
      <div class="create-category">
        <input v-model="newCategoryName" placeholder="输入分类名称">
        <button @click="createCategory">创建分类</button>
      </div>

      <!-- 分类列表 -->
      <table>
        <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>状态</th>
          <th>关联投票数</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="category in categories" :key="category.categoryId">
          <td>{{ category.categoryId }}</td>
          <td>
            <input v-if="category.editing" v-model="category.name">
            <span v-else>{{ category.name }}</span>
          </td>
          <td>
            <button
                :class="{ 'active': category.active }"
                @click="toggleCategoryStatus(category)"
            >
              {{ category.active ? '激活' : '禁用' }}
            </button>
          </td>
          <td>{{ category.count }}</td>
          <td>
            <button v-if="category.editing" @click="saveCategory(category)">保存</button>
            <button v-else @click="category.editing = true">编辑</button>
            <button @click="deleteCategory(category.categoryId)">删除</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 投票管理 -->
    <div v-if="currentTab === 'polls'" class="poll-management">
      <h2>投票管理</h2>

      <table>
        <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>分类</th>
          <th>开始时间</th>
          <th>结束时间</th>
          <th>最大选项</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="poll in polls" :key="poll.pollId">
          <td>{{ poll.pollId }}</td>
          <td>
            <input v-if="poll.editing" v-model="poll.editData.title">
            <span v-else>{{ poll.title }}</span>
          </td>
          <td>
            <select v-if="poll.editing" v-model="poll.editData.categoryId">
              <option v-for="c in categories" :value="c.categoryId">{{ c.name }}</option>
            </select>
            <span v-else>{{ poll.categoryDTO.name }}</span>
          </td>
          <td>
            <input v-if="poll.editing" type="datetime-local" v-model="poll.editData.startTime">
            <span v-else>{{ formatDate(poll.startTime) }}</span>
          </td>
          <td>
            <input v-if="poll.editing" type="datetime-local" v-model="poll.editData.endTime">
            <span v-else>{{ formatDate(poll.endTime) }}</span>
          </td>
          <td>
            <input v-if="poll.editing" type="number" v-model="poll.editData.maxChoice">
            <span v-else>{{ poll.maxChoice }}</span>
          </td>
          <td>
            <button v-if="poll.editing" @click="savePoll(poll)">保存</button>
            <button v-else @click="startEditPoll(poll)">编辑</button>
            <button @click="deletePoll(poll.pollId)">删除</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 用户管理 -->
    <div v-if="currentTab === 'users'" class="user-management">
      <h2>用户管理</h2>

      <table>
        <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>昵称</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>状态</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.userId">
          <td>{{ user.userId }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.nickname }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td :class="{ 'deleted': user.deleted }">
            {{ user.deleted ? '已删除' : '正常' }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 响应式状态
const currentTab = ref('categories')
const categories = ref([])
const polls = ref([])
const users = ref([])
const newCategoryName = ref('')

// 生命周期钩子
onMounted(async () => {
  await Promise.all([loadCategories(), loadPolls(), loadUsers()])
})

// 分类管理相关方法
const loadCategories = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/admin/category/all/detailed')
    categories.value = data.data.map(c => ({ ...c, editing: false }))
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const createCategory = async () => {
  if (!newCategoryName.value.trim()) return
  try {
    await axios.post('http://localhost:8080/admin/category/create', {
      name: newCategoryName.value
    })
    newCategoryName.value = ''
    await loadCategories()
  } catch (error) {
    console.error('创建分类失败:', error)
  }
}

// 投票管理相关方法
const loadPolls = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/api/polls/all')
    polls.value = data.data.map(p => ({
      ...p,
      editing: false,
      editData: { ...p }
    }))
  } catch (error) {
    console.error('加载投票失败:', error)
  }
}

// 用户管理相关方法
const loadUsers = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/api/auth/all')
    users.value = data.data
  } catch (error) {
    console.error('加载用户失败:', error)
  }
}

// 通用方法
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// 操作处理方法
const toggleCategoryStatus = async (category) => {
  try {
    await axios.put(`http://localhost:8080/admin/category/status/${category.categoryId}`)
    category.active = !category.active
  } catch (error) {
    console.error('切换状态失败:', error)
  }
}

const saveCategory = async (category) => {
  try {
    await axios.put(`http://localhost:8080/admin/category/update`, {
      categoryId: category.categoryId,
      name: category.name
    })
    category.editing = false
  } catch (error) {
    console.error('保存分类失败:', error)
  }
}

const deleteCategory = async (id) => {
  if (!confirm('确认删除该分类吗？')) return
  try {
    await axios.delete(`http://localhost:8080/admin/category/delete/${id}`)
    await loadCategories()
  } catch (error) {
    console.error('删除分类失败:', error)
  }
}

const startEditPoll = (poll) => {
  poll.editing = true
  poll.editData = { ...poll }
}

const savePoll = async (poll) => {
  try {
    await axios.put(`http://localhost:8080/api/polls/update/${poll.pollId}`, {
      title: poll.editData.title,
      description: poll.editData.description,
      startTime: poll.editData.startTime,
      endTime: poll.editData.endTime,
      categoryId: poll.editData.categoryId,
      maxChoice: poll.editData.maxChoice
    })
    Object.assign(poll, poll.editData)
    poll.editing = false
  } catch (error) {
    console.error('保存投票失败:', error)
  }
}

const deletePoll = async (id) => {
  if (!confirm('确认删除该投票吗？')) return
  try {
    await axios.delete(`http://localhost:8080/api/polls/delete/${id}`)
    await loadPolls()
  } catch (error) {
    console.error('删除投票失败:', error)
  }
}
</script>

<style scoped>
.admin-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 导航菜单样式 */
nav {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
}

nav button {
  padding: 10px 24px;
  border-radius: 6px;
  border: none;
  background: #f0f0f0;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

nav button:hover {
  background: #e0e0e0;
}

nav button.active {
  background: #409eff;
  color: white;
}

/* 通用表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

tr:hover {
  background-color: #f8f9fa;
}

/* 按钮样式 */
button {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

button:hover {
  opacity: 0.9;
}

/* 操作按钮颜色 */
button:active {
  transform: scale(0.98);
}

button[class="active"] {
  background: #67c23a;
  color: white;
}

button:not([class]) {
  background: #409eff;
  color: white;
}

button + button {
  margin-left: 8px;
}

/* 删除按钮样式 */
button:last-child:not(.active) {
  background: #f56c6c;
}

/* 输入框样式 */
input, select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.1);
}

input[type="datetime-local"] {
  width: 180px;
}

/* 状态指示 */
.deleted {
  color: #f56c6c;
  font-weight: 500;
}

/* 分类激活状态 */
td button.active {
  background: #67c23a;
}

td button:not(.active) {
  background: #909399;
}

/* 创建分类区域 */
.create-category {
  margin: 20px 0;
  display: flex;
  gap: 12px;
}

.create-category input {
  flex: 1;
  max-width: 300px;
}

.create-category button {
  background: #67c23a;
}

/* 编辑状态高亮 */
tr.editing td {
  background: #f0f9ff;
}

/* 卡片式容器 */
.category-management,
.poll-management,
.user-management {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

h2 {
  margin: 0 0 1.5rem 0;
  color: #303133;
  font-size: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}
</style>