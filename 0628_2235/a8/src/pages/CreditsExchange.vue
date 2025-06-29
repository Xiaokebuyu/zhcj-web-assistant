<template>
  <div class="shop-container">
    <!-- 商城头部 -->
    <div class="shop-header">
      <div class="shop-header-content">
        <h2>积分商城</h2>
        <p>感谢您的无私奉献，用积分兑换心仪好礼</p>
      </div>
      <div class="points-display">
        <span class="icon">⭐</span>
        <span>当前积分：<span>{{ currentUser.points }}</span></span>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="shop-nav">
      <button
          v-for="category in categories"
          :key="category.value"
          :class="{ active: currentCategory === category.value }"
          @click="currentCategory = category.value"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- 商品列表 -->
    <div class="shop-grid">
      <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
      >
        <div v-if="product.stock < 10" class="product-badge">
          仅剩 {{ product.stock }} 件
        </div>
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
        </div>
        <div class="product-info">
          <div class="product-title">{{ product.name }}</div>
          <div class="product-description">{{ product.description }}</div>
          <div class="product-footer">
            <div>
              <div class="product-points">
                <span>⭐</span>
                <span>{{ product.points }}</span>
              </div>
              <div class="product-stock">库存: {{ product.stock }}</div>
            </div>
            <button
                class="exchange-btn"
                :disabled="!canExchange(product)"
                @click="showExchangeModal(product)"
            >
              <i class="fas fa-shopping-cart"></i>
              {{ getButtonText(product) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 兑换记录 -->
    <div class="history-section">
      <h3><i class="fas fa-history"></i> 兑换记录</h3>
      <div class="history-list">
        <div v-if="!currentUser.exchangeHistory || currentUser.exchangeHistory.length === 0" class="empty-history">
          <p>暂无兑换记录</p>
          <p>快去兑换您的第一份礼物吧！</p>
        </div>

        <div v-else class="history-items">
          <div v-for="record in currentUser.exchangeHistory" :key="record.id" class="history-item">
            <div class="history-product">{{ record.product }}</div>
            <div class="history-details">
              <span class="history-points">-{{ record.points }}⭐</span>
              <span class="history-date">{{ record.date }}</span>
            </div>
            <div class="history-status">{{ record.status }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 兑换弹窗 -->
    <div v-if="selectedProduct" class="exchange-modal" @click.self="selectedProduct = null">
      <div class="modal-content">
        <span class="modal-close" @click="selectedProduct = null">&times;</span>
        <div class="modal-header">
          <h3>确认兑换</h3>
          <p>请确认您的兑换信息</p>
        </div>
        <div class="modal-body">
          <div class="modal-product">
            <div class="product-image">
              <img :src="selectedProduct.image" :alt="selectedProduct.name" />
            </div>
            <div class="modal-product-info">
              <div class="modal-product-name">{{ selectedProduct.name }}</div>
              <div class="modal-product-description">{{ selectedProduct.description }}</div>
              <div class="modal-product-points">所需积分: ⭐{{ selectedProduct.points }}</div>
            </div>
          </div>
          <div v-if="getRemainingPoints < 0" class="points-warning">
            积分不足，无法兑换！
          </div>
        </div>
        <div class="modal-footer">
          <div class="points-balance">
            兑换后剩余积分：<span>{{ getRemainingPoints }}</span>
          </div>
          <button
              class="confirm-exchange"
              :disabled="getRemainingPoints < 0"
              @click="handleExchange"
          >
            <i class="fas fa-check-circle"></i> 确认兑换
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapState, mapActions } from 'vuex'
import request from "@/utils/request";

export default {
  name: 'CreditsExchange',

  data() {
    return {
      currentCategory: 'all',
      selectedProduct: null,
      categories: [
        { value: 'all', label: '全部商品' },
        { value: 'physical', label: '实物商品' },
        { value: 'digital', label: '数字商品' },
        { value: 'donation', label: '公益捐赠' }
      ],
      isLoading: false,
      currentUser: {
        points: 0, // 初始化为0，等接口返回后更新
        exchangeHistory: []
      },
      allProducts: [],
      shopItems: {
        physical: [],
        digital: [],
        donation: []
      }
    }
  },

  computed: {
    // ...mapState(['currentUser']),
    hasExchangeHistory() {
      return this.currentUser.exchangeHistory && this.currentUser.exchangeHistory.length > 0;
    },
    filteredProducts() {
      const items = this.shopItems;
      if (this.currentCategory === 'all') {
        return [
          ...items.physical,
          ...items.digital,
          ...items.donation
        ].sort((a, b) => a.points - b.points);
      }
      return items[this.currentCategory].sort((a, b) => a.points - b.points);
    },

    getRemainingPoints() {
      if (!this.selectedProduct) return this.currentUser.points;
      return this.currentUser.points - this.selectedProduct.points;
    }
  },

  methods: {
    // 将后端的sgoodClasses映射为前端的category
    mapCategory(sgoodClasses) {
      const map = {
        0: 'physical', // 实物商品
        1: 'digital',  // 数字商品
        2: 'donation'  // 公益捐赠
      };
      return map[sgoodClasses] || 'physical'; // 默认返回实物商品
    },
    async fetchExchangeHistory() {
      try {
        const response = await request.get('http://localhost:81/goods/exchange/list');
        if (response && response.code === 200) {
          this.currentUser.exchangeHistory = response.data.map(item => ({
            id: item.exId,
            product: item.exGoodName,
            points: item.exScore,
            date: new Date(item.exTime).toLocaleString(),
            status: '已完成' // 可以根据需要添加状态字段
          }));
        } else {
          console.error('获取兑换记录失败:', response?.message);
          this.$message.error(response?.message || '获取兑换记录失败');
        }
      } catch (error) {
        console.error('获取兑换记录异常:', error);
        this.$message.error('获取兑换记录异常');
      }
    },
    async fetchCurrentUser() {
      try {
        const response = await request.get('http://localhost:81/user/current');
        if (response && response.code === 200) {
          const userData = response.data;

          this.currentUser = {
            ...userData,
            points: userData.uscore || 0,
            exchangeHistory: [] // 确保这里设置了
          };
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        throw error;
      }
    },

    async fetchGoodsList() {
      try {
        this.isLoading = true;
        const response = await request.get('http://localhost:81/goods/list');
        console.log(response,'获取到的当前商品信息');
        if (response && response.code === 200) {
          // 如果没有，需要在这里添加分类逻辑
          this.allProducts = response.data.map(item => ({
            id: item.sgoodId,
            name: item.sgoodName,
            description: item.sgoodInfo,
            points: item.sgoodScore,
            stock: item.sgoodStock,
            image: item.sgoodImg, // 默认图片
            category: this.mapCategory(item.sgoodClasses)
          }));
          // 同时按照分类存储到shopItems中（如果需要）
          this.shopItems = {
            physical: this.allProducts.filter(p => p.category === 'physical'),
            digital: this.allProducts.filter(p => p.category === 'digital'),
            donation: this.allProducts.filter(p => p.category === 'donation')
          };
          console.log(this.allProducts,'处理后的商品列表');
          console.log(this.shopItems,'按分类存储的商品列表');
         // console.log(this.allProducts,'前端获取到的商品列表');
        } else {
          console.error('获取商品列表失败:', response?.message);
          this.$message.error(response?.message || '获取商品列表失败');
        }
      } catch (error) {
        console.error('获取商品列表异常:', error);
        this.$message.error('获取商品列表异常');
      } finally {
        this.isLoading = false;
      }
    },
    canExchange(product) {
      return this.currentUser.points >= product.points && product.stock > 0;
    },

    getButtonText(product) {
      if (product.stock <= 0) return '已售罄';
      if (this.currentUser.points < product.points) return '积分不足';
      return '兑换';
    },

    showExchangeModal(product) {
      this.selectedProduct = product;
    },

    async handleExchange() {
      if (!this.selectedProduct) return;

      // 再次检查库存（防止在点击兑换时库存已被其他人兑换完）
      if (this.selectedProduct.stock <= 0) {
        this.$message.error('该商品库存不足');
        this.selectedProduct = null;
        await this.fetchGoodsList(); // 刷新商品列表
        return;
      }

      try {
        const response = await request.post(`http://localhost:81/goods/exchange/${this.selectedProduct.id}`);

        if (response && response.code === 200) {
          this.currentUser.points -= this.selectedProduct.points;

          // 更新商品库存
          this.allProducts = this.allProducts.map(item => {
            if (item.id === this.selectedProduct.id) {
              return {
                ...item,
                stock: item.stock - 1
              };
            }
            return item;
          });

          // 更新分类商品列表
          this.shopItems = {
            physical: this.allProducts.filter(p => p.category === 'physical'),
            digital: this.allProducts.filter(p => p.category === 'digital'),
            donation: this.allProducts.filter(p => p.category === 'donation')
          };

          this.$message.success(`兑换成功！您已成功兑换【${this.selectedProduct.name}】`);
          this.selectedProduct = null;

          // 兑换成功后刷新兑换记录
          await this.fetchExchangeHistory();
        } else {
          this.$message.error(response?.message || '兑换失败');
        }
      } catch (error) {
        console.error('兑换失败:', error);
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '兑换失败');
        } else {
          this.$message.error('兑换失败，请稍后重试');
        }
      }
    }
  },

  async created() {
    if (!localStorage.getItem('userPhone')) {
      this.$router.replace('/LoginPage');
      return;
    }

    try {
      this.isLoading = true;
      await this.fetchCurrentUser();
      await this.fetchGoodsList();
      await this.fetchExchangeHistory(); // 新增调用
    } catch (error) {
      console.error('初始化失败:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
</script>

<style scoped>
.history-section {
  margin-top: 40px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.history-items {
  margin-top: 15px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.history-product {
  font-weight: 500;
  flex: 2;
}

.history-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  color: #666;
}

.history-points {
  color: #f56c6c;
  font-weight: bold;
}

.history-date {
  color: #909399;
}

.history-status {
  flex: 0.5;
  text-align: right;
  color: #67c23a;
}

.empty-history {
  text-align: center;
  padding: 30px 0;
  color: #909399;
}

.empty-history p:first-child {
  font-size: 16px;
  margin-bottom: 10px;
}
.shop-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.shop-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  border-radius: 20px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.shop-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.shop-header-content h2 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-weight: 700;
}

.shop-header-content p {
  font-size: 1.2rem;
  opacity: 0.95;
  max-width: 600px;
  line-height: 1.6;
}

.points-display {
  font-size: 1.8rem;
  font-weight: bold;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  padding: 20px 30px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.2);
}

.points-display .icon {
  font-size: 2.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.shop-nav {
  display: flex;
  margin-bottom: 40px;
  background: white;
  border-radius: 15px;
  padding: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.shop-nav button {
  background: none;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-radius: 10px;
  font-weight: 500;
}

.shop-nav button:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.shop-nav button.active {
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

/* 商品卡片样式 */
.product-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  border: 1px solid rgba(0,0,0,0.05);
}

.product-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.product-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.product-image {
  height: 250px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.product-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.product-card:hover .product-image::before {
  transform: translateX(100%);
}
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-size: 1.2em;
}
.product-image img {
  max-width: 85%;
  max-height: 85%;
  object-fit: contain;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.product-info {
  padding: 25px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2c3e50;
  line-height: 1.4;
}

.product-description {
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 20px;
  flex-grow: 1;
  line-height: 1.6;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.product-points {
  font-size: 1.4rem;
  font-weight: bold;
  color: #FF9800;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 1px 1px 2px rgba(255, 152, 0, 0.2);
}

.product-stock {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

.exchange-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  font-size: 1rem;
}

.exchange-btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.exchange-btn:disabled {
  background: linear-gradient(135deg, #adb5bd 0%, #6c757d 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 历史记录样式 */
.history-section {
  background: white;
  border-radius: 20px;
  padding: 35px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.05);
}

.history-section h3 {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f8f9fa;
  color: #2c3e50;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 700;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 60px 0;
  color: #868e96;
  font-size: 1.2rem;
}

.empty-history p:first-child {
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: #6c757d;
}

/* 弹窗样式 */
.exchange-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 550px;
  padding: 40px;
  position: relative;
  animation: modalAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
}

@keyframes modalAppear {
  from { 
    opacity: 0; 
    transform: translateY(-50px) scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

.modal-close {
  position: absolute;
  top: 25px;
  right: 25px;
  font-size: 2rem;
  cursor: pointer;
  color: #868e96;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  color: #495057;
  background: #f8f9fa;
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.modal-header h3 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 2rem;
  font-weight: 700;
}

.modal-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.modal-body {
  margin-bottom: 35px;
}

.modal-product {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 25px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  border: 1px solid #e9ecef;
}

.modal-product .product-image {
  width: 120px;
  height: 120px;
  margin-right: 25px;
  border-radius: 10px;
}

.modal-product-info {
  flex-grow: 1;
}

.modal-product-name {
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 1.4rem;
  color: #2c3e50;
}

.modal-product-description {
  color: #6c757d;
  margin-bottom: 15px;
  line-height: 1.6;
}

.modal-product-points {
  color: #FF9800;
  font-weight: bold;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-warning {
  color: #f44336;
  font-weight: bold;
  text-align: center;
  margin: 25px 0;
  padding: 20px;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-radius: 12px;
  border: 1px solid #ffcdd2;
  font-size: 1.1rem;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 25px;
  border-top: 2px solid #f8f9fa;
}

.points-balance {
  font-size: 1.2rem;
  color: #495057;
}

.points-balance span {
  font-weight: bold;
  color: #FF9800;
  font-size: 1.4rem;
}

.confirm-exchange {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 16px 36px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
}

.confirm-exchange:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.confirm-exchange:disabled {
  background: linear-gradient(135deg, #adb5bd 0%, #6c757d 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .shop-header {
    flex-direction: column;
    text-align: center;
    gap: 30px;
    padding: 30px 25px;
  }

  .points-display {
    margin-top: 0;
  }

  .shop-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .shop-container {
    margin: 20px auto;
    padding: 0 15px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 25px;
    text-align: center;
  }
  
  .modal-product {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-product .product-image {
    margin-right: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .product-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .shop-nav {
    padding: 5px;
  }
  
  .shop-nav button {
    padding: 12px 20px;
    font-size: 1rem;
  }
}
</style>