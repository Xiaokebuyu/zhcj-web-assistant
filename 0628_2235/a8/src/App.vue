<template>
  <div id="app">

    <!--导航栏-->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-left">
          <router-link to="/HomePage" class="brand">
            <i class="iconfont icon-huzhu"></i>
            <span>智慧残健 —— 用指尖搭建桥梁</span>
          </router-link>
        </div>

        <div class="nav-center">
          <div class="nav-links">
            <router-link to="/HomePage" class="nav-link">首页</router-link>
            <template v-if="isLoggedIn">
              <a href="#" @click="handlePlatformClick" class="nav-link">助残平台</a>
              <router-link v-if="isLoggedIn && userType === 'volunteer'" to="/CreditsExchange" class="nav-link">积分商城</router-link>
            </template>
            <router-link to="/AISystem" class="nav-link">AI助手</router-link>
            <router-link to="/LearnCenter" class="nav-link">知识科普</router-link>
            <router-link to="/HelpForum" class="nav-link">论坛</router-link>
            <router-link to="/InformationFeedback" class="nav-link">建议反馈</router-link>
          </div>
        </div>

        <div class="nav-right">
          <router-link to="/PersonalCenter" class="nav-link">
            <i class="fas fa-user"></i>
            个人中心
          </router-link>
          <router-link
            v-if="!isLoggedIn"
            to="/LoginPage"
            class="login-btn"
          >
            登录
          </router-link>
          <a
            v-else
            href="#"
            class="login-btn"
            @click.prevent="logout"
          >
            退出
          </a>
          <button class="mobile-menu-btn" @click="toggleMobileMenu">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </nav>

    <div class="mobile-menu" :class="{ active: isMobileMenuOpen }">
      <!-- 移动端品牌 -->
      <div class="mobile-brand">
        <router-link to="/HomePage" class="mobile-brand-link">
          <i class="iconfont icon-huzhu"></i>
          <span>智慧残健 —— 用指尖搭建桥梁</span>
        </router-link>
      </div>
      
      <!-- 移动端主要导航 -->
      <div class="mobile-nav-section">
        <router-link to="/HomePage" class="mobile-nav-link">首页</router-link>
        <template v-if="isLoggedIn">
          <a href="#" @click="handlePlatformClick" class="mobile-nav-link">助残平台</a>
          <router-link v-if="isLoggedIn && userType === 'volunteer'" to="/CreditsExchange" class="mobile-nav-link">积分商城</router-link>
        </template>
        <router-link to="/AISystem" class="mobile-nav-link">AI助残</router-link>
        <router-link to="/LearnCenter" class="mobile-nav-link">学习中心</router-link>
        <router-link to="/HelpForum" class="mobile-nav-link">互助论坛</router-link>
        <router-link to="/InformationFeedback" class="mobile-nav-link">建议与反馈</router-link>
      </div>
      
      <!-- 移动端个人功能 -->
      <div class="mobile-personal-section">
        <router-link to="/PersonalCenter" class="mobile-nav-link">
          <i class="fas fa-user"></i>
          个人中心
        </router-link>
        <router-link to="/LoginPage" class="mobile-nav-link">
          {{ isLoggedIn ? '退出' : '登录' }}
        </router-link>
      </div>
    </div>

    <div style="padding-top: 70px;">
      <RouterView></RouterView>
    </div>
    <!--底部网站介绍-->
    <div class="footer">
      <footer>
        <div class="footer-container">
          <div class="footer-logo">
            <h3>助残公益</h3>
            <p>致力于为每一位用户提供全方位支持与服务的公益平台</p>
            <span>
            --- 让爱无障碍 <i class="iconfont icon-aixin" style="color: red"></i> ---
          </span>
            <hr>
            <p class="copyright">© 2025 助残公益组织<br>
              <span >备案号：京ICP备12345678号</span></p>
          </div>

          <div class="footer-logo">
            <h3>快速链接</h3>
            <ul>
              <li><a href="#">首页</a></li>
              <li><a href="#">关于我们</a></li>
              <li><a href="#">服务项目</a></li>
              <li><a href="#">志愿者招募</a></li>
            </ul>
          </div>

          <div class="footer-logo">
            <h3>联系我们</h3>
            <ul>
              <li><i class="iconfont icon-dianhua"></i> 123-456789</li>
              <li><i class="iconfont icon-youxiang"></i> contact@example.com</li>
              <li><i class="iconfont icon-dingwei1"></i> 安徽省淮北市杜集区青年路8号</li>
            </ul>
          </div>

          <div class="footer-logo">
            <h3>关注我们</h3>
            <div style="width: 100%; margin-bottom: 20px;">
              <i class="iconfont icon-weixin" style="font-size: 25px;"></i>
              <i class="iconfont icon-QQ" style="font-size: 25px;margin-left: 20px"></i>
              <i class="iconfont icon-xinlangweibo" style="font-size: 25px;margin-left: 20px"></i>
            </div>
            <p>
              <i class="iconfont icon-dark-full" style="padding-right: 10px"></i>
              切换到浅色模式</p>
          </div>
        </div>
      </footer>
    </div>

  </div>
</template>

<script>

import "@/assets/css/App.css"
import "@/assets/icon/App_icon/iconfont.css"
import "@/assets/JS/App"
// import LoginAccount from "@/components/LoginAccount.vue";

export default {
  name: 'App',
  data(){
    return{
      showcart:false,
      isLoggedIn: false,
      isMobileMenuOpen: false,
      userType: localStorage.getItem('userType') || ''
    }
  },
  components:{
    // LoginAccount
  },
  methods:{
    handlePlatformClick() {
      const userType = localStorage.getItem('userType');
      const currentRoute = this.$route.path;
      
      if (userType === 'volunteer' && currentRoute !== '/VolunteerPlatform') {
        this.$router.push('/VolunteerPlatform');
      } else if (userType === 'disabled' && currentRoute !== '/DisablePlatform') {
        this.$router.push('/DisablePlatform');
      }
    },
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('userPhone');
      this.userType = localStorage.getItem('userType') || '';
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    logout() {
      // 添加确认弹窗
      if (confirm('确定要退出吗？')) {
        localStorage.clear();
        this.isLoggedIn = false;
        this.userType = '';
        window.dispatchEvent(new Event('storage'));
        this.$router.replace('/LoginPage');
      }
    }
  },
  created() {
    this.checkLoginStatus();
    // 监听登录状态变化
    window.addEventListener('storage', this.checkLoginStatus);
  },
  beforeDestroy() {
    window.removeEventListener('storage', this.checkLoginStatus);
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
