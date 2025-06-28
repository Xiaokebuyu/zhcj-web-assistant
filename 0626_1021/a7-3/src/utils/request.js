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
        // ✅ 修复：优先获取ada_token，然后检查satoken
        let token = Cookies.get("ada_token");
        if (!token) {
            token = Cookies.get("satoken");
        }

        console.log("request.js 获取到 token:", token || "<空>");

        if (token) {
            // ✅ 关键修复：使用ada_token作为header名称，与后端Sa-Token配置一致
            config.headers["ada_token"] = token;
            
            // 保留satoken头以兼容性（如果有其他地方需要）
            config.headers["satoken"] = token;
            
            // 保留Authorization头以兼容
            config.headers.Authorization = token;
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