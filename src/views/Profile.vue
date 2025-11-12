<template>
  <div class="user-profile">
    <!-- 头部信息 -->
    <el-header class="header">
      <el-menu mode="horizontal">
        <el-menu-item index="1">云章论坛</el-menu-item>
        <el-menu-item index="2">主页</el-menu-item>
        <el-menu-item index="3">发现</el-menu-item>
        <el-menu-item index="4">社区</el-menu-item>
        <el-menu-item index="5">帮助</el-menu-item>
      </el-menu>
      <el-input placeholder="搜索..." class="search-input"></el-input>
      <el-button type="text" class="profile-button">我的</el-button>
    </el-header>

    <!-- 用户信息区域 -->
    <div class="user-info">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-avatar :src="userAvatar" class="user-avatar"></el-avatar>
        </el-col>
        <el-col :span="18">
          <div class="user-details">
            <h2>{{ userName }}</h2>
            <p>{{ userTitle }}</p>
            <p>{{ userBio }}</p>
            <el-button type="primary" plain>编辑资料</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据统计区域 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon><Folder /></el-icon>
            <div>
              <p>总发文数</p>
              <h3>86</h3>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <div>
              <p>关注</p>
              <h3>86</h3>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon><Collection /></el-icon>
            <div>
              <p>文章收藏数</p>
              <h3>3.8K</h3>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 更多数据统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon><Thumb /></el-icon>
            <div>
              <p>获赞</p>
              <h3>486</h3>
              <p><el-icon><ArrowUp /></el-icon>5% 较昨日</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <div>
              <p>粉丝数</p>
              <h3>486</h3>
              <p><el-icon><ArrowDown /></el-icon>3% 较昨日</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon><View /></el-icon>
            <div>
              <p>被浏览次数</p>
              <h3>486</h3>
              <p><el-icon><ArrowUp /></el-icon>5% 较昨日</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 文章列表 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="我的文章" name="articles">
        <el-card v-for="article in articles" :key="article.id" class="article-card">
          <div class="article-item">
            <img :src="article.image" alt="Article Image" class="article-image">
            <div class="article-content">
              <h3>{{ article.title }}</h3>
              <p>{{ article.description }}</p>
              <div class="article-meta">
                <span>{{ article.date }}</span>
                <span>{{ article.reads }} 阅读</span>
                <span>{{ article.comments }} 评论</span>
              </div>
            </div>
          </div>
        </el-card>
        <el-button type="text" @click="loadMore">加载更多</el-button>
      </el-tab-pane>
      <el-tab-pane label="收到的评论" name="comments">
        <!-- 评论内容 -->
      </el-tab-pane>
    </el-tabs>

    <!-- 我的收藏 -->
    <el-card class="collections">
      <template #header>
        <div class="collections-header">
          <h3>我的收藏</h3>
          <el-button type="text" @click="viewAllCollections">查看全部收藏</el-button>
        </div>
      </template>
      <div v-for="collection in collections" :key="collection.id" class="collection-item">
        <h4>{{ collection.title }}</h4>
        <p>by {{ collection.author }}</p>
      </div>
    </el-card>

    <!-- 近期互动 -->
    <el-card class="recent-interactions">
      <template #header>
        <div class="interactions-header">
          <h3>近期互动</h3>
        </div>
      </template>
      <div v-for="interaction in interactions" :key="interaction.id" class="interaction-item">
        <el-avatar :src="interaction.avatar" class="interaction-avatar"></el-avatar>
        <div class="interaction-content">
          <p>{{ interaction.text }}</p>
          <span>{{ interaction.time }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Folder, User, Collection, Thumb, ArrowUp, ArrowDown, View } from '@element-plus/icons-vue';

export default {
  components: {
    Folder,
    User,
    Collection,
    Thumb,
    ArrowUp,
    ArrowDown,
    View,
  },
  data() {
    return {
      userAvatar: 'https://via.placeholder.com/150',
      userName: '林晓雨',
      userTitle: 'UI/UX 设计师 · 北京',
      userBio: '专注于用户体验设计，热衷于创造简洁而富有情感的产品界面。相信设计的力量可以改变世界。',
      activeTab: 'articles',
      articles: [
        {
          id: 1,
          image: 'https://via.placeholder.com/150',
          title: '如何设计一个优秀的用户引导流程',
          description: '在产品设计中，良好的用户引导能够显著提升新用户的留存率。本文将分享几种有效的用户引导设计策略...',
          date: '2023-10-15',
          reads: '1.2K',
          comments: '24',
        },
        // 更多文章...
      ],
      collections: [
        {
          id: 1,
          title: '2023年设计趋势报告',
          author: '王设计师',
        },
        // 更多收藏...
      ],
      interactions: [
        {
          id: 1,
          avatar: 'https://via.placeholder.com/50',
          text: '陈小明 点赞了你的文章',
          time: '10分钟前',
        },
        // 更多互动...
      ],
    };
  },
  methods: {
    loadMore() {
      // 加载更多文章的逻辑
    },
    viewAllCollections() {
      // 查看全部收藏的逻辑
    },
  },
};
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 200px;
}

.profile-button {
  margin-left: 10px;
}

.user-info {
  margin-top: 20px;
  background: linear-gradient(to right, #ff9900, #9966cc);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
}

.user-details {
  margin-left: 20px;
}

.stats-row {
  margin-top: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-item .el-icon {
  font-size: 30px;
  margin-right: 10px;
}

.article-card {
  margin-top: 20px;
}

.article-item {
  display: flex;
}

.article-image {
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.article-content {
  flex: 1;
}

.article-meta {
  display: flex;
  gap: 10px;
}

.collections-header,
.interactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collection-item,
.interaction-item {
  margin-top: 10px;
}

.interaction-avatar {
  margin-right: 10px;
}
</style>