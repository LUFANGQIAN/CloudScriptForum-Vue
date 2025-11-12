<template>
  <div id="app">
    <nav class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex justify-between">
        <router-link to="/" class="font-bold">论坛</router-link>
        <div>
          <router-link to="/" class="mr-4">主页</router-link>
          <router-link to="/login" class="mr-4">登录</router-link>
          <router-link to="/register" class="mr-4">注册</router-link>
          <router-link to="/personal-homepage">个人主页</router-link>
        </div>
      </div>
    </nav>
    <main class="container mx-auto p-4">
      <router-view/>
    </main>
  </div>
</template>

<script setup>

</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}
</style>