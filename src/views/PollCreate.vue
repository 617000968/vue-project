<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" style="padding-top: 30px;">
      <el-form-item label="投票标题" prop="title">
        <el-input v-model="form.title" />
      </el-form-item>

      <el-form-item label="投票描述" prop="description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>

      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" />
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" />
      </el-form-item>

      <el-form-item label="最大选项数" prop="maxChoice">
        <el-input-number v-model="form.maxChoice" :min="1" />
      </el-form-item>

      <el-form-item label="是否匿名" prop="isAnonymous">
        <el-switch v-model="form.isAnonymous" />
      </el-form-item>

      <el-form-item
          label="匿名码"
          prop="anonymousCode"
          v-if="form.isAnonymous"
      >
        <el-input
            v-model.trim="form.anonymousCode"
            placeholder="请输入5-10位匿名码"
            maxlength="10"
            show-word-limit
        />
      </el-form-item>
      <el-form-item label="投票选项" prop="options">
        <div v-for="(option, index) in form.options" :key="index" class="option-item">
          <el-input
              v-model="form.options[index]"
              placeholder="请输入选项内容"
              :rules="{ required: true, message: '选项不能为空', trigger: 'blur' }"
          >
            <template #append>
              <el-button
                  @click="removeOption(index)"
                  icon="el-icon-close"
                  :disabled="form.options.length <= 2"
              />
            </template>
          </el-input>
        </div>
        <el-button type="primary" @click="addOption" plain>添加选项</el-button>
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading">加载中...</div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error">{{ error }}</div>
        <el-select v-else v-model="form.categoryId" placeholder="请选择分类">
    <el-option
      v-for="category in categories"
      :key="category.categoryId"
      :label="category.name"
      :value="category.categoryId"
    />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </template>

  <script setup>
  import axios from 'axios'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {ref, reactive, onMounted, watch} from 'vue'
  import {usePollStore} from "@/stores/pollStore.js";

  const pollStore = usePollStore()
  const route = useRoute()
  const router = useRouter()
  const formRef = ref(null)

  const form = reactive({
    title: '',
    description: '',
    creator_id: null,
    startTime: '',
    endTime: '',
    maxChoice: 1,
    isAnonymous: false,
    anonymousCode: '',
    categoryId: null,
    options: ['', '']
  })

  const rules = {
    title: [
      { required: true, message: '请输入投票标题', trigger: 'blur' },
      { min: 5, max: 255, message: '标题长度应在5到255个字符之间', trigger: 'blur' },
    ],
    description: [
      { max: 255, message: '描述长度不能超过255个字符', trigger: 'blur' },
    ],
    startTime: [
      { required: true, message: '请选择开始时间', trigger: 'change' },
    ],
    endTime: [
      { required: true, message: '请选择结束时间', trigger: 'change' },
    ],
    maxChoice: [
      { required: true, message: '请输入最大选项数', trigger: 'blur' },
      { type: 'number', min: 1, message: '最大选项数必须大于0', trigger: 'blur' },
    ],
    isAnonymous: [
      { required: true, message: '请选择是否匿名', trigger: 'change' },
    ],
    anonymousCode: [
      {
        validator: (rule, value, callback) => {
          if (form.isAnonymous) {
            if (!value || value.trim() === '') {
              callback(new Error('匿名码不能为空'))
            } else if (value.length < 5 || value.length > 10) {
              callback(new Error('匿名码长度应在5到10个字符之间'))
            } else {
              callback()
            }
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    categoryId: [
      { required: true, message: '请选择分类', trigger: 'change' },
    ],
    options: [
      {
        validator: (_, value, callback) => {
          if (value.length < 2) {
            callback(new Error('至少需要两个选项'))
            return
          }
          if (value.some(opt => !opt.trim())) {
            callback(new Error('选项内容不能为空'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  }

  watch(
      () => form.isAnonymous,
      (newValue) => {
        if (!newValue) {
          form.anonymousCode = ''
        }
      }
  )

  const categories = ref([]);
const error = ref(null);
  const addOption = () => {
    form.options.push('')
  }
  const removeOption = (index) => {
    if (form.options.length > 2) {
      form.options.splice(index, 1)
    }
  }
  const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/admin/category/active');
    if (response.data.code === 200) {
      categories.value = response.data.data;
      error.value = null; // 清除之前的错误
    } else {
      error.value = response.data.msg || '获取分类列表失败';
      categories.value = []; // 清空分类列表
    }
  } catch {
    error.value = '获取分类列表失败';
    categories.value = []; // 清空分类列表
  }
};

  const fetchPollData = async (pollId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/polls/${pollId}`)
      console.log(response.data)
      if (response.data.code === 200) {
        const data = response.data.data
        form.id = 100
        form.title = data.title
        form.description = data.description
        form.creator_id = localStorage.getItem('user.userId')
        form.startTime = data.startTime
        form.endTime = data.endTime
        form.maxChoice = data.maxChoice
        form.isAnonymous = data.isAnonymous
        form.categoryId = data.categoryId
      }
    } catch {
      ElMessage.error('获取投票信息失败')
    }
  }

  const handleSubmit = async () => {
    formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const submitData = {
            ...form,
            anonymousCode: form.isAnonymous ? form.anonymousCode : null
          }
          await pollStore.createPoll(submitData)
          await router.push('/home')
        } catch {
          ElMessage.error('提交失败')
        }
      } else {
        ElMessage.warning('请完善表单信息')
      }
    })
  }

  const handleReset = () => {
    formRef.value.resetFields()
  }

  onMounted(() => {
    fetchCategories()
    const userData = localStorage.getItem('user')
    if (userData) {
      form.creator_id = JSON.parse(userData).userId
    } else {
      router.push('/login')
    }
    const pollId = route.params.id
    if (pollId) {
      fetchPollData(pollId)
    }
  })
  </script>
