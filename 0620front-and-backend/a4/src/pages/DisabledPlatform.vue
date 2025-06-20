<template>
  <div class="disabled-dashboard">
    <div class="publish-row">
      <div class="card card-publish">
        <div class="card-title">发布求助任务</div>
        <form class="publish-form" @submit.prevent="submitRequest">
          <div class="form-group">
            <label>需求类型</label>
            <select v-model="newRequest.type" required>
              <option value="">请选择需求类型</option>
              <option value="daily">日常生活</option>
              <option value="medical">医疗协助</option>
              <option value="transport">交通出行</option>
              <option value="social">社交陪伴</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>需求描述</label>
            <textarea v-model="newRequest.desc" required placeholder="请详细描述您的需求"></textarea>
          </div>
          <div class="form-group">
            <label>紧急程度</label>
            <div class="urgency-group">
              <label><input type="radio" value="normal" v-model="newRequest.urgency" required> 一般</label>
              <label><input type="radio" value="medium" v-model="newRequest.urgency"> 较急</label>
              <label><input type="radio" value="urgent" v-model="newRequest.urgency"> 紧急</label>
            </div>
          </div>
          <button class="publish-btn" type="submit">发布任务</button>
        </form>
      </div>
    </div>
    <div class="grid-container">
      <!-- 任务进度 -->
      <div class="card card-progress">
        <div class="card-title">任务进度</div>
        <div class="progress-group">
          <div class="progress-group-title">进行中</div>
          <div v-if="progressOngoing.length === 0" class="empty">暂无进行中任务</div>
          <div class="progress-vertical-scroll">
            <div v-for="(task, idx) in progressOngoing" :key="'doing'+idx" class="progress-item">
              <div class="progress-desc">【{{ task.type }}】{{ task.desc }}</div>
              <div class="progress-bar-wrap">
                <div class="progress-bar">
                  <div class="progress-bar-inner" :style="{width: progressPercent(task.status) + '%'}"></div>
                </div>
                <div class="progress-steps">
                  <span v-for="(step, i) in steps" :key="i" :class="{'active': i <= stepIndex(task.status)}">{{ step }}</span>
                </div>
              </div>
              <div class="progress-status">状态：<span :class="'status-'+task.status">{{ statusText(task.status) }}</span></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 已完成任务（原积分统计） -->
      <div class="card card-done">
        <div class="card-title">已完成任务</div>
        <div v-if="progressDone.length === 0" class="empty">暂无已完成任务</div>
        <div v-else class="done-vertical-scroll">
          <div v-for="(task, idx) in progressDone" :key="'done'+idx" class="done-item">
            <div class="done-desc">【{{ task.type }}】{{ task.desc }}</div>
            <div class="done-status">已完成</div>
            <div class="rating-block">
              <span class="rating-label">评价志愿者：</span>
              <span class="star-group">
                <span v-for="star in 5" :key="star" class="star"
                      :class="{active: (ratings[idx]||0) >= star}"
                      @click="setRating(idx, star)">★</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid-container" style="margin-top:32px;">
      <!-- 已无内容，全部删除 -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'DisabledPlatform',
  data() {
    return {
      area: '',
      progressList: [
        { type: '医疗协助', desc: '需要陪同去医院复查', status: 'pending' },
        { type: '日常生活', desc: '帮忙买菜送上门', status: 'doing' },
        { type: '心理疏导', desc: '线上心理咨询', status: 'done' },
        { type: '交通出行', desc: '预约无障碍出租车', status: 'pending' },
        { type: '社交陪伴', desc: '需要志愿者陪同散步', status: 'doing' },
        { type: '医疗协助', desc: '协助取药', status: 'pending' },
        { type: '日常生活', desc: '家政清洁服务', status: 'doing' },
        { type: '心理疏导', desc: '线下心理疏导', status: 'done' },
        { type: '交通出行', desc: '陪同乘坐公交', status: 'pending' },
        { type: '社交陪伴', desc: '线上聊天陪伴', status: 'doing' },
        { type: '医疗协助', desc: '预约挂号', status: 'done' }
      ],
      steps: ['已发布', '已接单', '进行中', '已完成'],
      score: 0,
      record: [],
      matchTab: 'disabled',
      matchInput: '',
      matchList: [],
      newRequest: {
        type: '',
        desc: '',
        urgency: ''
      },
      // 评价数据，key为已完成任务索引，value为星级
      ratings: {}
    }
  },
  computed: {
    progressOngoing() {
      return this.progressList.filter(t => t.status !== 'done');
    },
    progressDone() {
      return this.progressList.filter(t => t.status === 'done');
    }
  },
  methods: {
    goProfile() {
      this.$router.push('/profile');
    },
    submitRequest() {
      if (!this.newRequest.type || !this.newRequest.desc || !this.newRequest.urgency) {
        alert('请填写完整信息');
        return;
      }
      // 新任务添加到任务进度
      this.progressList.unshift({
        type: this.typeText(this.newRequest.type),
        desc: this.newRequest.desc,
        urgency: this.newRequest.urgency,
        status: 'pending'
      });
      alert('任务已发布！');
      this.newRequest = { type: '', desc: '', urgency: '' };
    },
    // 类型映射
    typeText(type) {
      if(type==='daily') return '日常生活';
      if(type==='medical') return '医疗协助';
      if(type==='transport') return '交通出行';
      if(type==='social') return '社交陪伴';
      if(type==='other') return '其他';
      return type;
    },
    statusText(status) {
      if (status === 'pending') return '待匹配';
      if (status === 'doing') return '进行中';
      if (status === 'done') return '已完成';
      return status;
    },
    stepIndex(status) {
      if (status === 'pending') return 0;
      if (status === 'doing') return 2;
      if (status === 'done') return 3;
      return 0;
    },
    progressPercent(status) {
      if (status === 'pending') return 25;
      if (status === 'doing') return 75;
      if (status === 'done') return 100;
      return 0;
    },
    setRating(idx, star) {
      this.$set(this.ratings, idx, star);
    }
  }
}
</script>

<style>
.disabled-dashboard {
  padding: 32px 0 48px 0;
  background: #fafbfc;
}
.publish-row {
  max-width: 1200px;
  margin: 0 auto 40px auto;
}
.card-publish {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 40px 36px;
  background: #fff;
  margin-bottom: 0;
}
.publish-form .form-group {
  margin-bottom: 24px;
}
.publish-form label {
  font-weight: bold;
  color: #188a8a;
  margin-bottom: 8px;
  display: block;
  font-size: 18px;
}
.publish-form select, .publish-form textarea {
  width: 100%;
  border-radius: 8px;
  border: 1.5px solid #ddd;
  padding: 12px;
  font-size: 17px;
  margin-top: 6px;
}
.publish-form textarea {
  min-height: 80px;
}
.urgency-group {
  display: flex;
  gap: 24px;
  margin-top: 8px;
  font-size: 17px;
}
.urgency-group label {
  font-weight: normal;
  color: #222;
}
.publish-btn {
  width: 100%;
  background: #20bcb8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 16px 0;
  font-size: 20px;
  margin-top: 18px;
  cursor: pointer;
}
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}
.grid-container:first-of-type {
  grid-template-columns: 1fr;
}
.card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  font-size: 18px;
}
.card-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 24px;
}
.card-progress .progress-group {
  margin-bottom: 32px;
}
.progress-group-title {
  font-size: 20px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 12px;
}
.card-progress .progress-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.progress-item {
  background: #f5f6fa;
  border-radius: 10px;
  padding: 18px 22px;
  font-size: 17px;
  margin-bottom: 6px;
}
.progress-desc {
  font-weight: bold;
  color: #333;
  font-size: 18px;
}
.progress-bar-wrap {
  margin: 12px 0 8px 0;
}
.progress-bar {
  width: 100%;
  height: 10px;
  background: #e3eafc;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
}
.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #4caf50);
  border-radius: 6px;
  transition: width 0.5s;
}
.progress-steps {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #bbb;
}
.progress-steps span.active {
  color: #2196f3;
  font-weight: bold;
}
.progress-status {
  margin-top: 8px;
  font-size: 16px;
}
.status-pending { color: #f7b500; }
.status-doing { color: #2196f3; }
.status-done { color: #4caf50; }
.empty {
  color: #888;
  font-size: 17px;
  text-align: center;
  margin-top: 32px;
}
.card-done {
  min-height: 320px;
  display: flex;
  flex-direction: column;
}
.done-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}
.done-item {
  background: #f5f6fa;
  border-radius: 10px;
  padding: 16px 20px;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.done-desc {
  color: #333;
  font-weight: bold;
}
.done-status {
  color: #4caf50;
  font-size: 16px;
  font-weight: bold;
}
.card-record .report-btn {
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  width: 100%;
  font-size: 18px;
  margin-bottom: 18px;
  cursor: pointer;
}
.record-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}
.record-table th, .record-table td {
  border: 1.5px solid #eee;
  padding: 10px 12px;
  text-align: center;
  font-size: 17px;
}
.record-table th {
  background: #f5f6fa;
  color: #333;
}
.card-match .match-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.card-match .match-tabs button {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 24px;
  font-size: 17px;
  background: #e3eafc;
  color: #2196f3;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.card-match .match-tabs button.active {
  background: #2196f3;
  color: #fff;
}
.match-input {
  width: 100%;
  min-height: 80px;
  border-radius: 8px;
  border: 1.5px solid #ddd;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 17px;
}
.submit-match {
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 0;
  width: 100%;
  font-size: 18px;
  cursor: pointer;
}
.card-list .empty {
  color: #888;
  font-size: 17px;
  text-align: center;
  margin-top: 32px;
}
.match-list {
  min-height: 120px;
  background: #f5f6fa;
  border-radius: 10px;
  padding: 18px;
  font-size: 17px;
}
.profile-btn {
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 16px 40px;
  font-size: 20px;
  cursor: pointer;
  margin-top: 24px;
}
.event-btn {
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 12px;
}
.progress-vertical-scroll {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-right: 4px;
}
.done-vertical-scroll {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
  padding-right: 4px;
}
.rating-block {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rating-label {
  font-size: 15px;
  color: #888;
}
.star-group {
  display: flex;
  gap: 2px;
  cursor: pointer;
}
.star {
  font-size: 22px;
  color: #ccc;
  transition: color 0.2s;
  user-select: none;
}
.star.active {
  color: #f7b500;
}
</style>