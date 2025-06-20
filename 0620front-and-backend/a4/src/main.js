import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import router from "@/router/index";
import store from "@/store/index";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css'
// // 设置全局配置（可选）
axios.defaults.baseURL = 'http://localhost:81';

// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;

// 挂载到 Vue 原型上（Vue 2）
Vue.prototype.$http = axios;


Vue.config.productionTip = false
Vue.use(VueRouter);
Vue.use(ElementUI);
new Vue({
  render: h => h(App),

  router:router,
  store:store
}).$mount('#app')
