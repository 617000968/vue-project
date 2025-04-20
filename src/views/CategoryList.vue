<template>
  <div class="category-container">
    <h2 class="list-title">分类管理</h2>
    <div class="category-list">
      <div
        v-for="(category, index) in categories"
        :key="index"
        class="category-card"
        :class="{ disabled: !category.active }"
        @click="selectCategory(category.categoryId)"
      >
        <div class="category-header">
          <span class="category-name">{{ category.name }}</span>
          <span class="status-badge" :class="category.active ? 'active' : 'inactive'">
            {{ category.active ? '启用' : '禁用' }}
          </span>
        </div>
        <div class="category-meta">
          <span class="item-count">
            <i class="fas fa-box-open"></i>
            包含项目：{{ category.count }}
          </span>
        </div>
      </div>
    </div>
    <PollList
      v-if="selectedCategoryId !== null"
      :category-id="selectedCategoryId"
      @close="selectedCategoryId = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import PollList from './PollCategory.vue';
import resetMessage from '@/utils/resetMessage';
import { usePollStore } from '@/stores/pollStore';

const categories = ref([]);
const selectedCategoryId = ref(null);
const router = useRouter();
const pollStore = usePollStore();

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/admin/category/all/detailed');
    if (response.data.code === 200) {
      categories.value = response.data.data;
    } else {
      console.error('获取分类失败：', response.data.msg);
    }
  } catch (error) {
    console.error('请求错误：', error);
  }
};

const selectCategory = async (categoryId) => {
  const cat = categories.value.find(cat => cat.categoryId === categoryId);
  if (cat && cat.count > 0) {
    try {
      await pollStore.getPollsByCategoryId(categoryId);
      router.push({
        name: 'CategoryPolls',
        params: { categoryId }
      });
    } catch (error) {
      resetMessage.error(`加载失败: ${error.message}`);
    }
  } else {
    resetMessage.error('该分类下暂无投票');
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.list-title {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.category-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.category-card {
  background: white;
  border-radius: 8px;
  padding: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
}

.category-card.disabled {
  background: #f8f9fa;
  opacity: 0.8;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #34495e;
}

.status-badge {
  font-size: 0.85rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.category-meta {
  display: flex;
  align-items: center;
  color: #7f8c8d;
}

.item-count {
  font-size: 0.95rem;
}

.fa-box-open {
  margin-right: 0.5rem;
  color: #3498db;
}

@media (max-width: 768px) {
  .category-list {
    grid-template-columns: 1fr;
  }

  .category-card {
    padding: 1rem;
  }
}
</style>
