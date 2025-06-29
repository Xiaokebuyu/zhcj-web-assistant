<template>
  <div class="over" v-if="show">
    <!--登录版块-->
    <div class="login" v-if="showlogin">
      <span class="close" @click="close()">&times;</span>
      <h2 style="margin-top: 30px">登录</h2>
      <form>
        <input type="text" v-model="username" placeholder="  用户名">
        <input type="password" v-model="userpassword" placeholder="  密码">
        <button type="submit">登录</button>
      </form>
      <p>没有账户？<a href="#" @click.prevent="toregs" class="change">点击注册</a></p>
    </div>
    <!--    注册版块-->
    <div class="login" style="height: 360px" v-else>
      <span class="close" @click="close()">&times;</span>
      <h2 style="margin-top: 20px">注册</h2>
      <form>
        <input type="text" v-model="username" placeholder="  请输入用户名">
        <input type="text" v-model="username" placeholder="  请输入邮箱">
        <input type="password" v-model="password" placeholder="  请输入密码">
        <input type="password" v-model="password" placeholder="  请确认密码">
        <button class="login_button" type="submit" @click="submit()">注册</button>
      </form>
      <p>已经注册？<a href="#" @click.prevent="tologin" class="change">立即登录</a></p>
    </div>
  </div>
</template>

<script>
export default {
  name:'LoginReg',
  data(){
    return{
      username:'',
      userpassword:'',
      showlogin:false
    }
  },
  props:{
    show:Boolean
  },
  methods:{
    close(){
      this.$emit('close')
    },
    toregs(){
      this.showlogin=false
    },
    tologin(){
      this.showlogin=true
    }
  }
}
</script>

<style>
.over{
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
}
.login{
  width: 400px;
  height: 300px;
  background-color: white;
  border-radius: 10px;
  position: relative;
}
.close{
  position: absolute;
  top: 5px;
  right: 20px;
  font-size: 30px;
  cursor: pointer;
}
.login form{

}
.login input{
  display: block;
  margin: auto;
  margin-bottom: 10px;
  width: 260px;
  height: 30px;
}
.login button{
  width: 260px;
  height: 30px;
  background-color: #83c44e;
  color: white;
  border: none;
  cursor: pointer;
}
.login button:hover{
  background-color: #66bb6a;
}
.change{
  font-size: 14px;
  color: gray;
}
.change hover{
  color: red;
}
</style>