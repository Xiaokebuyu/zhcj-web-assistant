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
        // ✅ 认证Token 兼容处理：先取 satoken，再回退 ada_token
        let token = Cookies.get("satoken");
        if (!token) {
            token = Cookies.get("ada_token");
        }

        console.log("request.js 获取到 token:", token || "<空>");

        if (token) {
            // 后端（Sa-Token）推荐使用自定义头: satoken
            config.headers["satoken"] = token;
            // 同时保留 Authorization 头以兼容旧接口
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