<template>
  <el-menu :default-active="activeIndex" router class="pc-menu" mode="horizontal" @select="handleSelect"
    :ellipsis="false" :class="{ hidden: !isVisible }" text-color="#000" active-text-color="#f59e0b">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-button" @click="toggleMobileMenu">
      <svg-icon name="menu" width="50px" height="50px" cursor="pointer" />
    </div>
    <router-link class="logo" to="/"><el-text size="large" class="logo-text">CloudScript</el-text></router-link>
    <el-menu-item index="/" class="menu-item" >
      <span class="menu-text">主页</span>
    </el-menu-item>
    <el-menu-item index="/article" class="menu-item">
      <span class="menu-text">热门</span>
    </el-menu-item>
    <el-menu-item index="/link" class="menu-item">
      <span class="menu-text">友链</span>
    </el-menu-item>
    <el-menu-item index="/about" class="menu-item">
      <span class="menu-text">关于</span>
    </el-menu-item>
    <el-menu-item index="/creation" class="menu-item">
      <span class="menu-text">创作中心</span>
    </el-menu-item>
    <div class="right">


      <div class="search" @click="handleSearch">
        <el-input v-model="searchQuery" placeholder="搜索..." prefix-icon="Search" clearable @keyup.enter="handleSearch"
          @focus="onFocus" @blur="onBlur" class="search-input" />
      </div>


      <div class="message-icon" @click="goToMessage" v-if="user">
        <el-badge :value="messageStore.totalUnreadCount" :max="99" :hidden="messageStore.totalUnreadCount === 0">
          <el-icon size="25px" color="var(--el-text-color-primary)">
            <ChatDotRound />
          </el-icon>
        </el-badge>
      </div>

      <div class="notification-icon" @click="goToNotification" v-if="user">
        <el-badge :value="notificationUnreadCount" :max="99" :hidden="notificationUnreadCount === 0">
          <el-icon size="25px" color="var(--el-text-color-primary)">
            <Bell />
          </el-icon>
        </el-badge>
      </div>

      <!-- <Dark /> -->

      <div v-if="user" class="user-info">
        <el-text size="large" class="nickname" @click="goToUserHomepage">{{ user.nickname }}</el-text>
        <el-dropdown placement="bottom-end">
          <el-avatar v-if="user.avatar" style="cursor: pointer" :size="31" :src="user.avatar" />
          <el-avatar v-else style="cursor: pointer" :size="31" :icon="UserFilled" />
          <template #dropdown>
            <el-dropdown-menu class="user-dropdown-menu">
              <!-- 用户信息卡片 -->
              <div class="user-info-section">
                <!-- 用户名 -->
                <div class="user-name">
                  <span class="nickname">{{ user.nickname }}</span>
                </div>

                <!-- 统计数据 -->
                <div class="user-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ user.fansCount || 0 }}</span>
                    <span class="stat-label">粉丝</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ user.followCount || 0 }}</span>
                    <span class="stat-label">关注</span>
                  </div>
                </div>
              </div>

              <!-- 分割线 -->
              <el-divider style="margin: 12px 0" />

              <!-- 操作按钮 -->
              <el-dropdown-item @click="goToUserHomepage" class="action-item">
                <el-icon>
                  <User />
                </el-icon>
                <span>个人主页</span>
              </el-dropdown-item>
              <el-dropdown-item @click="goToSetting" class="action-item">
                <el-icon>
                  <Setting />
                </el-icon>
                <span>个人设置</span>
              </el-dropdown-item>
              <el-dropdown-item @click="logout" class="action-item">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="login" v-else @click="handleLoginClick">登录</div>
    </div>
  </el-menu>

  <!-- 移动端菜单 -->
  <teleport to="body">
    <transition name="slide-fade">
      <div v-show="isMobileMenuVisible" class="mobile-menu-overlay" @click="closeMobileMenu">
        <el-menu class="mobile-menu" router @click.stop @select="closeMobileMenu">
          <el-menu-item index="/" class="menu-item">
            <span class="menu-text">主页</span>
          </el-menu-item>
          <el-menu-item index="/article" class="menu-item">
            <span class="menu-text">发现</span>
          </el-menu-item>
          <el-menu-item index="/album" class="menu-item">
            <span class="menu-text">社区</span>
          </el-menu-item>
          <el-menu-item index="/link" class="menu-item">
            <span class="menu-text">帮助</span>
          </el-menu-item>
          <el-menu-item index="/creation" class="menu-item">
            <span class="menu-text">创作中心</span>
          </el-menu-item>
        </el-menu>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import Dark from "./Dark.vue";
import { useUserStore } from "@/stores/userStore.js";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { info, oauthLogin } from "@/api/user";
import { SetJwt } from "@/utils/Auth";
import { UserFilled, User, Setting, SwitchButton, ChatDotRound, Bell } from "@element-plus/icons-vue";
import { useMessageStore } from "@/stores/messageStore";
import { getUnreadCount } from "@/api/privateMessage";
import { getUnreadNotificationCount } from "@/api/notification";
import WebSocketClient from "@/utils/WebSocketClient";

const userStore = useUserStore();
const messageStore = useMessageStore();
const { user } = storeToRefs(userStore);
const router = useRouter();
const route = useRoute();

// 当前激活的菜单索引
const activeIndex = ref("/");

// 通知未读数量
const notificationUnreadCount = ref(0);

// 监听路由变化，更新激活的菜单
router.afterEach((to) => {
  // 如果路由路径以 "/album" 开头，则激活相册菜单
  if (to.path.startsWith("/album")) {
    activeIndex.value = "/album";
  } else {
    activeIndex.value = to.path;
  }
});

// 处理菜单选择事件
const handleSelect = (index) => {
  // 对于创作中心路由，使用原生页面跳转以避免白屏问题
  if (index === "/creation") {
    window.location.href = "/creation";
  } else {
    // 对于其他路由，使用普通的push方法
    router.push(index);
  }
};

const handleSearch = () => {
  router.push("/search");
};

const goToMessage = () => {
  router.push("/message");
};

const goToNotification = () => {
  const isCurrentlyOnNotificationPage = router.currentRoute.value.path === "/notification";

  // 跳转到消息中心
  router.push("/notification");

  // 触发消息中心的刷新事件（如果当前在消息中心页面，则不延迟执行，如果不在消息中心页面，则延迟100ms确保路由跳转完成）
  setTimeout(
    () => {
      window.dispatchEvent(new CustomEvent("refresh-notifications"));
    },
    isCurrentlyOnNotificationPage ? 0 : 100
  );
};

const handleLoginClick = () => {
  // 直接使用路径跳转，更可靠
  // router.push("login");
  router.push("/login");
};

// 获取未读消息数
const fetchUnreadCount = async () => {
  if (user.value) {
    try {
      const res = await getUnreadCount();
      messageStore.totalUnreadCount = res.data.data || 0;
    } catch (error) {
      console.error("获取未读消息数失败:", error);
    }
  }
};

// 获取未读通知数量
const fetchNotificationUnreadCount = async () => {
  if (user.value) {
    try {
      const res = await getUnreadNotificationCount();
      const data = res.data.data;
      // 计算总未读数量
      notificationUnreadCount.value = data.total || 0;
    } catch (error) {
      console.error("获取未读通知数失败:", error);
    }
  }
};

// 新消息处理器（定义在组件级别，便于移除）
const handleNewMessage = (data) => {
  messageStore.updateConversation(
    data.fromUserId,
    {
      content: data.content,
      createTime: data.createTime,
    },
    data.unreadCount, // 使用后端返回的最新未读数
    {
      nickname: data.fromUserNickname,
      avatar: data.fromUserAvatar,
    }
  );
};

// 消息撤回处理器
const handleMessageRevoked = (data) => {
  // 更新会话列表中的最后一条消息
  messageStore.updateConversationLastMessage(data.fromUserId, data.content || "撤回了一条消息");
};

// 新通知处理器
const handleNewNotification = (data) => {
  // 收到新通知时，重新获取准确的未读数量
  fetchNotificationUnreadCount();
};

// 初始化 WebSocket 连接
const initWebSocket = () => {
  if (!user.value) {
    return;
  }

  // 如果 WebSocket 未连接，则建立连接
  if (!WebSocketClient.isConnected()) {
    WebSocketClient.connect();
  }

  // 移除旧的监听器(避免重复注册)
  WebSocketClient.off("NEW_MESSAGE", handleNewMessage);
  WebSocketClient.off("MESSAGE_REVOKED", handleMessageRevoked);
  WebSocketClient.off("NEW_NOTIFICATION", handleNewNotification);
  // 注册新消息监听器
  WebSocketClient.on("NEW_MESSAGE", handleNewMessage);
  WebSocketClient.on("MESSAGE_REVOKED", handleMessageRevoked);
  WebSocketClient.on("NEW_NOTIFICATION", handleNewNotification);

  // 监听 WebSocket 重连,重新注册监听器
  WebSocketClient.off("open", handleWebSocketOpen);
  WebSocketClient.on("open", handleWebSocketOpen);
};

// WebSocket 连接成功处理器
const handleWebSocketOpen = () => {
  // 重连后重新注册监听器
  WebSocketClient.off("NEW_MESSAGE", handleNewMessage);
  WebSocketClient.off("MESSAGE_REVOKED", handleMessageRevoked);
  WebSocketClient.off("NEW_NOTIFICATION", handleNewNotification);
  WebSocketClient.on("NEW_MESSAGE", handleNewMessage);
  WebSocketClient.on("MESSAGE_REVOKED", handleMessageRevoked);
  WebSocketClient.on("NEW_NOTIFICATION", handleNewNotification);
};

const oauth = () => {
  const user_name = route.query.user_name;
  const access_token = route.query.access_token;
  const login_type = route.query.login_type;
  // 如果地址中有参数，则进行登录
  if (user_name && access_token) {
    oauthLogin({ type: login_type, username: user_name, password: access_token }).then(async (res) => {
      // 去除url上面的参数
      await router.replace({ query: {} });
      ElMessage.success("登录成功");
      // 将jwt存储到localStorage
      SetJwt(res.data.data);
      info().then((res) => {
        userStore.user = res.data.data;
      });
    });
  }
};

oauth();

const getUserInfo = async () => {
  const res = await info();
  user.value = res.data.data;
};

const logout = () => {
  userStore.clearUser();
};

// 跳转到用户主页
const goToUserHomepage = () => {
  if (user.value?.id) {
    router.push(`/user/${user.value.id}`);
  }
};

// 跳转到个人设置
const goToSetting = () => {
  router.push("/setting");
};

// 头部是否可见
const isVisible = ref(true);
// 上次滚动位置
const lastScrollY = ref(0);

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  // 向下滚动隐藏头部，向上滚动显示头部
  // 如果当前滚动位置大于上次记录的位置，并且当前滚动位置超过100px，则隐藏
  if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    isVisible.value = false;
    // 如果当前滚动位置小于上次记录的位置（即向上滚动），则显示
  } else if (currentScrollY < lastScrollY.value) {
    isVisible.value = true;
  }
  // 更新上次记录的位置
  lastScrollY.value = currentScrollY;
};

// 移动端菜单是否可见
const isMobileMenuVisible = ref(false);
// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuVisible.value = !isMobileMenuVisible.value;
};

// 关闭移动端菜单
const closeMobileMenu = (index) => {
  isMobileMenuVisible.value = false;
  handleSelect(index);
};

// 监听用户登录状态变化，自动初始化 WebSocket
watch(
  () => user.value,
  (newUser) => {
    if (newUser) {
      // 用户已登录，立即初始化 WebSocket
      fetchUnreadCount();
      fetchNotificationUnreadCount();
      initWebSocket();
    } else {
      // 用户已登出，关闭 WebSocket
      WebSocketClient.close();
      // 移除监听器
      WebSocketClient.off("NEW_MESSAGE", handleNewMessage);
      WebSocketClient.off("MESSAGE_REVOKED", handleMessageRevoked);
      WebSocketClient.off("NEW_NOTIFICATION", handleNewNotification);
      WebSocketClient.off("open", handleWebSocketOpen);
      // 重置未读数量
      notificationUnreadCount.value = 0;
    }
  },
  { immediate: true } // 立即执行一次，检查当前用户状态
);

// 监听通知已读事件
const handleNotificationRead = () => {
  // 当用户查看通知页面并标记已读后，刷新未读数量
  fetchNotificationUnreadCount();
};

// 组件挂载时添加监听滚动事件
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("notification-read", handleNotificationRead);
  // 如果 pinia 有 userid 再获取用户信息
  if (user.value) {
    getUserInfo();
  }
});

// 组件销毁时移除监听事件
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("notification-read", handleNotificationRead);
  // 移除 WebSocket 监听器
  WebSocketClient.off("NEW_MESSAGE", handleNewMessage);
  WebSocketClient.off("MESSAGE_REVOKED", handleMessageRevoked);
  WebSocketClient.off("NEW_NOTIFICATION", handleNewNotification);
  WebSocketClient.off("open", handleWebSocketOpen);
});


// 搜索框
const searchQuery = ref('');
const onFocus = () => {
  // 可选：聚焦时触发行为
};
const onBlur = () => {
  // 可选：失焦时触发行为
};


</script>

<style lang="scss" scoped>
// .el-menu-item .is-active .menu-item {
//   color: red;
// }

.pc-menu {
  height: 67px;
  width: 100%;
  padding: 0 10px 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: transform 0.5s ease;
  border: none;



  /* 90% 透明背景 + 毛玻璃效果 */
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.001), rgba(0, 0, 0, 0.001)), #FFFFFF;
  backdrop-filter: blur(10px);

  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: rgba(0, 0, 0, 0.05);

  &.hidden {
    transform: translateY(-100%);
  }

  .logo {
    margin-right: 10px;
    font-weight: bold;
    white-space: nowrap;

    /* Logo文字 */
    .logo-text {
      font-family: Pacifico;
      font-size: 24px;
      font-weight: normal;
      line-height: 32px;
      letter-spacing: normal;
      color: #F97316;
      letter-spacing: 1px;
      position: relative;
      transition: all 0.3s ease;
      font-weight: 600;

      &::after {
        content: "";
        position: absolute;
        bottom: -16px;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, #fbbf24, #f59e0b);
        border-radius: 3px;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
      }

      &:hover {
        color: #f59e0b;
        text-shadow: 2px 2px 8px rgba(181, 178, 178, 0.2);

        &::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      }
    }
  }

  .menu-item {
    .menu-text {
      font-size: 18px;
    }
  }

  /* 头部右侧内容 */
  .right {
    display: flex;
    margin-left: auto;
    justify-content: center;
    align-items: center;

    .search {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      cursor: pointer;
      border-radius: 50px;
    }

    .message-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      cursor: pointer;


      // 调整徽章大小和位置
      :deep(.el-badge__content) {
        font-size: 11px;
        top: 5px;
        right: 10px;
        border: none;
      }
    }

    .notification-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      cursor: pointer;

      // 调整徽章大小和位置
      :deep(.el-badge__content) {
        font-size: 11px;
        top: 5px;
        right: 10px;
        border: none;
      }
    }

    .user-info {
      display: flex;
      align-items: center;

      .nickname {
        font-size: 18px !important;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-left: 10px;
        margin-right: 10px;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          color: var(--el-text-color-regular);
          transform: translateY(-2px);
        }

        @media (max-width: 1314px) {
          margin-left: 0;
          display: none;
        }
      }
    }

    .login {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      margin-left: 5px;
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      font-size: 15px;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  .el-menu--horizontal>.el-menu-item>.menu-item.is-active:active {
    color: #F97316 !important;
  }

  // 移动端菜单按钮
  .mobile-menu-button {
    // margin-right: 10px;
    display: none;
    cursor: pointer;
  }
}

.user-dropdown-menu {
  min-width: 220px !important;
  max-width: 280px !important;
  padding: 15px !important;

  // 用户信息区域
  .user-info-section {

    // 用户名区域
    .user-name {
      text-align: center;
      max-width: 250px;

      .nickname {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        word-wrap: break-word;
        word-break: break-all;
      }
    }

    // 统计数据区域
    .user-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 60px;
      padding: 16px 0;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  // 分割线样式调整
  .el-divider {
    border-color: var(--el-border-color-lighter);
  }

  // 操作按钮样式
  .action-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      background-color: var(--el-bg-color-page);
      color: var(--el-color-primary);
    }

    .el-icon {
      font-size: 16px;
    }

    span {
      font-size: 14px;
    }
  }
}

// 移动端菜单覆盖层
.mobile-menu-overlay {
  position: fixed; // 将遮罩层固定在视窗中，不随页面滚动
  top: 0; // 使遮盖层覆盖整个视窗
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
  display: flex;

  .mobile-menu {
    width: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start; // 菜单项水平左对齐
    background-color: var(--el-bg-color);

    .el-menu-item {
      width: 100%;
    }
  }
}

// 响应式设计 - 平板及以下尺寸
@media (max-width: 1270px) {
  .pc-menu {
    .menu-item {
      .menu-text {
        display: none; // 隐藏菜单文字
      }
    }
  }
}

// 响应式设计 - 移动端
@media (max-width: 870px) {
  .pc-menu {
    padding: 0 5px 0 0;

    .menu-item {
      display: none; // 隐藏PC端菜单
    }

    .mobile-menu-button {
      display: block; // 显示移动端菜单按钮
    }

    .logo {
      margin-right: 0;

      .logo-text {
        font-size: 20px !important;
      }
    }
  }
}


// 搜索框
.search {
  border-radius: 50px;
}

.search-input {
  width: 420px;
  height: 42px;
  // 删除 margin-right
  border-radius: 50px;


  :deep(.el-input__inner) {
    height: 100%;
    border-radius: 50px !important;
    border: none;
    background-color: var(--el-bg-color);
    padding-right: 12px;
    font-size: 14px;
    color: var(--el-text-color-primary);
    box-shadow: none;
    transition: all 0.2s ease;


    &::placeholder {
      color: var(--el-text-color-secondary);
    }

    &:focus,
    &:hover {
      box-shadow: none;
    }
  }

  :deep(.el-input__prefix) {
    left: 12px;
    right: auto;
  }

  :deep(.el-input__clear) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-right: 8px;
    opacity: 1;
    transition: opacity 0.2s;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
