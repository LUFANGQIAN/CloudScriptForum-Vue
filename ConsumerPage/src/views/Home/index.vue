<template>
  <div class="home">
    <div class="page-container">
      <aside class="left-nav">
        <nav>
          <router-link to="/" class="nav-item" exact-active-class="active">
            <div class="item-decorate"></div>
            <el-icon>
              <House />
            </el-icon>
            <span>主页</span>
          </router-link>
          <router-link to="/article" class="nav-item">
            <div class="item-decorate"></div>
            <el-icon>
              <TrendCharts />
            </el-icon>
            <span>热门话题</span>
          </router-link>
          <router-link to="/creation" class="nav-item">
            <div class="item-decorate"></div>
            <el-icon>
              <Edit />
            </el-icon>
            <span>创作中心</span>
          </router-link>
          <router-link to="/editor" class="nav-item">
            <div class="item-decorate"></div>
            <el-icon>
              <EditPen />
            </el-icon>
            <span>发布文章</span>
          </router-link>
          <router-link to="/about" class="nav-item">
            <div class="item-decorate"></div>
            <el-icon>
              <InfoFilled />
            </el-icon>
            <span>关于论坛</span>
          </router-link>
        </nav>
      </aside>
      <main class="main">
        <section class="welcome-banner">
          <div class="title">欢迎来到云章论坛</div>
          <div class="desc">这里是技术交流与分享的社区，点击右上角的铃铛查看更多消息。</div>
        </section>
        <section class="stats">
          <div class="stat-card" v-for="s in stats" :key="s.key">
            <div class="card-top">
              <div class="label">{{ s.label }}</div>
              <div class="icon" :class="s.color">
                <el-icon v-if="s.icon === 'View'">
                  <View />
                </el-icon>
                <el-icon v-else-if="s.icon === 'User'">
                  <User />
                </el-icon>
                <el-icon v-else>
                  <Document />
                </el-icon>
              </div>
            </div>
            <div class="value">{{ formatNumber(s.value) }}</div>
          </div>
        </section>
        <section class="hot-topics">
          <div class="section-header">
            <h3>热门话题</h3>
            <router-link to="/article" class="more">全部</router-link>
          </div>
          <div class="hot-grid">
            <div class="hot-card" v-for="item in hotList" :key="item.id" @click="goToArticle(item)">
              <el-image :src="resolveCover(item)" fit="cover" lazy>
                <template #placeholder>
                  <div class="image-placeholder"><el-icon class="is-loading"><Loading /></el-icon></div>
                </template>
                <template #error>
                  <div class="image-error"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div class="hot-info">
                <div class="hot-title">{{ item.title }}</div>
                <div class="hot-meta">
                  <span><el-icon>
                      <View />
                    </el-icon>{{ item.readCount || 0 }}</span>
                  <span><svg-icon name="like" width="13px" height="13px" />{{ item.likeCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="latest">
          <div class="section-header">
            <h3>最新动态</h3>
          </div>
          <div v-if="articleLoading">
            <el-skeleton animated :count="4" />
          </div>
          <div v-else>
            <div class="post-item" v-for="article in articles" :key="article.id">
              <div class="post-main">
                <div class="post-title">
                  <router-link :to="getArticleDetailRoute(article)">{{ article.title }}</router-link>
                </div>
                <div class="post-desc">{{ article.description || '这是一篇没有描述的文章' }}</div>
                <div class="post-meta">
                  <span>{{ formatDate(article.createTime) }}</span>
                  <span><el-icon>
                      <View />
                    </el-icon>{{ article.readCount || 0 }}</span>
                  <span><svg-icon name="like" width="13px" height="13px" />{{ article.likeCount || 0 }}</span>
                  <span><el-icon>
                      <Star />
                    </el-icon>{{ article.collectCount || 0 }}</span>
                </div>
              </div>
              <div class="post-thumb" @click="goToArticle(article)">
                <el-image :src="article.coverUrl" fit="cover">
                  <template #error>
                    <div class="thumb-error"><el-icon>
                        <Picture />
                      </el-icon></div>
                  </template>
                </el-image>
              </div>
            </div>
            <div v-if="articles.length === 0" class="empty"><el-empty description="暂无内容" /></div>
          </div>
        </section>
      </main>
    </div>
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="links"><router-link to="/about">关于我们</router-link><span>·</span><router-link
            to="/link">友情链接</router-link><span>·</span><router-link to="/creation">服务条款</router-link></div>
        <div class="copyright">© {{ currentYear }} 云论坛 CloudScript</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Loading, Picture, View, House, TrendCharts, Edit, EditPen, InfoFilled, User, Document, CaretTop, CaretBottom } from "@element-plus/icons-vue";
import { getAllArticleList, getHotArticleList } from "@/api/article";
import { getTodayVisitorCount } from "@/api/visitor";


const router = useRouter();
const articles = ref([]);
const hotList = ref([]);
const articleLoading = ref(false);
const currentYear = ref(new Date().getFullYear());
const stats = ref([
  { key: 'posts', label: '总帖子数', value: 0, icon: 'Document', color: 'c1', trend: { value: 0, up: true, label: '较上周' } },
  { key: 'registered', label: '注册用户', value: 0, icon: 'User', color: 'c2', trend: { value: 0, up: true, label: '较上周' } },
  { key: 'online', label: '在线用户', value: 0, icon: 'User', color: 'c3', trend: { value: 0, up: true, label: '较昨日' } },
  { key: 'visits', label: '今日访问', value: 0, icon: 'View', color: 'c4', trend: { value: 0, up: false, label: '较昨日' } },
]);

const fetchArticleList = async () => {
  try {
    articleLoading.value = true;
    const res = await getAllArticleList(1, 10);
    const list = res?.data?.data?.data || [];
    articles.value = list;
    const total = res?.data?.data?.total || list.length;
    updateStat('posts', total);
    // 以下趋势为占位假数据，用于展示设计图的“较上周”效果，后端暂未提供周同比接口
    setTrend('posts', { value: 12, up: true, label: '较上周' });
  } finally {
    articleLoading.value = false;
  }
};

const fetchHotList = async () => {
  const res = await getHotArticleList(1, 4);
  hotList.value = res?.data?.data?.data || [];
};

const fetchVisitors = async () => {
  try {
    const res = await getTodayVisitorCount();
    updateStat('visits', res?.data?.data || 0);
    // 今日访问的“较昨日”趋势为占位假数据，后端暂未提供昨日访问对比接口
    setTrend('visits', { value: -3, up: false, label: '较昨日' });
  } catch { }
};

const updateStat = (key, value) => {
  const i = stats.value.findIndex(s => s.key === key);
  if (i !== -1) stats.value[i].value = value;
};

const setTrend = (key, trend) => {
  const i = stats.value.findIndex(s => s.key === key);
  if (i !== -1) stats.value[i].trend = trend;
};

const fetchRegisteredUsers = async () => {
  // 注册用户总数接口暂缺，预期为 GET /user/count 或类似端点
  // 这里使用假数据 5678，并设置“较上周”+8% 的占位趋势
  updateStat('registered', 28);
  setTrend('registered', { value: 8, up: true, label: '较上周' });
};

const fetchOnlineUsers = async () => {
  // 在线用户统计接口暂缺，预期为 GET /user/online/count 或类似端点
  // 这里使用假数据 342，并设置“较昨日”+5% 的占位趋势
  updateStat('online', 7);
  setTrend('online', { value: 5, up: true, label: '较昨日' });
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const getArticleDetailRoute = (article) => `/user/${article.userId}/article/${article.id}`;
const goToArticle = (article) => router.push(getArticleDetailRoute(article));

onMounted(async () => {
  await Promise.all([fetchArticleList(), fetchHotList(), fetchVisitors(), fetchRegisteredUsers(), fetchOnlineUsers()]);
});

const formatNumber = (n) => Number(n || 0).toLocaleString('zh-CN');

const resolveCover = (item) => {
  const direct = item?.coverUrl || '';
  if (direct) return direct;
  const html = item?.content || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] || '';
};
</script>

<style lang="scss" scoped>
$primary: #FF8E3C;
$text: var(--el-text-color-primary);
$muted: var(--el-text-color-secondary);

.home {
  background: var(--el-bg-color-page);
  margin-top: 24px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
}

.left-nav {
  position: sticky;
  top: 70px;
  align-self: start;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  padding: 16px;
}

.left-nav .nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  color: $text;
  text-decoration: none;
}

.left-nav .nav-item:hover {
  background: var(--el-fill-color-light);
}

.left-nav .nav-item.active {
  background: #ffedd5;
  color: $primary;
}

.left-nav .nav-item.active .item-decorate {
  background: #FF8E3C;
  width: 4px;
  height: 100%;
  border-radius: 2px;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.welcome-banner {
  background: #eef5ff;
  border: 1px solid #dbe8ff;
  padding: 14px 16px;
  border-radius: 10px;
}

.welcome-banner .title {
  font-weight: 600;
  color: $text;
}

.welcome-banner .desc {
  color: $muted;
  font-size: 13px;
  margin-top: 4px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 266px);
  gap: 16px;
}

.stat-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  width: 266px;
  height: 146px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card .card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card .label {
  font-size: 16px;
  color: $muted;
}

.stat-card .value {
  font-size: 28px;
  font-weight: 700;
  margin-top: -6px;
  color: $text;
}


.stat-card .icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card .icon.c1 { background: #ffb366; }
.stat-card .icon.c2 { background: #6ecb8b; }
.stat-card .icon.c3 { background: #b69cff; }
.stat-card .icon.c4 { background: #7aa7ff; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
}

.section-header .more {
  color: $primary;
  text-decoration: none;
  font-size: 13px;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.hot-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.hot-card .el-image {
  width: 100%;
  height: 130px;
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.hot-info {
  padding: 10px 12px;
}

.hot-title {
  font-weight: 600;
  color: $text;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-meta {
  margin-top: 6px;
  display: flex;
  gap: 12px;
  color: $muted;
  font-size: 12px;
  align-items: center;
}

.latest {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 12px 16px;
}

.post-item {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.post-item:last-child {
  border-bottom: none;
}

.post-title a {
  color: $text;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.post-title a:hover {
  color: $primary;
}

.post-desc {
  color: $muted;
  margin-top: 6px;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  gap: 14px;
  align-items: center;
  color: $muted;
  font-size: 12px;
  margin-top: 10px;
}

.post-thumb .el-image {
  width: 100%;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
}

.thumb-error {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: $muted;
  border-radius: 10px;
}

.site-footer {
  margin-top: 20px;
  padding: 16px 0 30px;
  background: transparent;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: $muted;
  font-size: 13px;
}

.footer-inner .links {
  display: flex;
  gap: 8px;
}

@media (max-width: 1024px) {
  .page-container {
    grid-template-columns: 1fr;
  }

  .left-nav {
    display: none;
  }

  .stats {
    grid-template-columns: repeat(2, 266px);
    justify-content: space-between;
  }

  .hot-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .post-item {
    grid-template-columns: 1fr 180px;
  }
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .hot-grid {
    grid-template-columns: 1fr;
  }

  .post-item {
    grid-template-columns: 1fr;
  }

  .post-thumb {
    order: -1;
  }
}
</style>
