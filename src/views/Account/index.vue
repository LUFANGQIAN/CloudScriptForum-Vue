<template>


      <router-view v-slot="{ Component }">
        <transition name="scale" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

</template>

<script></script>

<style lang="scss" scoped>
:deep(.el-form) {
  //将样式穿透到子组件
  width: 420px;
}
:deep(.is-plain) {
  width: 70%;
}
.login_container {
  display: flex;
  height: 100vh;

  .left_panel {
    flex: 1;
    background: url("@/assets/img/bg.jpg") no-repeat center center / cover;
  }
  .welcome_title {
    position: absolute;
    left: 20px;
    bottom: 20px;
    color: white;
    text-shadow: 0 0 10px white;
    div:first-child {
      font-size: 20px;
      font-weight: bold;
      margin-top: 10px;
    }
  }
  .right_panel {
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    width: 500px;
    background-color: var(--el-bg-color);
  }
  // 手机端样式
  @media screen and (max-width: 600px) {
    :deep(.el-form) {
      //将样式穿透到子组件
      width: 360px;
    }
    .left_panel {
      display: none;
    }
    .right_panel {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
