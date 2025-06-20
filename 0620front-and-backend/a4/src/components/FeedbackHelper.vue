<template>
  <div class="feedback-helper">
    <!-- 浮动按钮 -->
    <div class="feedback-btn" @click="showPanel = true" :class="{active: showPanel}">
      <i class="iconfont icon-feedback"></i>
      <span>反馈</span>
    </div>

    <!-- 反馈面板 -->
    <div class="feedback-panel" v-if="showPanel">
      <div class="panel-header">
        <h3>意见反馈</h3>
        <button class="close-btn" @click="showPanel = false">×</button>
      </div>

      <form class="feedback-form" @submit.prevent="submitFeedback">
        <div class="form-group">
          <label>反馈类型</label>
          <select v-model="feedback.type" required>
            <option value="">请选择反馈类型</option>
            <option value="bug">功能异常</option>
            <option value="suggestion">建议优化</option>
            <option value="complaint">投诉举报</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>反馈内容</label>
          <textarea
              v-model="feedback.content"
              placeholder="请详细描述您的问题或建议..."
              required
              rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label>联系方式（选填）</label>
          <input
              type="text"
              v-model="feedback.contact"
              placeholder="邮箱或手机号，方便我们回复您"
          >
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">提交反馈</button>
          <button type="button" class="cancel-btn" @click="showPanel = false">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeedbackHelper',
  data() {
    return {
      showPanel: false,
      feedback: {
        type: '',
        content: '',
        contact: ''
      }
    }
  },
  methods: {
    submitFeedback() {
      // 这里可以添加实际的提交逻辑
      alert('感谢您的反馈！我们会认真处理。');
      this.showPanel = false;
      this.feedback = {
        type: '',
        content: '',
        contact: ''
      };
    }
  }
}
</script>

<style scoped>
.feedback-helper {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.feedback-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgb(32, 178, 170);;
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74,108,247,0.2);
  transition: all 0.3s ease;
}

.feedback-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74,108,247,0.3);
}

.feedback-btn.active {
  background: rgb(32, 178, 170);;
}

.feedback-btn i {
  font-size: 20px;
}

.feedback-panel {
  position: absolute;
  right: 0;
  bottom: 70px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 20px;
  animation: slideUp 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #666;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  color: #666;
}

.form-group select,
.form-group input,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn {
  background: rgb(32, 178, 170);;
  color: white;
}

.submit-btn:hover {
  background: rgb(32, 178, 170);;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #eee;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>