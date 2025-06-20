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
        <div v-if="currentUser.exchangeHistory.length === 0" class="empty-history">
          <p>暂无兑换记录</p>
          <p>快去兑换您的第一份礼物吧！</p>
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
import { mapState, mapActions } from 'vuex'

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
      ]
    }
  },

  computed: {
    ...mapState(['currentUser']),

    filteredProducts() {
      const items = this.$store.state.shopItems;
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
    ...mapActions(['exchangeProduct']),

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

      const success = await this.exchangeProduct(this.selectedProduct);

      if (success) {
        alert(`兑换成功！您已成功兑换【${this.selectedProduct.name}】`);
        this.selectedProduct = null;
      } else {
        alert('兑换失败！积分不足或库存不足');
      }
    }
  }
}
</script>

<style scoped>
.shop-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.shop-header {
  background: linear-gradient(135deg, #4CAF50, #2196F3);
  color: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.shop-header-content h2 {
  font-size: 2.2rem;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
}

.shop-header-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
}

.points-display {
  font-size: 1.7rem;
  font-weight: bold;
  background: rgba(255,255,255,0.2);
  padding: 15px 25px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.points-display .icon {
  font-size: 2rem;
}

.shop-nav {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 5px;
  overflow-x: auto;
}

.shop-nav button {
  background: none;
  border: none;
  padding: 12px 25px;
  font-size: 1.1rem;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  white-space: nowrap;
}

.shop-nav button.active {
  color: #2196F3;
  font-weight: bold;
}

.shop-nav button.active::after {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #2196F3;
  border-radius: 3px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

/* 商品卡片样式 */
.product-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  transition: transform 0.4s, box-shadow 0.4s;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  border: 1px solid #e9ecef;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
}

.product-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff5722;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  z-index: 2;
}

.product-image {
  height: 220px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #eee;
}

.product-image img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  transition: transform 0.4s;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.product-info {
  padding: 22px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: #2c3e50;
}

.product-description {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 18px;
  flex-grow: 1;
  line-height: 1.6;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.product-points {
  font-size: 1.35rem;
  font-weight: bold;
  color: #FF9800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-stock {
  font-size: 0.9rem;
  color: #6c757d;
}

.exchange-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.exchange-btn:hover {
  background: #3d8b40;
}

.exchange-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

/* 历史记录样式 */
.history-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
}

.history-section h3 {
  margin-bottom: 25px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 50px 0;
  color: #868e96;
  font-size: 1.1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.history-info {
  flex-grow: 1;
}

.history-name {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.history-date {
  color: #868e96;
  font-size: 0.9rem;
}

.history-points {
  font-weight: bold;
  color: #FF9800;
  min-width: 100px;
  text-align: right;
  font-size: 1.2rem;
}

/* 弹窗样式 */
.exchange-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.75);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  padding: 35px;
  position: relative;
  animation: modalAppear 0.4s ease-out;
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
}

@keyframes modalAppear {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 1.8rem;
  cursor: pointer;
  color: #868e96;
  transition: color 0.3s;
}

.modal-close:hover {
  color: #495057;
}

.modal-header {
  text-align: center;
  margin-bottom: 25px;
}

.modal-header h3 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 1.8rem;
}

.modal-body {
  margin-bottom: 30px;
}

.modal-product {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.modal-product .product-image {
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.modal-product-info {
  flex-grow: 1;
}

.modal-product-name {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1.3rem;
}

.modal-product-points {
  color: #FF9800;
  font-weight: bold;
  font-size: 1.3rem;
}

.points-warning {
  color: #f44336;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background: #ffebee;
  border-radius: 8px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-balance {
  font-size: 1.1rem;
  color: #495057;
}

.points-balance span {
  font-weight: bold;
  color: #FF9800;
}

.confirm-exchange {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.confirm-exchange:hover {
  background: #3d8b40;
}

.confirm-exchange:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .shop-header {
    flex-direction: column;
    text-align: center;
    gap: 25px;
  }

  .points-display {
    margin-top: 15px;
  }

  .shop-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .modal-footer {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .product-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>