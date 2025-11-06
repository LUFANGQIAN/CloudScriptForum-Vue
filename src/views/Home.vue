<template>
  <div class="home p-4">
    <h1 class="text-2xl font-bold mb-4">论坛主页</h1>
    <div class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-item border-b py-2">
        <router-link :to="{ name: 'Post', params: { id: post.id } }" class="text-lg font-semibold text-blue-600 hover:underline">{{ post.title }}</router-link>
        <p class="text-gray-600">作者: {{ post.author }}</p>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref } from 'vue';

const posts = ref([
  { id: 1, title: 'Vue 3 学习指南', author: 'User1' },
  { id: 2, title: 'Element Plus 使用技巧', author: 'User2' },
  { id: 3, title: 'Tailwind CSS 快速入门', author: 'User3' },
]);

</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}
</style>