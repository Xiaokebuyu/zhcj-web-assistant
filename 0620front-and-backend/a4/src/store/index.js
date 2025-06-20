import vuex from 'vuex'
import Vue from "vue";
Vue.use(vuex)
export default new vuex.Store({
    state: {
        currentUser: {
            username: "志愿者",
            points: parseInt(sessionStorage.getItem('userPoints')) || 0,
            exchangeHistory: []
        },
        shopItems: {
            physical: [
                { id: 1, name: "志愿者定制保温杯", points: 500, image: "/images/cup.png", stock: 20, description: "高品质不锈钢保温杯，印有志愿者专属logo，保温保冷效果出色" },
                { id: 2, name: "公益纪念T恤", points: 800, image: "/images/tshirt.png", stock: 15, description: "纯棉材质，舒适透气，设计独特，展现志愿者风采" },
                { id: 3, name: "便携充电宝", points: 1200, image: "/images/powerbank.png", stock: 10, description: "10000mAh大容量，支持快充，小巧便携，出行必备" },
                { id: 4, name: "精装笔记本套装", points: 300, image: "/images/notebook.png", stock: 30, description: "高品质笔记本+钢笔套装，记录志愿服务的点点滴滴" },
                { id: 5, name: "多功能背包", points: 1500, image: "/images/backpack.png", stock: 8, description: "防水耐磨材质，多隔层设计，适合各种志愿服务场景" }
            ],
            digital: [
                { id: 101, name: "视频平台月会员", points: 400, image: "/images/video.png", stock: 999, description: "热门视频平台VIP会员，畅享海量高清影视内容" },
                { id: 102, name: "音乐平台季卡", points: 600, image: "/images/music.png", stock: 999, description: "高品质音乐平台会员，无损音质，千万曲库" },
                { id: 103, name: "电子书兑换券", points: 200, image: "/images/ebook.png", stock: 999, description: "可在合作平台兑换任意一本电子书" },
                { id: 104, name: "在线课程优惠券", points: 300, image: "/images/course.png", stock: 999, description: "价值50元的在线学习平台优惠券" }
            ],
            donation: [
                { id: 201, name: "为听障儿童捐赠助听器", points: 1000, image: "/images/hearing.png", stock: 999, description: "您的积分将转化为助听器捐赠给需要的听障儿童" },
                { id: 202, name: "为视障人士捐赠盲杖", points: 800, image: "/images/cane.png", stock: 999, description: "帮助视障人士获得更好的出行辅助工具" },
                { id: 203, name: "支持无障碍设施建设", points: 1500, image: "/images/facility.png", stock: 999, description: "助力城市无障碍设施建设，让爱无碍" },
                { id: 204, name: "资助残障儿童教育", points: 1200, image: "/images/education.png", stock: 999, description: "帮助残障儿童获得更好的教育机会" }
            ]
        }
    },
    mutations: {
        updatePoints(state, points) {
            state.currentUser.points = points;
            sessionStorage.setItem('userPoints', points);
        },
        addExchangeHistory(state, item) {
            state.currentUser.exchangeHistory.unshift(item);
        },
        updateProductStock(state, { category, productId }) {
            const product = state.shopItems[category].find(p => p.id === productId);
            if (product) {
                product.stock--;
            }
        }
    },
    actions: {
        exchangeProduct({ commit, state }, product) {
            if (state.currentUser.points < product.points || product.stock <= 0) {
                return false;
            }

            // 更新积分
            commit('updatePoints', state.currentUser.points - product.points);

            // 添加兑换记录
            commit('addExchangeHistory', {
                id: product.id,
                name: product.name,
                points: product.points,
                date: new Date().toISOString().split('T')[0]
            });

            // 更新库存
            const category = product.id < 100 ? 'physical' :
                product.id < 200 ? 'digital' : 'donation';
            commit('updateProductStock', { category, productId: product.id });

            return true;
        }
    },
    getters: {
        allProducts: state => {
            return [
                ...state.shopItems.physical,
                ...state.shopItems.digital,
                ...state.shopItems.donation
            ].sort((a, b) => a.points - b.points);
        },
        getProductsByCategory: state => category => {
            return category === 'all'
                ? [
                    ...state.shopItems.physical,
                    ...state.shopItems.digital,
                    ...state.shopItems.donation
                ].sort((a, b) => a.points - b.points)
                : state.shopItems[category].sort((a, b) => a.points - b.points);
        }
    }
})