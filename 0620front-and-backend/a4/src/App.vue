<template>
  <div id="app">

    <!--导航栏-->
    <nav>
      <div class="left">
        <a href="#"><i class="iconfont icon-huzhu" style="padding-right: 15px;" ></i>智慧残健 —— 用指尖搭建桥梁</a>
      </div>

      <div class="right">
        <a href="#"><router-link to="/HomePage">首页</router-link></a>
        <a href="#"><router-link to="/LearnCenter">学习中心</router-link></a>
        <a href="#"><router-link to="/HelpForum">互助论坛</router-link></a>
        <a href="#" @click="handlePlatformClick">助残平台</a>
        <a href="#"><router-link to="/AISystem">AI助残</router-link></a>
        <a href="#"><router-link to="/PersonalCenter">个人中心</router-link></a>
        <a href="#"><router-link to="/InformationFeedback">建议与反馈</router-link></a>
        <a href="#"><router-link to="/CreditsExchange">积分商城</router-link></a>
        <a href="#"><router-link to="/LoginPage">登录</router-link></a>
      </div>
    </nav>
    <div style="padding-top: 70px;">
      <RouterView>

      </RouterView>
    </div>
    <FeedbackHelper></FeedbackHelper>
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
import FeedbackHelper from "@/components/FeedbackHelper.vue";
// import LoginAccount from "@/components/LoginAccount.vue";

export default {
  name: 'App',
  data(){
    return{
      showcart:false,
    }
  },
  components:{
    // LoginAccount
    FeedbackHelper,
  },
  methods:{
    handlePlatformClick() {
      const userType = localStorage.getItem('userType');
      if (userType === 'volunteer') {
        this.$router.push('/VolunteerPlatform');
      } else if (userType === 'disabled') {
        this.$router.push('/DisablePlatform');
      } else {
        this.$router.push('/LoginPage');
      }
    }
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
