<template>
  <Header></Header>
  <router-view class="router-view"></router-view>
</template>

<script setup>
import Header from "@/components/Header.vue";
</script>

<style lang="scss" scoped>
.router-view {
  padding-top: 48px;
  min-height: 100vh;
<<<<<<< HEAD
  background-color: #F9FAFB;;
=======
  background: #F9FAFB;
>>>>>>> 524f2b9b6e81e21c98b6acf6a02466874a35160f
  overflow-y: auto;
}
</style>
