<template>
  <div class="profile p-4">
    <h1 class="text-2xl font-bold mb-4">个人主页</h1>
    <div class="user-info">
      <p><strong>用户名:</strong> {{ user.username }}</p>
      <p><strong>邮箱:</strong> {{ user.email }}</p>
    </div>
    <h2 class="text-xl font-bold mt-6 mb-4">我的帖子</h2>
    <div class="post-list">
      <div v-for="post in user.posts" :key="post.id" class="post-item border-b py-2">
        <router-link :to="{ name: 'Post', params: { id: post.id } }" class="text-lg font-semibold text-blue-600 hover:underline">{{ post.title }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const user = ref({
  username: 'TestUser',
  email: 'testuser@example.com',
  posts: [
    { id: 1, title: '我的第一篇帖子' },
    { id: 2, title: '我的第二篇帖子' },
  ],
});
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
}
</style>