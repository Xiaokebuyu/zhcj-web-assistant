<template>
  <div>
    <!-- 顶部导航 -->

    <!-- 主体容器 -->
    <div class="main-wrapper">
      <!-- 左侧主内容区 -->
      <main class="main-content">
        <!-- 公告栏 -->
        <section class="notice-board">
          <div class="notice-content">
            <i class="fas fa-comments"></i>
            <span>温馨提示：共建无障碍交流环境，请使用文明用语</span>
          </div>
        </section>

        <!-- 快速发帖区 -->
        <section class="quick-post-area">
          <div class="post-editor">
            <h2><i class="fas fa-pencil-alt"></i> 发表新帖</h2>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <select v-model="form.category" required>
                  <option value="">选择讨论板块</option>
                  <option value="life">生活帮助</option>
                  <option value="education">教育支持</option>
                  <option value="tech">辅助科技</option>
                </select>
              </div>
              <div class="form-group">
                <input type="text" v-model="form.title" placeholder="请输入帖子标题（如：轮椅出行经验分享）" required />
              </div>
              <div class="form-group">
                <textarea v-model="form.content" rows="4" placeholder="请详细描述您的问题或分享内容..." required></textarea>
              </div>
              <button type="submit" class="submit-btn">
                <i class="fas fa-paper-plane"></i> 立即发布
              </button>
            </form>
          </div>
        </section>

        <!-- 帖子列表区 -->
        <section class="thread-list">
          <h2 class="section-title"><i class="fas fa-comments"></i> 最新讨论</h2>
          <div class="post-list" id="postList">
            <div
                v-for="post in posts"
                :key="post.id"
                class="post-item"
                :data-id="post.id"
            >
              <button class="delete-btn" @click="deletePost(post.id)"><i class="fas fa-trash"></i></button>
              <div class="post-header">
                <span class="post-category">{{ getCategoryName(post.category) }}</span>
                <span class="post-meta">{{ post.timestamp }}</span>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <div class="post-content">{{ post.content }}</div>
            </div>
          </div>
        </section>
      </main>

      <!-- 右侧侧边栏 -->
      <aside class="right-sidebar">
        <!-- 实用资源导航 -->
        <div class="sidebar-card">
          <h3><i class="fas fa-link"></i> 实用资源导航</h3>
          <div class="resource-links">
            <a href="https://www.cdpf.org.cn/" target="_blank" rel="noopener" class="resource-item">
              <i class="fas fa-universal-access"></i>
              <div>
                <div class="resource-title">中国残联官网</div>
                <div class="resource-desc">最新政策法规查询</div>
              </div>
            </a>
            <a href="https://www.cdpee.org.cn/" target="_blank" rel="noopener" class="resource-item">
              <i class="fas fa-closed-captioning"></i>
              <div>
                <div class="resource-title">残疾人就业</div>
                <div class="resource-desc">帮助残障人士融入社会</div>
              </div>
            </a>
          </div>
        </div>

        <!-- 助残动态区块 -->
        <div class="sidebar-card">
          <h3><i class="fas fa-newspaper"></i> 助残动态</h3>
          <div class="news-list">
            <a href="https://www.thepaper.cn/newsDetail_forward_30474248" target="_blank" rel="noopener" class="news-item">
              <div class="news-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="news-content">
                <div class="news-title">科技助残激发残疾人消费</div>
                <div class="news-desc">带动残疾人服务产业升级、服务质量的提升</div>
              </div>
            </a>
            <a href="http://canjiren.china.com.cn/2025-03/28/content_43066831.html" target="_blank" rel="noopener" class="news-item">
              <div class="news-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="news-content">
                <div class="news-title">科技助残平行论坛</div>
                <div class="news-desc">2025中关村论坛年会科技助残平行论坛即将举办</div>
              </div>
            </a>
          </div>
        </div>
      </aside>

      <!-- 浮动发帖按钮 -->
      <button class="float-post-btn" @click="scrollToPost">
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpForum',
  data() {
    return {
      posts: [],
      form: {
        title: '',
        content: '',
        category: ''
      }
    };
  },
  mounted() {
    this.loadPosts();
    if (this.posts.length === 0) this.initDefaultPosts();
  },
  methods: {
    loadPosts() {
      const saved = localStorage.getItem('forumPosts');
      this.posts = saved ? JSON.parse(saved) : [];
    },
    savePosts() {
      localStorage.setItem('forumPosts', JSON.stringify(this.posts));
    },
    initDefaultPosts() {
      this.posts = [
        {
          id: 1,
          title: '轮椅出行公共场所指南',
          content: '整理无障碍设施完善的商场、医院等场所信息...',
          category: 'life',
          timestamp: new Date().toLocaleString()
        },
        {
          id: 2,
          title: '手语学习资源推荐',
          content: '分享优质的手语教学视频和教材...',
          category: 'education',
          timestamp: new Date().toLocaleString()
        }
      ];
      this.savePosts();
      this.loadPosts();
    },
    handleSubmit() {
      const { title, content, category } = this.form;
      if (!title || !content || !category) return;
      const newPost = {
        id: Date.now(),
        title,
        content,
        category,
        timestamp: new Date().toLocaleString()
      };
      this.posts.unshift(newPost);
      this.savePosts();
      this.form = { title: '', content: '', category: '' };
    },
    deletePost(id) {
      this.posts = this.posts.filter(post => post.id !== id);
      this.savePosts();
    },
    getCategoryName(category) {
      const categories = {
        life: '生活帮助',
        education: '教育支持',
        tech: '辅助科技'
      };
      return categories[category] || '其他';
    },
    scrollToPost() {
      this.$el.querySelector('.quick-post-area').scrollIntoView({ behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

/* 复制 style.css 的全部内容 */
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}
body {
  background: #f5f7fa;
}
.main-header {
  background: #2c3e50;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.branding {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
}
.branding h1 {
  color: white;
  font-size: 1.4rem;
}
.global-nav {
  display: flex;
  gap: 2rem;
}
.global-nav a {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.main-wrapper {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}
.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.notice-board {
  background: #e3f2fd;
  border-radius: 8px;
}
.notice-content {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1976d2;
}
.quick-post-area {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 2rem;
}
.post-editor h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}
.submit-btn {
  background: #27ae60;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  transition: background 0.3s;
}
.submit-btn:hover {
  background: #219a52;
}
.thread-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.section-title {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  margin: 0;
}
.post-list {
  padding: 1rem;
}
.post-item {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: relative;
}
.post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.post-category {
  background: #3498db;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
}
.post-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}
.post-meta {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.post-content {
  line-height: 1.6;
}
.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
}
.sidebar-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.sidebar-card h3 {
  padding: 1.2rem;
  border-bottom: 1px solid #eee;
  margin: 0;
}
.resource-links,
.news-list {
  padding: 1rem;
}
.resource-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: #2c3e50;
  border-radius: 6px;
  transition: background 0.2s;
}
.resource-item:hover {
  background: #f8f9fa;
}
.resource-title {
  font-weight: 500;
}
.resource-desc {
  font-size: 0.9rem;
  color: #666;
}
.float-post-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #27ae60;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}
.float-post-btn:hover {
  transform: scale(1.1);
}
.news-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: #2c3e50;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid #eee;
  margin-bottom: 0.8rem;
}
.news-item:hover {
  background: #f8f9fa;
  transform: translateX(5px);
  border-color: #3498db;
}
.news-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
}
.news-content {
  flex: 1;
}
.news-title {
  font-weight: 500;
  margin-bottom: 0.3rem;
}
.news-desc {
  font-size: 0.9rem;
  color: #666;
}
</style>