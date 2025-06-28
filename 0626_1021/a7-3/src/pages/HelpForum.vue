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
        <!-- 快速发帖区 -->
        <section class="quick-post-area">
          <div class="post-editor">
            <h2><i class="fas fa-pencil-alt"></i> 发表新帖</h2>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <select v-model="form.fType" required>
                  <option value="null">选择讨论板块</option>
                  <option :value="0">生活帮助</option>
                  <option :value="1">教育支持</option>
                  <option :value="2">辅助科技</option>
                  <option :value="3">医疗康复</option>
                  <option :value="4">就业创业</option>
                  <option :value="5">心理支持</option>
                </select>
              </div>
              <div class="form-group">
                <input type="text" v-model="form.fTitle" placeholder="请输入帖子标题（如：轮椅出行经验分享）" required />
              </div>
              <div class="form-group">
                <textarea v-model="form.fContent" rows="4" placeholder="请详细描述您的问题或分享内容..." required></textarea>
              </div>
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <i class="fas fa-paper-plane"></i>
                {{ isSubmitting ? '发布中...' : '立即发布' }}
              </button>
            </form>
          </div>
        </section>

        <!-- 帖子列表区 -->
        <section class="thread-list">
          <div class="section-header">
            <h2 class="section-title"><i class="fas fa-comments"></i> 最新讨论</h2>
            <div class="filter-options">
              <select v-model="selectedCategory" @change="filterPosts">
                <option value="">全部分类</option>
                <option value="life">生活帮助</option>
                <option value="education">教育支持</option>
                <option value="tech">辅助科技</option>
                <option value="medical">医疗康复</option>
                <option value="employment">就业创业</option>
                <option value="psychology">心理支持</option>
              </select>
              <select v-model="sortBy" @change="sortPosts">
                <option value="time">最新发布</option>
                <option value="likes">最多点赞</option>
                <option value="comments">最多评论</option>
              </select>
            </div>
          </div>
          <div class="post-list" id="postList">
            <div
                v-for="post in filteredPosts"
                :key="post.id"
                class="post-item"
                :data-id="post.id"
            >
              <div class="post-header">
                <div class="post-info">
                  <span class="post-category">{{ getCategoryName(post.category) }}</span>
                </div>
                <div class="post-meta">
                  <span class="post-author">{{ post.author }}</span>
                  <span class="post-time">{{ post.timestamp }}</span>
                </div>
              </div>
              <div class="post-main">
                <h3 class="post-title">
                  <i class="fas fa-bullhorn"></i>
                  {{ post.title }}
                </h3>
                <div class="post-content-wrapper">
                  <div class="post-content">
                    <div class="content-header">
                      <i class="fas fa-file-text"></i>
                      内容详情：
                    </div>
                    <div class="content-body">{{ post.content }}</div>
                  </div>
                </div>
              </div>
              <div class="post-actions">
                <button class="action-btn" @click="toggleLike(post.id)" :class="{  'liked': likedPosts.includes(`${post.id}_${currentUser}`)  }">
                  <i class="fas" :class="likedPosts.includes(`${post.id}_${currentUser}`) ? 'fa-heart' : 'fa-heart'"></i>
                  <span>{{ post.likes }}</span>
                </button>
                <button class="action-btn" @click="toggleComments(post.id)">
                  <i class="fas fa-comment"></i>
                  <span>{{ post.commentCount || 0 }}</span>
                </button>
                <button class="action-btn" @click="sharePost(post)">
                  <i class="fas fa-share"></i>
                  <span>分享</span>
                </button>
                <button v-if="currentUserId == post.rawAuthorId" class="action-btn delete" @click="deletePost(post.id)">
                  <i class="fas fa-trash"></i>
                  <span>删除</span>
                </button>
              </div>

              <!-- 评论区 -->
              <div class="comments-section" v-if="post.showComments">
                <div class="comments-header">
                  <i class="fas fa-comments"></i>
                  <span>评论区 ({{ post.commentCount || 0 }}条评论)</span>
                </div>
                <div class="comments-list">
                  <div v-for="(comment, commentIndex) in post.comments" :key="commentIndex" class="comment-item">
                    <div class="comment-header">
                      <div class="comment-author-info">
                        <i class="fas fa-user-circle"></i>
                        <span class="comment-author">{{ comment.author }}</span>
                      </div>
                      <span class="comment-time">{{ comment.time }}</span>
                    </div>
                    <div class="comment-content-wrapper">
                      <div class="comment-content">{{ comment.content }}</div>
                    </div>
                    <div class="comment-actions">
                      <button class="action-btn" @click="likeComment(post.id, commentIndex)" :class="{ 'liked': likedComments.includes(`${post.id}_${commentIndex}_${currentUser}`) }">
                        <i class="fas" :class="likedComments.includes(`${post.id}_${commentIndex}_${currentUser}`) ? 'fa-heart' : 'fa-heart'"></i>
                        <span>{{ comment.likes }}</span>
                      </button>
                      <button v-if="currentUserId == comment.rawAuthorId" class="action-btn delete" @click="deleteComment(post.id, commentIndex)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="comment-form">
                  <div class="form-header">
                    <i class="fas fa-edit"></i>
                    <span>发表评论</span>
                  </div>
                  <textarea v-model="post.newComment" placeholder="写下你的评论..."></textarea>
                  <button class="submit-btn" @click="submitComment(post.id)">发表评论</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- 右侧侧边栏 -->
      <aside class="right-sidebar">
        <!-- 用户信息卡片 -->
        <div class="sidebar-card user-card">
          <div class="user-info">
            <i class="fas fa-user-circle"></i>
            <div class="user-details">
              <h3>{{ currentUser }}</h3>
              <p>发帖数：{{ userPostCount }}</p>
            </div>
          </div>
        </div>

        <!-- 热门话题 -->
        <div class="sidebar-card">
          <h3><i class="fas fa-fire"></i> 热门话题</h3>
          <div class="hot-topics">
            <div
                v-for="topic in hotTopicsWithCount"
                :key="topic.id"
                class="topic-item"
                @click="selectTopicCategory(topic.category)"
                :class="{ 'active': selectedCategory === topic.category }"
            >
              <span class="topic-title">{{ topic.title }}</span>
              <span class="topic-count">{{ topic.count }}人参与</span>
            </div>
          </div>
        </div>


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
    </div>
  </div>
</template>

<script>
import axios from "axios";
import request from "@/utils/request";
export default {
  name: 'HelpForum',
  data() {
    return {
      currentUserId: parseInt(localStorage.getItem('userAccount')) || null,
      // 或保持字符串格式但确保一致
      posts: [],
      form: {
        fType: null,
        fTitle: '',
        fContent: '',
        category: '',
        author: localStorage.getItem('userAccount') || '未登录用户'
      },
      isSubmitting: false,
      selectedCategory: '',
      sortBy: 'time',
      currentUser: localStorage.getItem('userAccount') || '未登录用户',
      hotTopics: [
        { id: 1, title: '生活帮助', category: 'life', count: 0 },
        { id: 2, title: '教育支持', category: 'education', count: 0 },
        { id: 3, title: '辅助科技', category: 'tech', count: 0 },
        { id: 4, title: '医疗康复', category: 'medical', count: 0 },
        { id: 5, title: '就业创业', category: 'employment', count: 0 },
        { id: 6, title: '心理支持', category: 'psychology', count: 0 }
      ],
      likedPosts: [],
      likedComments: []
    };
  },
  computed: {
    filteredPosts() {
      let result = [...this.posts];

      // 分类筛选
      if (this.selectedCategory) {
        result = result.filter(post => post.category === this.selectedCategory);
      }

      // 排序
      switch (this.sortBy) {
        case 'time':
          result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          break;
        case 'likes':
          result.sort((a, b) => b.likes - a.likes);
          break;
        case 'comments':
          result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
          break;
      }

      return result;
    },
    userPostCount() {
      // 确保比较的是数字ID而不是字符串
      return this.posts.filter(post => post.rawAuthorId === this.currentUserId).length;
    },
    hotTopicsWithCount() {
      // 统计每个分类的帖子数量
      const categoryCounts = {};
      this.posts.forEach(post => {
        if (post.category) {
          categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
        }
      });
      
      // 更新热门话题的数量
      return this.hotTopics.map(topic => ({
        ...topic,
        count: categoryCounts[topic.category] || 0
      }));
    }
  },
  mounted() {
    this.loadPosts();
    this.loadLikedStatus();
    if (this.posts.length === 0) this.initDefaultPosts();
  },
  methods: {
    formatTimestamp(timestamp) {
      if (!timestamp) return '未知时间';

      try {
        const date = new Date(timestamp);

        // 格式化为 YYYY-MM-DD HH:mm:ss
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        // 或者使用更简单的方式（不同浏览器可能有差异）
        // return date.toLocaleString();
      } catch (e) {
        console.error('时间格式化错误:', e);
        return '无效时间';
      }
    },
    async loadPosts() {
      try {
        // 从cookie中获取token
        const token = this.getCookie('ada_token');
        // console.log(token,"这是加载帖子显示的token");
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login'); // 跳转到登录页
          return;
        }
        // 调用后端接口获取帖子列表
        const response = await request.get('http://localhost:81/forum/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
        // console.log(response,"这是从后端拿取到的回复");
        if (response.data && response.code === 200) {
          console.log(response,"records??");
          // 将后端数据转换为前端需要的格式
          // 正确的数据访问路径
          const records = response.data?.records || [];
          console.log("获取到的帖子记录:", records);
          this.posts = records.map(item => {
            const post = item.post; // 从item中获取post对象
            return {
              id: post.fid,
              title: post.ftitle,
              content: post.fcontent,
              category: this.getCategoryKey(post.ftype),
              author: post.fuid ? `用户${post.fuid}` : '匿名用户',
              timestamp: this.formatTimestamp(post.ftime),
              likes: post.flike || 0, // 注意字段是flike不是fLike
              comments: [],
              commentCount: item.replyCount || 0, // 使用外层的replyCount
              showComments: false,
              newComment: '',
              rawAuthorId: post.fuid, // 添加原始用户ID
            };
          });
          console.log(this.posts,'这是posts取到的值');

        } else {
          this.$message.error(response.data.msg || '获取帖子列表失败');
        }
      } catch (error) {
        console.error('获取帖子列表错误:', error);
        if (error.response && error.response.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
        } else {
          this.$message.error('获取帖子列表失败，请稍后重试');
        }
      }
    },

    // 将数字类型转换为分类key
    getCategoryKey(type) {
      const categories = {
        0: 'life',
        1: 'education',
        2: 'tech',
        3: 'medical',
        4: 'employment',
        5: 'psychology'
      };
      return categories[type] || '';
    },



    savePosts() {
      localStorage.setItem('forumPosts', JSON.stringify(this.posts));
    },
    loadLikedStatus() {
      const savedLikedPosts = localStorage.getItem('likedPosts');
      const savedLikedComments = localStorage.getItem('likedComments');
      if (savedLikedPosts) {
        this.likedPosts = JSON.parse(savedLikedPosts);
      }
      if (savedLikedComments) {
        this.likedComments = JSON.parse(savedLikedComments);
      }
    },
    saveLikedStatus() {
      localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
      localStorage.setItem('likedComments', JSON.stringify(this.likedComments));
    },
    initDefaultPosts() {
      this.posts = [
        {
          id: 1,
          title: '轮椅出行公共场所指南',
          content: '整理无障碍设施完善的商场、医院等场所信息...',
          category: 'life',
          author: '用户123',
          timestamp: new Date().toLocaleString(),
          likes: 0,
          comments: [],
          showComments: false,
          newComment: ''
        },
        {
          id: 2,
          title: '手语学习资源推荐',
          content: '分享优质的手语教学视频和教材...',
          category: 'education',
          author: '用户456',
          timestamp: new Date().toLocaleString(),
          likes: 0,
          comments: [],
          showComments: false,
          newComment: ''
        }
      ];
      this.savePosts();
    },
    async handleSubmit() {
      if (this.form.fType === null || !this.form.fTitle || !this.form.fContent) {
        this.$message.error('请填写完整信息');
        return;
      }
      this.isSubmitting = true;

      try {
        // 从cookie中获取token
        const token = this.getCookie('ada_token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login'); // 跳转到登录页
          return;
        }

        const postData = {
          ftype: Number(this.form.fType), // 确保是数字类型
          ftitle: this.form.fTitle,
          fcontent: this.form.fContent
        };


        const response = await axios.post('http://localhost:81/forum/publish', postData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true // 确保发送cookie
        });

        console.log(response,"论坛论坛论坛");
        if (response.data && response.data.code === 200) {
          this.$message.success('发帖成功');
          // 清空表单
          this.form = {
            fType: null,
            fTitle: '',
            fContent: ''
          };

          // 刷新帖子列表
          await this.loadPosts(); // 添加 await 确保加载完成
        } else {
          this.$message.error(response.msg || '发帖失败');
        }
      } catch (error) {
        console.error('发帖错误:', error);
        if (error.response && error.response.data) {
          if (error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error(error.response.data.msg || '发帖失败');
          }
        } else {
          this.$message.error('网络错误，请稍后重试');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    // 从cookie中获取指定名称的值
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
    async toggleLike(postId) {
      try {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const token = this.getCookie('ada_token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        const likeKey = `${postId}_${this.currentUser}`;
        const isLiked = this.likedPosts.includes(likeKey);

        // 调用点赞接口
        const response = await axios.put(
            `http://localhost:81/forum/like/${postId}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              withCredentials: true
            }
        );

        if (response.data && response.data.code === 200) {
          // 更新前端状态
          if (isLiked) {
            // 取消点赞
            const index = this.likedPosts.indexOf(likeKey);
            this.likedPosts.splice(index, 1);
            post.likes = Math.max(0, post.likes - 1);
          } else {
            // 添加点赞
            this.likedPosts.push(likeKey);
            post.likes += 1;
          }

          this.saveLikedStatus();
          this.savePosts();
        } else {
          this.$message.error(response.data?.msg || '操作失败');
        }
      } catch (error) {
        console.error('点赞失败:', error);
        if (error.response) {
          if (error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error(error.response.data?.msg || '点赞失败');
          }
        } else {
          this.$message.error('网络错误，请稍后重试');
        }
      }
    },

   async toggleComments(postId) {
     const post = this.posts.find(p => p.id === postId);
     if (post) {
       // 如果正在展开评论且还没有加载过评论
       if (!post.showComments) {
         try {
           const token = this.getCookie('ada_token');
           if (!token) {
             this.$message.error('请先登录');
             return;
           }

           // 调用获取评论接口
           const response = await axios.get(`http://localhost:81/forum/replies/${postId}`, {
             headers: {
               'Authorization': `Bearer ${token}`
             },
             withCredentials: true,
             params: {
               page: 1,
               pageSize: 100 // 可以根据需要调整每页数量
             }
           });

           if (response.data && response.data.code === 200) {
             post.comments = response.data.data.records.map(reply => ({
               id: reply.rpId,
               author: reply.rpUid ? `用户${reply.rpUid}` : '匿名用户',
               content: reply.rpContent,
               time: this.formatTimestamp(reply.rpTime),
               likes: reply.rpLike || 0,  // 确保使用后端返回的rpLike字段
               rawAuthorId: reply.rpUid  // 新增：保存原始评论作者ID
             }));
             console.log(post.comments,'这是评论的内容aaaaa');
             // 更新评论总数（如果后端返回了总数）
             if (response.data.data.total !== undefined) {
               post.commentCount = response.data.data.total;
             }
           }
         } catch (error) {
           console.error('获取评论错误:', error);
           if (error.response) {
             if (error.response.status === 401) {
               this.$message.error('登录已过期，请重新登录');
             } else {
               this.$message.error(error.response.data?.msg || '获取评论失败');
             }
           } else {
             this.$message.error('网络错误，请稍后重试');
           }
         }
       }

       // 切换评论显示状态
       post.showComments = !post.showComments;
       this.savePosts();
     }




    },
    async submitComment(postId) {
      const post = this.posts.find(p => p.id === postId);
      if (!post || !post.newComment.trim()) return;

      try {
        const token = this.getCookie('ada_token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }
        const commentData = {
          rpFid: postId,       // 回复的帖子ID
          rpContent: post.newComment // 回复内容
        };

        const response = await axios.post('http://localhost:81/forum/reply', commentData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });

        if (response.data && response.data.code === 200) {
          this.$message.success('评论成功');
          post.comments.unshift({
            id: response.data.data.rpid,
            author: this.currentUser,
            content: post.newComment,
            time: this.formatTimestamp(Date.now()),
            likes: 0,
            rawAuthorId: this.currentUserId // 添加当前用户ID作为评论作者ID
          });
          post.commentCount += 1; // 增加评论总数
          post.newComment = '';
        } else {
          this.$message.error(response.data?.msg || '评论失败');
        }
      } catch (error) {
        console.error('评论错误:', error);
        if (error.response) {
          if (error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error(error.response.data?.msg || '评论失败');
          }
        } else {
          this.$message.error('网络错误，请稍后重试');
        }
      }
    },

    async likeComment(postId, commentIndex) {
      try {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !post.comments[commentIndex]) {
          return;
        }

        const comment = post.comments[commentIndex];

        // // 关键检查：确保comment.id是有效数字
        // if (!comment.id || isNaN(comment.id)) {
        //   console.error('无效的评论ID:', comment.id);
        //   this.$message.error('评论数据异常，请刷新后重试');
        //   return;
        // }

        const likeKey = `${postId}_${commentIndex}_${this.currentUser}`;
        const isLiked = this.likedComments.includes(likeKey);

        // 获取token
        const token = this.getCookie('ada_token');
        if (!token) {
          this.$message.error('请先登录');
          return;
        }

        // 调用点赞接口
        const response = await request.put(
            `http://localhost:81/forum/reply/like/${comment.id}`,
            {}, // 空body
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              withCredentials: true
            }
        );
        console.log(response,'这是喜欢的回复');
        if (response.data && response.code === 200) {
          // 更新前端状态
          if (isLiked) {
            // 取消点赞
            const index = this.likedComments.indexOf(likeKey);
            this.likedComments.splice(index, 1);
            comment.likes = Math.max(0, comment.likes - 1);
          } else {
            // 添加点赞
            this.likedComments.push(likeKey);
            comment.likes += 1;
          }

          this.saveLikedStatus();
          this.savePosts();
        } else {
          this.$message.error(response.data?.msg || '操作失败');
        }
      } catch (error) {
        console.error('点赞失败:', error);
        if (error.response) {
          if (error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
          } else {
            this.$message.error(error.response.data?.msg || '点赞失败');
          }
        } else {
          this.$message.error('网络错误，请稍后重试');
        }
      }
    },




    // 修改deleteComment方法，添加接口调用
    async deleteComment(postId, commentIndex) {
      const post = this.posts.find(p => p.id === postId);

      if (!post || !post.comments[commentIndex]) return;
      // console.log(post,'这是post');
      const comment = post.comments[commentIndex];
      console.log('完整评论对象:', comment); // 添加这行调试代码

      try {
        const token = this.getCookie('ada_token');
        if (!token) {
          this.$message.error('请先登录');
          return;
        }
        const comment = post.comments[commentIndex];
        // 添加确认对话框
        if (!confirm('确定要删除这条回复吗？')) return;

        // 确保使用正确的评论ID属性 - 这里改为使用comment.id
        const replyId = comment.id;
        if (!replyId) {
          this.$message.error('无法获取回复ID');
          return;
        }

        // 调用后端删除接口
        const response = await request.delete(
            `http://localhost:81/forum/reply/${comment.id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              withCredentials: true
            }
        );

        if (response.data && response.code === 200) {
          this.$message.success('删除回复成功');

          // 从本地评论列表中移除
          post.comments.splice(commentIndex, 1);

          // 更新评论总数
          post.commentCount = post.commentCount > 0 ? post.commentCount - 1 : 0;

          // 保存状态
          this.savePosts();
        } else {
          this.$message.error(response.data?.msg || '删除回复失败');
        }
      } catch (error) {
        console.error('删除回复错误:', error);
        if (error.response) {
          if (error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
          } else {
            this.$message.error(error.response.data?.msg || '删除回复失败');
          }
        } else {
          this.$message.error('网络错误，请稍后重试');
        }
      }
    },

    async deletePost(postId) {
      if (!confirm('确定要删除这个帖子吗？')) return;

      try {
        const token = this.getCookie('ada_token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        const response = await axios.delete(`http://localhost:81/forum/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });

        if (response.data && response.data.code === 200) {
          this.$message.success('删除帖子成功');
          // 从本地posts中移除已删除的帖子
          this.posts = this.posts.filter(post => post.id !== postId);
        } else {
          this.$message.error(response.data?.msg || '删除帖子失败');
        }
      } catch (error) {
        console.error('删除帖子错误:', error);
        if (error.response) {
          if (error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error(error.response.data?.msg || '删除帖子失败');
          }
        } else {
          this.$message.error('网络错误，请稍后重试');
        }
      }
    },
    sharePost(post) {
      // 实现分享功能
      const shareUrl = `${window.location.origin}/forum/post/${post.id}`;
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.content,
          url: shareUrl
        }).catch(console.error);
      } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(shareUrl).then(() => {
          this.$alert('链接已复制到剪贴板！');
        }).catch(console.error);
      }
    },
    filterPosts() {
      // 分类筛选逻辑已移至计算属性
    },
    sortPosts() {
      // 排序逻辑已移至计算属性
    },
    getCategoryName(category) {
      const categories = {
        life: '生活帮助',
        education: '教育支持',
        tech: '辅助科技',
        medical: '医疗康复',
        employment: '就业创业',
        psychology: '心理支持'
      };
      return categories[category] || '其他';
    },
    selectTopicCategory(category) {
      // 如果点击的是当前选中的分类，则取消选择
      if (this.selectedCategory === category) {
        this.selectedCategory = '';
      } else {
        this.selectedCategory = category;
      }
    }
  }
};
</script>

<style scoped>
.main-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.notice-board {
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #856404;
}

.post-editor {
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.post-editor h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-group textarea {
  height: 120px;
  resize: vertical;
  line-height: 1.5;
}

.post-list {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.section-title {
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #4CAF50;
  font-size: 1.2rem;
}

.filter-options {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-options select {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  font-weight: 500;
}

.filter-options select:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.1);
}

.filter-options select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.post-item {
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: white;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.post-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.post-category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #bbdefb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-urgency {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.urgency-normal {
  background: #e8f5e9;
  color: #4CAF50;
}

.urgency-urgent {
  background: #fff3e0;
  color: #FFC107;
}

.urgency-emergency {
  background: #ffebee;
  color: #F44336;
}

.post-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9em;
  align-items: center;
}

.post-author {
  font-weight: 500;
  color: #333;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.post-time {
  color: #888;
  font-style: italic;
}

.post-main {
  margin-bottom: 15px;
}

.post-title {
  margin: 10px 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.3;
  color: #2c3e50;
  border-left: 4px solid #4CAF50;
  padding-left: 12px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-title i {
  color: #4CAF50;
  font-size: 1.1rem;
}

.post-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-content {
  color: #444;
  line-height: 1.6;
  margin-bottom: 15px;
  font-size: 1rem;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.content-header i {
  color: #4CAF50;
  font-size: 0.9rem;
}

.content-body {
  color: #444;
  line-height: 1.6;
  font-size: 1rem;
}

.post-actions {
  display: flex;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  margin-top: 15px;
  background: #fafafa;
  padding: 12px 15px;
  border-radius: 6px;
  margin: 15px -15px -15px -15px;
}

.submit-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-btn {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.action-btn:hover {
  background-color: #f8f9fa;
  color: #333;
  border-color: #4CAF50;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.action-btn.liked {
  color: #e91e63;
  background-color: #fce4ec;
  border-color: #e91e63;
}

.action-btn.liked i {
  animation: heartBeat 0.3s ease-in-out;
}

.action-btn.delete {
  color: #f44336;
  border-color: #f44336;
}

.action-btn.delete:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.action-btn i {
  font-size: 16px;
}

.action-btn span {
  font-size: 14px;
  font-weight: 500;
}

.comments-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #e0e0e0;
  background: #f0f8ff;
  border-radius: 8px;
  padding: 20px;
  margin: 20px -15px -15px -15px;
  border: 1px solid #d1ecf1;
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0c5460;
  font-size: 1.1rem;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #bee5eb;
}

.comments-header i {
  color: #17a2b8;
  font-size: 1.2rem;
}

.comments-list {
  margin-bottom: 20px;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #d1ecf1;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  border-left: 4px solid #17a2b8;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-author-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-author-info i {
  color: #17a2b8;
  font-size: 1.1rem;
}

.comment-author {
  font-weight: 600;
  color: #0c5460;
  background: #d1ecf1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.comment-time {
  color: #888;
  font-size: 0.85rem;
  font-style: italic;
}

.comment-content-wrapper {
  margin-bottom: 10px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.comment-content {
  margin: 0;
  color: #495057;
  line-height: 1.5;
  padding: 0;
  font-size: 0.95rem;
}

.comment-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #d1ecf1;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #d1ecf1;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #0c5460;
  font-size: 0.95rem;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #bee5eb;
}

.form-header i {
  color: #17a2b8;
  font-size: 0.9rem;
}

.comment-form textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #d1ecf1;
  border-radius: 6px;
  resize: vertical;
  min-height: 80px;
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 0.3s ease;
  background: #f8f9fa;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #17a2b8;
  box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
  background: white;
}

.comment-form button {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  align-self: flex-end;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(23, 162, 184, 0.3);
}

.comment-form button:hover {
  background: linear-gradient(135deg, #138496, #117a8b);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(23, 162, 184, 0.4);
}

.comment-actions button {
  background: white;
  border: 1px solid #d1ecf1;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.comment-actions button:hover {
  background-color: #f8f9fa;
  color: #495057;
  border-color: #17a2b8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.comment-actions button.liked {
  color: #e91e63;
  background-color: #fce4ec;
  border-color: #e91e63;
}

.comment-actions button.delete {
  color: #dc3545;
  border-color: #dc3545;
}

.comment-actions button.delete:hover {
  background-color: #f8d7da;
  color: #721c24;
}

.comment-actions button i {
  font-size: 14px;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-card {
  text-align: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.user-info i {
  font-size: 48px;
  color: #666;
}

.user-details h3 {
  margin: 0;
  color: #333;
}

.user-details p {
  margin: 5px 0 0;
  color: #666;
}

.resource-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.3s;
}

.resource-item:hover {
  background-color: #f5f5f5;
}

.resource-item i {
  font-size: 24px;
  color: #1976d2;
}

.resource-title {
  font-weight: 500;
  color: #333;
}

.resource-desc {
  font-size: 0.9em;
  color: #666;
}

.hot-topics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.topic-item:hover {
  background-color: #f8f9fa;
  border-color: #17a2b8;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.topic-item.active {
  background-color: #e3f2fd;
  border-color: #1976d2;
  color: #1976d2;
}

.topic-title {
  font-weight: 500;
  color: #333;
  flex: 1;
}

.topic-item.active .topic-title {
  color: #1976d2;
  font-weight: 600;
}

.topic-count {
  font-size: 0.85rem;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.topic-item.active .topic-count {
  background: #1976d2;
  color: white;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.news-item {
  display: flex;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.news-item:hover {
  background-color: #f5f5f5;
}

.news-icon {
  width: 40px;
  height: 40px;
  background: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
}

.news-content {
  flex: 1;
}

.news-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.news-desc {
  font-size: 0.9em;
  color: #666;
}

@media (max-width: 768px) {
  .main-wrapper {
    grid-template-columns: 1fr;
    padding: 10px;
  }
  
  .right-sidebar {
    display: none;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .filter-options {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .filter-options select {
    flex: 1;
    min-width: 120px;
  }
  
  .post-item {
    padding: 15px;
    margin-bottom: 10px;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .post-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .post-actions {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .action-btn {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }
  
  .post-title {
    font-size: 1.2rem;
  }
  
  .post-content {
    padding: 12px;
  }
  
  .comments-section {
    padding: 15px;
    margin: 15px -15px -15px -15px;
  }
  
  .comments-header {
    font-size: 1rem;
  }
  
  .comment-item {
    padding: 12px;
    margin-bottom: 10px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .comment-content-wrapper {
    padding: 10px;
  }
  
  .comment-form {
    padding: 12px;
  }
  
  .comment-form textarea {
    min-height: 60px;
  }
  
  .topic-item {
    padding: 8px 10px;
  }
  
  .topic-title {
    font-size: 0.9rem;
  }
  
  .topic-count {
    font-size: 0.8rem;
    padding: 1px 6px;
  }
}
</style>