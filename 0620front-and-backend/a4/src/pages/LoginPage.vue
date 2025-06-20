<template>
  <div class="login-page">
    <div class="login-container">
      <div class="tab-group">
        <button :class="{active: isLogin}" @click="isLogin = true">登录</button>
        <button :class="{active: !isLogin}" @click="isLogin = false">注册</button>
      </div>
      <transition name="fade-slide" mode="out-in">
        <div v-if="isLogin" key="login" class="form-area">
          <div class="login-type-group">
            <label>
              <input type="radio" value="account" v-model="loginType" @click="loginChoose=0"> 账号登录
            </label>
            <label>
              <input type="radio" value="phone" v-model="loginType" @click="loginChoose=1"> 手机号登录
            </label>
          </div>
          <form @submit.prevent="handleLogin">
            <div class="form-group" v-if="loginType === 'account'">
              <label>账号</label>
              <input v-model="loginForm.account" placeholder="请输入账号" required>
            </div>
            <div class="form-group" v-if="loginType === 'phone'">
              <label>手机号</label>
              <input v-model="loginForm.phone" placeholder="请输入手机号" required>
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" v-model="loginForm.password" placeholder="请输入密码" required>
            </div>
            <button class="submit-btn" type="submit">登录</button>
          </form>
        </div>
        <div v-else key="register" class="form-area">
          <div class="register-type-group">
            <label>
              <input type="radio" :value="1" v-model="registerType"> 志愿者注册
            </label>
            <label>
              <input type="radio" :value="0" v-model="registerType"> 求助者注册
            </label>
          </div>
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label>用户名</label>
              <input v-model="registerForm.name" placeholder="请输入用户名" required>
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input v-model="registerForm.phone" placeholder="请输入手机号" required>
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" v-model="registerForm.password" placeholder="请输入密码" required>
            </div>
            <button class="submit-btn" type="submit">注册</button>
          </form>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'LoginPage',
  data() {
    return {
      isLogin: true,
      loginType: 'account',
      loginChoose:0,
      registerType: 1,
      loginForm: {
        account: '',
        phone: '',
        password: ''
      },
      registerForm: {
        name: '',
        phone: '',
        password: ''
      }
    }
  },
  methods: {
    handleLogin() {
      // 1. 表单验证
      if (this.loginType === 'account') {
        if (!this.loginForm.account || !this.loginForm.password) {
          alert('请输入账号和密码');
          return;
        }
      } else {
        if (!this.loginForm.phone || !this.loginForm.password) {
          alert('请输入手机号和密码');
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(this.loginForm.phone)) {
          alert('请输入正确的手机号');
          return;
        }
      }

      // 3. 准备请求数据
      const requestData = this.loginType === 'account'
          ? { name: this.loginForm.account, password: this.loginForm.password ,loginType:this.loginChoose}
          : { phone: this.loginForm.phone, password: this.loginForm.password ,loginType:this.loginChoose};

      // 3. 发送登录请求
      axios.post('http://localhost:81/user/login', requestData,{withCredentials:true})
          .then(response => {
            const result = response.data;
            if (result.code === 200) { // 假设成功返回 code=1
              const user = result.data; // 后端返回的 User 对象
              console.log('登录响应头',response.headers);
              console.log('当前路径:', window.location.pathname);
              console.log('完整Cookie:', document.cookie);
              console.log('当前 ada_token:', document.cookie.match(/ada_token=([^;]+)/));
              console.log(user);
              // 保存用户信息到 localStorage
              localStorage.setItem('userType', user.utype === 1 ? 'volunteer' : 'disabled');
              localStorage.setItem('userAccount', user.uname);
              localStorage.setItem('userPhone', user.uphone);

              // 通知导航栏刷新
              window.dispatchEvent(new Event('storage'));
              // 跳转到首页
              this.$router.push('/PersonalCenter');
            } else {
              alert(result.message || '登录失败');
            }
          })
          .catch(error => {
            console.error('登录请求失败:', error);
            alert('网络错误，请稍后重试');
          });

    },
    async handleRegister() {
      // 1. 前端表单验证
      if (!this.registerForm.name || !this.registerForm.phone || !this.registerForm.password) {
        alert('请填写完整信息');
        return;
      }
      // 新增：姓名格式验证（只能包含数字、英文和下划线）
      if (!/^[a-zA-Z0-9_]+$/.test(this.registerForm.name)) {
        alert('昵称只能包含数字、字母和下划线');
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        alert('请输入正确的手机号');
        return;
      }
      if (this.registerForm.password.length < 6) {
        alert('密码长度不能少于6位');
        return;
      }

      // 当前端表单验证成功后，执行端口传输操作
      try {
        // 3. 发送注册请求到后端
        const response = await axios.post('http://localhost:81/user/register', {
          name: this.registerForm.name,
          phone: this.registerForm.phone,
          password: this.registerForm.password,
          type: this.registerType // 假设 registerType 是用户类型（如普通用户/管理员）
        });

        // 3. 注册成功后的处理
        if (response.data.success) {
          // 保存用户信息到 localStorage
          localStorage.setItem('userType', this.registerType);
          localStorage.setItem('userAccount', this.registerForm.name);
          localStorage.setItem('userPhone', this.registerForm.phone);

          // 提示用户并跳转首页
          alert('注册成功，已自动登录！');
          window.dispatchEvent(new Event('storage'));
          this.$router.push('/');
        } else {
          // 如果后端返回注册失败（如手机号已存在）
          alert(response.data.message || '注册失败，请重试');
        }

      } catch (error) {
        // 4. 网络请求失败的处理
        console.error('注册请求失败:', error);
        alert('网络错误，请稍后重试');
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-container {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(74,108,247,0.10);
  padding: 64px 72px 56px 72px;
  min-width: 520px;
  max-width: 600px;
  transition: box-shadow 0.3s, padding 0.3s;
}
.tab-group {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.tab-group button {
  flex: 1;
  padding: 12px 0;
  font-size: 18px;
  border: none;
  background: #f0f5ff;
  color: #4a6cf7;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  margin-right: 2px;
  transition: background 0.2s;
}
.tab-group button.active {
  background: #4a6cf7;
  color: #fff;
}
.form-area {
  padding: 16px 0;
}
.form-group {
  margin-bottom: 18px;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: bold;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
.submit-btn {
  width: 100%;
  padding: 12px;
  background: #4a6cf7;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 10px;
}
.login-type-group, .register-type-group {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
  justify-content: center;
}
/* 过渡动画 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.45s cubic-bezier(.4,0,.2,1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>