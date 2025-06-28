<template>
  <div class="home">
    <div class="carousel-wrapper">
      <div class="carousel" :style="{height:carouselHeight+'px'}">
        <img v-for="(img, idx) in carouselImages" :key="idx" :src="img" :alt="'banner'+(idx+1)" :class="{active: idx===carouselIndex}" />
        <div class="carousel-dots">
          <span v-for="(img, idx) in carouselImages" :key="'dot'+idx" :class="{active: idx===carouselIndex}" @click="setCarousel(idx)"></span>
        </div>
      </div>
    </div>
    <div class="news-bar">
      <div class="news-activity-row">
        <!-- 新闻栏 -->
        <div class="news-bar-col">
          <div class="news-title">最新助残资讯</div>
          <div class="news-list">
            <div class="news-row" v-for="news in newsList" :key="news.id">
              <span class="news-date">{{ news.date }}</span>
              <a class="news-link" :href="news.url" target="_blank">{{ news.title }}</a>
            </div>
          </div>
          <div class="news-more-wrap">
            <a class="news-more" href="https://news.baidu.com/new?word=%E5%8A%A9%E6%AE%8B" target="_blank">点击查看更多</a>
          </div>
        </div>
        <!-- 活动栏 -->
        <div class="news-bar-col">
          <div class="news-title">最新助残活动</div>
          <div class="news-list">
            <div class="news-row" v-for="act in activityList" :key="act.id">
              <span class="news-date">{{ act.date }}</span>
              <a class="news-link" :href="act.url" target="_blank">{{ act.title }}</a>
            </div>
          </div>
          <div class="news-more-wrap">
            <a class="news-more" href="https://www.baidu.com/s?wd=%E5%8A%A9%E6%AE%8B%E6%B4%BB%E5%8A%A8" target="_blank">点击查看更多</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除古玩展示区域,添加平台特色展示 -->
    <div class="features-showcase">
      <h2 class="section-title">平台特色</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80" alt="志愿者头像1" class="avatar">
            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" alt="志愿者头像2" class="avatar">
            <img src="https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?auto=format&fit=crop&w=200&q=80" alt="志愿者头像3" class="avatar">
          </div>
          <h3>无障碍服务</h3>
          <p>提供全方位的无障碍服务支持，包括日常生活协助、医疗陪护、出行帮助等多种服务类型</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="志愿者头像4" class="avatar">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" alt="志愿者头像5" class="avatar">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" alt="志愿者头像6" class="avatar">
          </div>
          <h3>志愿者团队</h3>
          <p>专业的志愿者团队，经过系统培训，具备专业服务能力，为残障人士提供温暖贴心的服务</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" alt="志愿者头像7" class="avatar">
            <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80" alt="志愿者头像8" class="avatar">
            <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80" alt="志愿者头像9" class="avatar">
          </div>
          <h3>安全保障</h3>
          <p>完善的安全保障机制，志愿者实名认证，服务全程保险覆盖，让每一次服务都安心放心</p>
        </div>
      </div>
    </div>

    <!-- 感动瞬间 -->
    <div class="touching-moments">
      <h2 class="section-title">感动瞬间</h2>
      <p class="section-desc">记录每一个温暖的故事，传递社会的大爱</p>

      <div class="moments-grid">
        <div class="moment-card">
          <div class="moment-image">
            <img src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80" alt="志愿者陪伴">
          </div>
          <div class="moment-content">
            <h3>暖心陪伴</h3>
            <p class="moment-date">2024年3月15日</p>
            <p class="moment-text">大学生志愿者小王每周都会来看望张爷爷，陪他聊天、读报，让独居的张爷爷感受到了家人般的温暖。这份跨越年龄的友谊，让生活充满了欢声笑语。</p>
          </div>
        </div>

        <div class="moment-card">
          <div class="moment-image">
            <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80" alt="无障碍运动">
          </div>
          <div class="moment-content">
            <h3>运动无界</h3>
            <p class="moment-date">2024年4月20日</p>
            <p class="moment-text">在志愿者的帮助下，小明第一次体验到了篮球的乐趣。特制的运动器材和耐心的指导，让运动的快乐不再有障碍。"我也能打篮球了！"小明开心地说。</p>
          </div>
        </div>

        <div class="moment-card">
          <div class="moment-image">
            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80" alt="艺术治愈">
          </div>
          <div class="moment-content">
            <h3>艺术之光</h3>
            <p class="moment-date">2024年5月8日</p>
            <p class="moment-text">李阿姨通过绘画找到了表达自我的新方式。在志愿者的鼓励下，她的画作还在社区展览中展出，获得了众多好评。"画画让我重新找到了生活的色彩。"</p>
          </div>
        </div>

        <div class="moment-card">
          <div class="moment-image">
            <img src="https://images.unsplash.com/photo-1559024094-4a1e4495c3c1?auto=format&fit=crop&w=800&q=80" alt="职业培训">
          </div>
          <div class="moment-content">
            <h3>追梦起航</h3>
            <p class="moment-date">2024年6月1日</p>
            <p class="moment-text">经过三个月的职业培训，小张成功应聘为一家科技公司的程序员。"感谢平台提供的机会，让我能够像其他人一样追逐梦想。现在的我，对未来充满信心！"</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务流程 -->
    <div class="service-process">
      <h2 class="section-title">服务流程</h2>
      <div class="process-steps">
        <div class="process-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>发布需求</h4>
            <p>残障人士发布具体服务需求</p>
          </div>
        </div>
        <div class="process-arrow">→</div>
        <div class="process-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>志愿者接单</h4>
            <p>合适的志愿者接受服务请求</p>
          </div>
        </div>
        <div class="process-arrow">→</div>
        <div class="process-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>提供服务</h4>
            <p>志愿者按约定时间提供服务</p>
          </div>
        </div>
        <div class="process-arrow">→</div>
        <div class="process-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>评价反馈</h4>
            <p>服务完成后双方互评</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务统计 -->
    <div class="statistics">
      <div class="stat-item">
        <div class="stat-number">5000+</div>
        <div class="stat-label">注册志愿者</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">8000+</div>
        <div class="stat-label">服务人次</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">98%</div>
        <div class="stat-label">服务满意度</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">100+</div>
        <div class="stat-label">合作机构</div>
      </div>

    </div>

  </div>
</template>

<script>
const carouselImgs = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80'
];
export default {
  name: 'HomePage',
  data() {
    return {
      speechSynth: null,
      speechUtterance: null,
      carouselImages: carouselImgs,
      carouselIndex: 0,
      carouselTimer: null,
      carouselHeight: 0,
      newsList: [
        { id: 1, date: '2025年03月12日', title: '全国助残日：多地举办无障碍体验活动', url: 'https://news.example.com/2025-03-12-1' },
        { id: 2, date: '2025年04月08日', title: '智能辅具新突破，助力残障人士生活', url: 'https://news.example.com/2025-04-08-2' },
        { id: 3, date: '2025年05月20日', title: '残障就业新政落地，岗位机会大增', url: 'https://news.example.com/2025-05-20-3' },
        { id: 4, date: '2025年06月01日', title: '志愿者助残服务案例获表彰', url: 'https://news.example.com/2025-06-01-4' }
      ],
      activityList: [
        { id: 1, date: '2025年03月20日', title: '全国助残日公益跑活动报名开启', url: 'https://activity.example.com/2025-03-20-1' },
        { id: 2, date: '2025年04月15日', title: '无障碍设施体验营（北京站）', url: 'https://activity.example.com/2025-04-15-2' },
        { id: 3, date: '2025年05月10日', title: '残障人士就业专场招聘会', url: 'https://activity.example.com/2025-05-10-3' },
        { id: 4, date: '2025年06月05日', title: '志愿者助残服务培训班', url: 'https://activity.example.com/2025-06-05-4' }
      ]
    }
  },
  created() {
    if ('speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis;
    }
    this.setCarouselHeight();
    window.addEventListener('resize', this.setCarouselHeight);
    this.startCarousel();
  },
  methods: {
    goTo(type) {
      this.$router.push(`/${type}`);
    },
    readContent(text) {
      if (this.speechSynth) {
        this.stopReading();
        this.speechUtterance = new SpeechSynthesisUtterance(text);
        this.speechUtterance.lang = 'zh-CN';
        this.speechUtterance.rate = 1.0;
        this.speechUtterance.pitch = 1.0;
        this.speechUtterance.volume = 0.8;
        this.speechSynth.speak(this.speechUtterance);
      }
    },
    stopReading() {
      if (this.speechSynth) {
        this.speechSynth.cancel();
      }
    },
    setCarousel(idx) {
      this.carouselIndex = idx;
    },
    startCarousel() {
      this.carouselTimer = setInterval(() => {
        this.carouselIndex = (this.carouselIndex + 1) % this.carouselImages.length;
      }, 4000);
    },
    setCarouselHeight() {
      this.carouselHeight = Math.max(window.innerHeight * 0.7, 420);
    }
  },
  beforeDestroy() {
    this.stopReading();
    window.removeEventListener('resize', this.setCarouselHeight);
    clearInterval(this.carouselTimer);
  }
}
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: 30px;

  .header {
    text-align: center;
    padding: 60px 20px;

    h1 {
      font-size: 48px;
      color: #2c3e50;
      margin-bottom: 20px;
      font-weight: bold;
      letter-spacing: 2px;
    }

    p {
      font-size: 24px;
      color: #5a6d7e;
      line-height: 1.5;
    }
  }

  .entrance-container {
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;  // 防止换行
    flex-direction: row;  // 改为横向排列
    align-items: stretch;  // 让所有入口高度一致
    gap: 30px;  // 调整间距
    padding: 40px 20px;
    flex: 1;
    margin: 0 auto;
    max-width: 1200px;  // 增加最大宽度以适应横向排列

    .entrance {
      width: calc(33.33% - 20px);  // 平均分配宽度
      max-width: none;  // 移除单个入口的最大宽度
      background-color: white;
      border-radius: 16px;
      padding: 30px;
      display: flex;
      flex-direction: row;  // 改为横向排列图标和内容
      justify-content: flex-start;  // 左对齐
      gap: 30px;  // 图标和内容之间的间距

      .icon {
        width: 100px;
        height: 100px;
        margin-bottom: 25px;
        background-color: #f0f5ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;  // 防止图标缩小

        i {
          font-size: 50px;
          color: #4a6cf7;
        }
      }

      .entrance-content {
        text-align: left;  // 文字左对齐
        flex: 1;  // 占据剩余空间

        h2 {
          font-size: 32px;
          color: #2c3e50;
          margin-bottom: 15px;
          font-weight: bold;
        }

        p {
          font-size: 20px;
          color: #5a6d7e;
          line-height: 1.5;
        }
      }
    }

    .entrance:nth-child(1) .icon {
      background-color: #fff0f0;

      i {
        color: #f74a4a;
      }
    }

    .entrance:nth-child(2) .icon {
      background-color: #f0fff0;

      i {
        color: #4af74a;
      }
    }

    .entrance:nth-child(3) .icon {
      background-color: #f0f5ff;

      i {
        color: #4a6cf7;
      }
    }
  }

  .footer {
    text-align: center;
    padding: 30px;
    background-color: rgba(255, 255, 255, 0.5);

    p {
      font-size: 18px;
      color: #5a6d7e;
    }
  }
}

/* 登录弹窗样式 */
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
  }

  .modal-content {
    position: relative;
    width: 100%;
    max-width: 550px;  // 增加最大宽度
    background-color: white;
    border-radius: 20px;  // 增大圆角
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: modalFadeIn 0.3s ease;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30px 40px;  // 增加内边距
      background-color: #f5f7fa;
      border-bottom: 1px solid #e0e6ed;

      h3 {
        font-size: 32px;  // 增大标题字体
        color: #2c3e50;
        margin: 0;
        font-weight: bold;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 36px;  // 增大关闭按钮
        color: #5a6d7e;
        cursor: pointer;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;

        &:hover {
          background-color: rgba(0,0,0,0.1);
          color: #2c3e50;
        }
      }
    }

    .modal-body {
      padding: 40px;  // 增加内边距

      .form-group {
        margin-bottom: 30px;  // 增加表单组间距

        label {
          display: block;
          font-size: 20px;  // 增大标签字体
          color: #5a6d7e;
          margin-bottom: 12px;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 18px 20px;  // 增大输入框
          border: 2px solid #e0e6ed;  // 加粗边框
          border-radius: 12px;  // 增大圆角
          font-size: 20px;  // 增大输入字体
          transition: all 0.3s;

          &:focus {
            outline: none;
            border-color: #4a6cf7;
            box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
          }

          &::placeholder {
            color: #a0aec0;
          }
        }
      }

      .form-actions {
        display: flex;
        gap: 20px;  // 增加按钮间距
        margin-top: 40px;  // 增加上边距

        button {
          flex: 1;
          padding: 18px 0;  // 增大按钮高度
          border-radius: 12px;  // 增大圆角
          font-size: 22px;  // 增大按钮字体
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          letter-spacing: 1px;
        }

        .login-btn {
          background-color: #4a6cf7;
          color: white;
          border: none;

          &:hover {
            background-color: #3a5ce5;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(74, 108, 247, 0.3);
          }

          &:active {
            transform: translateY(0);
          }
        }

        .register-btn {
          background-color: white;
          color: #4a6cf7;
          border: 2px solid #4a6cf7;  // 加粗边框

          &:hover {
            background-color: #f0f5ff;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(74, 108, 247, 0.1);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }

      .form-footer {
        text-align: center;
        margin-top: 30px;  // 增加上边距

        a {
          color: #4a6cf7;
          text-decoration: none;
          font-size: 18px;  // 增大链接字体
          padding: 10px;
          display: inline-block;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

/* 适配移动端 */
@media (max-width: 768px) {
  .login-modal .modal-content {
    max-width: 90%;
    margin: 0 20px;

    .modal-header {
      padding: 20px 25px;

      h3 {
        font-size: 28px;
      }
    }

    .modal-body {
      padding: 25px;

      .form-group label {
        font-size: 18px;
      }

      .form-group input {
        padding: 15px;
        font-size: 18px;
      }

      .form-actions button {
        padding: 15px 0;
        font-size: 18px;
      }
    }
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 轮播图样式
.carousel-wrapper {
  width: 100vw;
  overflow: hidden;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  background: #eee;
}
.carousel {
  width: 100vw;
  position: relative;
  overflow: hidden;
  background: #eee;
}
.carousel img {
  width: 100vw;
  height: 100%;
  object-fit: cover;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transition: opacity 0.8s;
  z-index: 1;
}
.carousel img.active {
  opacity: 1;
  z-index: 2;
}
.carousel-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 10;
}
.carousel-dots span {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  border: 2px solid #fff;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
}
.carousel-dots span.active {
  background: #4a6cf7;
  border: 2px solid #4a6cf7;
}

/* 新闻区域样式 */
.news-bar {
  max-width: 1200px;
  width: 100%;
  margin: 40px auto;
  padding: 30px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.news-activity-row {
  display: flex;
  gap: 40px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.news-bar-col {
  flex: 1;
  background: #fff;
  padding: 20px 30px;
  border-radius: 8px;
  min-width: 0;
}

.news-title {
  font-size: 20px;
  color: #2c3e50;
  font-weight: bold;
  padding-bottom: 15px;
  margin-bottom: 20px;
  border-bottom: 2px solid #4a6cf7;
}

.news-list {
  .news-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    &:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }
  }

  .news-date {
    flex-shrink: 0;
    font-size: 14px;
    color: #666;
    margin-right: 15px;
    min-width: 110px;
  }

  .news-link {
    color: #333;
    text-decoration: none;
    font-size: 15px;
    line-height: 1.5;
    transition: color 0.3s;

    &:hover {
      color: #4a6cf7;
    }
  }
}

.news-more-wrap {
  text-align: right;
  margin-top: 20px;
}

.news-more {
  color: #4a6cf7;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .news-activity-row {
    flex-direction: column;
    gap: 20px;
    padding: 0 15px;
  }

  .news-bar {
    margin: 20px auto;
    padding: 15px;
    width: calc(100% - 30px);
  }

  .news-bar-col {
    padding: 15px 20px;
  }

  .news-list .news-row {
    flex-direction: column;

    .news-date {
      margin-bottom: 5px;
    }
  }
}

/* 删除古玩展示样式,添加新样式 */
.features-showcase {
  max-width: 1200px;
  margin: 48px auto;
  padding: 0 20px;
  text-align: center;
}

.section-title {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 40px;
  font-weight: bold;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-10px);
  }
}

.feature-icon {
  width: auto;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: -15px;  // 让头像重叠

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    object-fit: cover;
    transition: transform 0.3s ease;

    &:not(:first-child) {
      margin-left: -15px;  // 头像重叠效果
    }

    &:hover {
      transform: translateY(-5px);
      z-index: 1;
    }
  }
}

.feature-card:hover {
  .avatar {
    &:nth-child(1) { transform: translate(-5px, -5px); }
    &:nth-child(2) { transform: translateY(-8px); }
    &:nth-child(3) { transform: translate(5px, -5px); }
  }
}

.feature-card h3 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 16px;
}

.feature-card p {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.statistics {
  background: linear-gradient(135deg, #b0f3ef 0%, #20b2aa 100%);
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 60px 0;
}

.stat-item {
  text-align: center;
  color: #fff;
}

.stat-number {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 18px;
  opacity: 0.9;
}

.service-process {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
}

.process-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.process-step {
  text-align: center;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(35deg, #52cfc9 0%, #20b2aa 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 auto 16px;
}

.step-content h4 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.step-content p {
  font-size: 14px;
  color: #666;
}

.process-arrow {
  color: #20b2aa;
  font-size: 50px;
  margin-top: -20px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .statistics {
    flex-direction: column;
    gap: 30px;
    padding: 40px 20px;
  }

  .process-steps {
    flex-direction: column;
    gap: 30px;
  }

  .process-arrow {
    transform: rotate(90deg);
    margin: 0;
  }

  .section-title {
    font-size: 28px;
    margin-bottom: 30px;
  }
}

/* 感动瞬间样式 */
.touching-moments {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
  text-align: center;

  .section-title {
    font-size: 32px;
    color: #2c3e50;
    margin-bottom: 16px;
    font-weight: bold;
  }

  .section-desc {
    font-size: 18px;
    color: #5a6d7e;
    margin-bottom: 40px;
  }

  .moments-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    margin-top: 40px;
  }

  .moment-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);

      .moment-image img {
        transform: scale(1.05);
      }
    }
  }

  .moment-image {
    width: 100%;
    height: 250px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  .moment-content {
    padding: 24px;
    text-align: left;

    h3 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 8px;
      font-weight: bold;
    }

    .moment-date {
      font-size: 14px;
      color: #8492a6;
      margin-bottom: 12px;
    }

    .moment-text {
      font-size: 16px;
      color: #5a6d7e;
      line-height: 1.6;
    }
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .touching-moments {
    .moments-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .moment-card {
      .moment-image {
        height: 200px;
      }

      .moment-content {
        padding: 20px;

        h3 {
          font-size: 20px;
        }

        .moment-text {
          font-size: 14px;
        }
      }
    }
  }
}
</style>