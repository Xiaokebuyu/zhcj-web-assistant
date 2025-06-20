import axios from "axios";
import Cookies from "js-cookie";

// 创建 Axios 实例
const request = axios.create({
    baseURL: "http://localhost:81", // 后端 API 基础地址
    withCredentials: true, // 允许跨域请求携带 Cookie
});

// 请求拦截器：自动在 headers 中添加 Token
request.interceptors.request.use(
    (config) => {
        const token = Cookies.get("ada_token"); // 从 Cookie 获取 token
        console.log(token,"request.js的token");
        if (token) {
            config.headers.Authorization = token; // 添加 Authorization 头
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器：统一处理错误（可选）
request.interceptors.response.use(
    (response) => response.data, // 直接返回 data，简化调用
    (error) => {
        if (error.response?.status === 401) {
            // Token 过期或无效，跳转登录页
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default request; // 导出配置后的实例