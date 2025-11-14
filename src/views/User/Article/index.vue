<template>
  <div class="article-detail">
    <!-- 浮动操作栏（左侧竖向） -->
    <div class="left-floating-actions" v-if="articleInfo">
      <el-button style="margin-left: 12px;" :type="articleInfo.isLiked ? 'primary' : 'default'" :loading="likeLoading" @click="handleLikeFloating">
        <svg-icon name="like" width="18px" height="18px" :color="articleInfo.isLiked ? '#ffffff' : '#909399'" />
      </el-button>
      <el-button :type="articleInfo.isCollected ? 'primary' : 'default'" @click="openFavoriteDialog">
        <el-icon>
          <component :is="articleInfo.isCollected ? StarFilled : Star" />
        </el-icon>
      </el-button>
      <el-button @click="openCommentDrawer">
        <el-icon>
          <ChatLineRound />
        </el-icon>
      </el-button>
      <el-button @click="copyArticleLink">
        <el-icon>
          <DocumentCopy />
        </el-icon>
      </el-button>
    </div>

    <!-- 两栏布局容器：中间内容 + 右侧信息/目录 -->
    <div class="article-container">
      <!-- 中间文章内容 -->
      <div class="main-content">
        <ArticleContent :article="articleInfo" :loading="articleLoading" :user-info="userInfo" :user-loading="userLoading" @updateArticle="handleUpdateArticle" />

        <!-- 内嵌评论模块（复制评论抽屉逻辑，置于内容下方） -->
        <div class="inline-comments" id="comments-section" v-if="articleInfo?.id">
          <div class="inline-comments-header">
            <el-icon><ChatLineRound /></el-icon>
            <span>评论 {{ inlineCommentTotal }}</span>
          </div>
          <div class="inline-comment-form">
            <CommentForm v-if="userStore.user" :article-id="articleInfo.id" :parent-id="0" placeholder="写下你的评论..." @comment-added="handleInlineCommentAdded" />
            <div v-else class="login-prompt">
              <p>请先登录后再发表评论</p>
              <el-button type="primary" size="small" @click="goToLogin">登录</el-button>
            </div>
          </div>
          <div class="inline-comment-list">
            <div v-if="inlineLoading" class="loading-container">
              <el-skeleton animated :count="3">
                <template #template>
                  <div class="comment-skeleton">
                    <el-skeleton-item variant="circle" style="width: 36px; height: 36px" />
                    <div class="skeleton-content">
                      <el-skeleton-item variant="text" style="width: 80px; margin-bottom: 6px" />
                      <el-skeleton-item variant="text" style="width: 100%" />
                      <el-skeleton-item variant="text" style="width: 70%" />
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
            <div v-else-if="inlineComments.length === 0" class="empty-state">
              <el-empty description="暂无评论" :image-size="120" />
            </div>
            <div v-else class="comment-items">
              <CommentItem v-for="comment in inlineComments" :key="comment.id" :comment="comment" :article-id="articleInfo.id" @reply-added="handleInlineReplyAdded" @comment-deleted="handleInlineCommentDeleted" />
            </div>
            <div v-if="inlineHasMore && !inlineLoading && inlineComments.length > 0" class="load-more">
              <el-button :loading="inlineLoadingMore" @click="loadMoreInlineComments" text type="primary" size="small">
                {{ inlineLoadingMore ? "加载中..." : "加载更多" }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息：用户卡片粘性固定，目录随页面滚动 -->
      <div class="right-column">
        <div class="right-sidebar">
          <div class="sticky-user-card">
            <UserInfoCard v-if="userInfo" :user-info="userInfo" :loading="userLoading" />
          </div>
        </div>
        <div class="catalog-static">
          <div class="catalog-card">
            <ArticleCatalog v-if="articleInfo && articleInfo.content" :content="articleInfo.content" />
          </div>
        </div>
      </div>
    </div>

    <FavoriteDialog v-if="articleInfo?.id" v-model="favoriteDialogVisible" :article-id="articleInfo.id" @success="handleFavoriteSuccess" />
    <CommentDrawer v-if="articleInfo?.id" v-model:visible="commentDrawerVisible" :article-id="articleInfo.id" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { getArticleDetail } from "@/api/article";
import { getUserInfoById } from "@/api/user";
import UserInfoCard from "./components/UserInfoCard.vue";
import ArticleContent from "./components/ArticleContent.vue";
import ArticleCatalog from "./components/ArticleCatalog.vue";
import CommentForm from "./components/CommentForm.vue";
import CommentItem from "./components/CommentItem.vue";
import FavoriteDialog from "./components/FavoriteDialog.vue";
import { toggleLike } from "@/api/like";
import { ChatLineRound, Star, StarFilled, DocumentCopy } from "@element-plus/icons-vue";
import { getCommentList } from "@/api/comment";
import { useUserStore } from "@/stores/userStore";
import CommentDrawer from "./components/CommentDrawer.vue";

// 路由参数
const route = useRoute();
const { userId, articleId } = route.params;

// 响应式数据
const userInfo = ref(null);
const articleInfo = ref(null);
const userLoading = ref(false);
const articleLoading = ref(false);
const likeLoading = ref(false);
const favoriteDialogVisible = ref(false);
const commentDrawerVisible = ref(false);

// 用户状态
const userStore = useUserStore();

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    userLoading.value = true;
    const response = await getUserInfoById(userId);
    userInfo.value = response.data.data;
  } catch (error) {
    ElMessage.error("获取用户信息失败");
  } finally {
    userLoading.value = false;
  }
};

// 获取文章详情
const fetchArticleDetail = async () => {
  try {
    articleLoading.value = true;
    const response = await getArticleDetail(articleId);
    articleInfo.value = response.data.data;

    // 注意：阅读量统计已集成到后端获取文章详情接口中，会自动异步统计，无需前端单独调用
  } catch (error) {
    ElMessage.error("获取文章详情失败");
  } finally {
    articleLoading.value = false;
  }
};

// 处理文章信息更新
const handleUpdateArticle = (updatedArticle) => {
  articleInfo.value = updatedArticle;
};

// 页面初始化
onMounted(async () => {
  // 并行获取用户信息和文章详情
  await Promise.all([fetchUserInfo(), fetchArticleDetail()]);
  // 初始化内嵌评论
  await fetchInlineComments(true);
});

// ====== 内嵌评论逻辑 ======
const inlineComments = ref([]);
const inlineLoading = ref(false);
const inlineLoadingMore = ref(false);
const inlineCurrentPage = ref(1);
const inlinePageSize = ref(10);
const inlineCommentTotal = ref(0);
const inlineHasMore = ref(true);

const fetchInlineComments = async (reset = false) => {
  if (!articleId) return;
  try {
    if (reset) {
      inlineLoading.value = true;
      inlineCurrentPage.value = 1;
      inlineComments.value = [];
      inlineHasMore.value = true;
    } else {
      inlineLoadingMore.value = true;
    }

    const res = await getCommentList(Number(articleId), inlineCurrentPage.value, inlinePageSize.value);
    const newComments = res.data.data.data || [];
    inlineCommentTotal.value = res.data.data.total || 0;

    if (reset) {
      inlineComments.value = newComments;
    } else {
      inlineComments.value = [...inlineComments.value, ...newComments];
    }

    inlineHasMore.value = inlineComments.value.length < inlineCommentTotal.value;
    if (inlineHasMore.value && newComments.length > 0) {
      inlineCurrentPage.value++;
    }
  } catch (error) {
    ElMessage.error("获取评论列表失败");
  } finally {
    inlineLoading.value = false;
    inlineLoadingMore.value = false;
  }
};

const loadMoreInlineComments = () => {
  if (!inlineHasMore.value || inlineLoadingMore.value) return;
  fetchInlineComments(false);
};

const handleInlineCommentAdded = () => {
  fetchInlineComments(true);
  ElMessage.success("评论发表成功");
};

const handleInlineReplyAdded = (commentId, newReply) => {
  const comment = inlineComments.value.find((c) => c.id === commentId);
  if (comment) {
    let replyAdded = false;
    if (comment.children) {
      const existing = comment.children.find((r) => r.id === newReply.id);
      if (!existing) {
        comment.children.push(newReply);
        replyAdded = true;
      }
    } else {
      comment.children = [newReply];
      replyAdded = true;
    }
    if (replyAdded) {
      comment.replyCount = (comment.replyCount || 0) + 1;
      inlineCommentTotal.value++;
    }
  }
};

const handleInlineCommentDeleted = (commentId) => {
  const index = inlineComments.value.findIndex((c) => c.id === commentId);
  if (index !== -1) {
    inlineComments.value.splice(index, 1);
    inlineCommentTotal.value = Math.max(0, inlineCommentTotal.value - 1);
  }
  ElMessage.success("评论删除成功");
};

const goToLogin = () => {
  // 直接跳转登录
  window.location.href = "/login";
};

// ====== 左侧悬浮操作 ======
const handleLikeFloating = async () => {
  if (!articleInfo.value?.id) {
    ElMessage.warning("文章信息异常");
    return;
  }
  if (likeLoading.value) return;
  try {
    likeLoading.value = true;
    await toggleLike(0, articleInfo.value.id);
    const updated = { ...articleInfo.value };
    if (updated.isLiked) {
      updated.isLiked = false;
      updated.likeCount = Math.max(0, (updated.likeCount || 0) - 1);
      ElMessage.success("取消点赞成功");
    } else {
      updated.isLiked = true;
      updated.likeCount = (updated.likeCount || 0) + 1;
      ElMessage.success("点赞成功");
    }
    articleInfo.value = updated;
  } catch (e) {
    ElMessage.error("点赞操作失败，请重试");
  } finally {
    likeLoading.value = false;
  }
};

const openFavoriteDialog = () => {
  if (!articleInfo.value?.id) {
    ElMessage.warning("文章信息异常");
    return;
  }
  favoriteDialogVisible.value = true;
};

const handleFavoriteSuccess = (result) => {
  const updated = { ...articleInfo.value };
  if (result.action === "add") {
    if (!updated.isCollected) {
      updated.isCollected = true;
      updated.collectCount = (updated.collectCount || 0) + 1;
    }
  } else if (result.action === "remove") {
    if (!result.hasOtherCollected) {
      updated.isCollected = false;
      updated.collectCount = Math.max(0, (updated.collectCount || 0) - 1);
    }
  }
  articleInfo.value = updated;
};

const openCommentDrawer = () => {
  commentDrawerVisible.value = true;
};

const copyArticleLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    ElMessage.success("文章链接已复制");
  } catch (e) {
    ElMessage.error("复制失败，请手动复制");
  }
};
</script>

<style lang="scss" scoped>
// 文章详情页面主容器
.article-detail {
  height: 100%;
  background-color: #f9fafb !important;
  background: var(--el-bg-color-page);
  padding: 20px 0;

  // 两栏布局容器
  .article-container {
    padding-top: 70px;
    max-width: 1600px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;

    // 中间文章内容区域
    .main-content {
      width: 100%;
    }

    // 右侧信息栏（用户卡片粘性 + 目录随页面滚动）
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .right-sidebar {
      position: sticky;
      top: 70px;
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .article-detail {
    .article-container {
      grid-template-columns: 1fr;
      max-width: 800px;

      // 移动端隐藏右侧栏与目录
      .right-column {
        display: none;
      }
    }
  }
}

@media (max-width: 768px) {
  .article-detail {
    padding: 0;

    .article-container {
      padding-top: 0px;
      gap: 10px;
      width: 100%;
      .main-content {
        margin-top: 50px;
        border-radius: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .left-floating-actions {
    left: 10px;
    top: 120px;
    .el-button { width: 40px; height: 40px; }
  }
}
  // 左侧竖向悬浮操作栏
  .left-floating-actions {
    position: fixed;
    left: 20px;
    top: 160px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .el-button {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      :deep(.el-icon) { margin: 0; font-size: 18px; }
      :deep(svg) { display: block; }
    }
  }

  // 内嵌评论区域样式
  .inline-comments {
    margin-top: 36px;
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    padding: 16px;

    .inline-comments-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .login-prompt {
      text-align: center;
      padding: 24px;
      background: var(--el-bg-color-page);
      border: 1px dashed var(--el-border-color);
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .comment-items {
      margin-top: 8px;
    }

    .load-more {
      text-align: center;
      padding: 16px 0;
      border-top: 1px solid var(--el-border-color-light);
      margin-top: 12px;
    }
  }

</style>
