<template>
  <div class="post-detail p-4">
    <h1 class="text-3xl font-bold mb-2">{{ post.title }}</h1>
    <p class="text-gray-600 mb-4">作者: {{ post.author }}</p>
    <div class="post-content" v-html="post.content"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const post = ref({});

const posts = {
  1: { id: 1, title: 'Vue 3 学习指南', author: 'User1', content: '<p>这是 <strong>Vue 3</strong> 的学习指南内容。</p>' },
  2: { id: 2, title: 'Element Plus 使用技巧', author: 'User2', content: '<p>这是 <strong>Element Plus</strong> 的使用技巧内容。</p>' },
  3: { id: 3, title: 'Tailwind CSS 快速入门', author: 'User3', content: '<p>这是 <strong>Tailwind CSS</strong> 的快速入门内容。</p>' },
};

onMounted(() => {
  const postId = route.params.id;
  post.value = posts[postId];
});
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
}
</style>