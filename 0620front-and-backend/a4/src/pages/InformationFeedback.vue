<template>
  <div class="feedback-container">
    <div class="feedback-header">
      <h2>用户反馈中心</h2>
      <p>您的宝贵意见是我们进步的动力！我们珍视每一位用户的反馈，将认真阅读并改进我们的服务。</p>
      <p>请填写以下表单提交您的反馈，我们会尽快处理并与您联系。感谢您对智慧残健平台的支持！</p>
    </div>

    <div class="feedback-content">
      <div class="feedback-form-container">
        <h3><i class="fas fa-edit"></i> 提交反馈</h3>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name"><i class="fas fa-user"></i> 您的姓名</label>
            <input type="text" id="name" v-model="formData.name" required placeholder="请输入您的姓名">
          </div>

          <div class="form-group">
            <label for="phone"><i class="fas fa-phone"></i> 联系电话</label>
            <input type="tel" id="phone" v-model="formData.phone" required placeholder="请输入您的联系电话">
          </div>

          <div class="form-group">
            <label for="feedbackType"><i class="fas fa-tag"></i> 反馈类型</label>
            <select id="feedbackType" v-model="formData.type" required>
              <option>请选择反馈类型</option>
              <option :value="0">功能建议</option>
              <option :value="1">问题投诉</option>
              <option :value="2">错误报告</option>
              <option :value="3">其他反馈</option>
            </select>
          </div>

          <div class="form-group">
            <label for="feedbackContent"><i class="fas fa-comment"></i> 反馈内容</label>
            <textarea id="feedbackContent" v-model="formData.content" required placeholder="请详细描述您的反馈内容（不少于50字）"></textarea>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <i class="fas fa-paper-plane"></i>
            {{ isLoading ? '提交中...' : '提交反馈' }}
          </button>
        </form>
      </div>

      <div class="feedback-info">
        <h3><i class="fas fa-info-circle"></i> 反馈须知</h3>
        <div class="info-content">
          <p>尊敬的志愿者朋友：</p>
          <p>感谢您抽出宝贵时间向我们提供反馈意见。您的意见对我们持续改进平台服务至关重要。</p>

          <div class="important-note">
            <p><strong><i class="fas fa-exclamation-circle"></i> 请注意：</strong></p>
            <p>1. 请确保您提供的信息真实有效，以便我们及时与您联系</p>
            <p>2. 反馈内容请尽量详细描述问题或建议，不少于50字</p>
            <p>3. 对于问题投诉，我们会在3个工作日内给予初步回复</p>
          </div>

          <p><strong>反馈处理流程：</strong></p>
          <p>1. 提交反馈 → 2. 系统确认 → 3. 问题分类 → 4. 专人处理 → 5. 结果反馈</p>

          <p>我们承诺对所有反馈信息严格保密，仅用于改进平台服务。</p>
          <p>再次感谢您对智慧残健平台的支持与信任！</p>
        </div>
      </div>
    </div>

    <div class="feedback-history">
      <h3><i class="fas fa-history"></i> 历史反馈记录</h3>
      <div v-if="feedbackHistory.length === 0" class="history-item">
        <p>暂无历史反馈记录</p>
      </div>
      <div v-for="feedback in feedbackHistory" :key="feedback.id" class="history-item">
        <div class="history-header">
          <div class="feedback-type">{{ feedback.type }}</div>
          <div class="feedback-date">{{ formatDate(feedback.timestamp) }}</div>
        </div>
        <div class="feedback-content-text">
          {{ feedback.content }}
        </div>
        <div class="feedback-contact">
          <i class="fas fa-user"></i> {{ encryptName(feedback.name) }} |
          <i class="fas fa-phone"></i> {{ maskPhone(feedback.phone) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import request from "@/utils/request";
export default {
  name: 'InformationFeedback',
  data() {
    return {
      formData: {
        name: '',
        phone: '',
        type: 0,
        content: ''
      },
      feedbackHistory: [],
      isLoading:false
    }
  },
  created() {
    this.loadFeedbackHistory()
  },
  methods: {

    // 获取当前用户ID
    async getCurrentUserId() {
      try {
        const response = await request.get('http://localhost:81/user/current', {
          withCredentials: true
        });
        // console.log(response.data,"这是反馈的用户信息")
        if (response.data && response.code === 200) {
          return response.data.uid; 
        } else {
          console.error("获取用户ID失败:", response.data.message);
          return null;
        }
      } catch (error) {
        console.error("获取用户ID出错:", error);
        return null;
      }
    },

    // 获取用户历史查询记录
    async loadFeedbackHistory() {
      try {
        // 获取当前登录用户ID
        const userId = await this.getCurrentUserId();
        console.log(userId,"这是用户id");
        if (!userId) {
          console.log("用户未登录");
          return;
        }

        // 调用获取用户反馈历史的接口
        const response = await axios.get(`http://localhost:81/Feedback/user/${userId}`, {
          withCredentials: true
        });

        console.log("查询历史反馈响应:", response);

        if (response.data && response.data.code === 200) {
          this.feedbackHistory = response.data.data.map(feedback => ({
            id: feedback.fbId,
            name: feedback.fbName,
            phone: feedback.fbPhone,
            content: feedback.fbContent,
            type: this.getFeedbackTypeText(feedback.fbType),
            timestamp: feedback.createTime
          }));
        }
      } catch(error) {
        console.error("获取历史反馈失败:", error);
        alert("获取历史反馈失败，请稍后重试");
      }
    },
// 将反馈类型数字转换为文本
    getFeedbackTypeText(type) {
      const types = {
        0: "功能建议",
        1: "问题投诉",
        2: "错误报告",
        3: "其他反馈"
      };
      return types[type] || "未知类型";
    },

    async handleSubmit() {
      // 验证表单
      if (!this.validateForm()) {
        console.log("表单验证失败");
        return;
      }
      this.isLoading = true;

      try{
        const response = await axios.post('http://localhost:81/Feedback/submit',this.formData,
            {
                    withCredentials: true,
                    headers: {'Content-Type': 'application/json'}
        }
        );
        console.log(response,"这是反馈提交的response");
        if(response.data.code === 200){
          alert("反馈提交成功！感谢您的宝贵意见");
          this.resetForm();
          this.loadFeedbackHistory();
        }else {
          alert(response.data.message,"提交失败，请稍后重试！");
        }
      }catch (error) {
        console.log("提交反馈失败",error);
        if (error.response && error.response.data) {
          alert(error.response.data.message || '提交失败');
        } else {
          alert('网络错误，请检查连接后重试');
        }
      }finally {
        this.isLoading = false;
      }
    },

    validateForm() {
      if (!this.formData.name) {
        alert('请输入您的姓名');
        return false;
      }
      if (!this.formData.phone || !/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        alert('请输入正确的手机号');
        return false;
      }
      if (this.formData.type === null || this.formData.type === undefined) {
        alert('请选择反馈类型');
        return false;
      }
      if (!this.formData.content || this.formData.content.length < 10) {
        alert('反馈内容不能少于10个字');
        return false;
      }
      return true;
    },
    resetForm() {
      this.formData = {
        name: '',
        phone: '',
        type: 0,
        content: ''
      };
    },
    encryptName(name) {
      if (!name) return '';
      if (name.length === 1) return name;
      return name.charAt(0) + '*'.repeat(name.length - 1);
    },
    maskPhone(phone) {
      return phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
    },
    formatDate(timestamp) {
      return timestamp ? new Date(timestamp).toLocaleString() : '';
    }
  }
}
</script>


<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
}

.feedback-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.feedback-header {
  text-align: center;
  margin-bottom: 40px;
}

.feedback-header h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.feedback-header h2:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: #4CAF50;
  border-radius: 2px;
}

.feedback-header p {
  font-size: 1.1rem;
  color: #4a5568;
  max-width: 800px;
  margin: 20px auto 0;
  line-height: 1.8;
}

.feedback-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.feedback-form-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.feedback-info {
  background: #e8f5e9;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.feedback-info h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #4CAF50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
}

.submit-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s;
  display: block;
  width: 100%;
  text-align: center;
}

.submit-btn:hover {
  background: #3d8b40;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.feedback-history {
  margin-top: 40px;
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.history-item {
  padding: 20px;
  border-bottom: 1px solid #edf2f7;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.feedback-type {
  background: #e3f2fd;
  color: #2196F3;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.feedback-date {
  color: #718096;
  font-size: 0.9rem;
}

.feedback-content-text {
  color: #4a5568;
  line-height: 1.7;
  padding: 15px 0;
}

.feedback-contact {
  color: #718096;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.important-note {
  background: #fff8e1;
  border-left: 4px solid #FFC107;
  padding: 20px;
  margin: 25px 0;
  border-radius: 0 8px 8px 0;
}

@media (max-width: 900px) {
  .feedback-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .feedback-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .feedback-form-container,
  .feedback-info {
    padding: 20px;
  }
}
</style>