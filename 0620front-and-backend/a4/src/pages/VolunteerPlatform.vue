<template>
  <div class="container">
    <div class="dashboard">
      <!-- 一对一帮扶模块 -->
      <div class="card">
        <h3><i class="fas fa-hand-holding-heart"></i> 一对一帮扶</h3>
        <div class="filter-form">
          <select v-model="selectedArea" @change="loadHelpList">
            <option value="">全部地区</option>
            <option value="朝阳区">朝阳区</option>
            <option value="海淀区">海淀区</option>
            <option value="西城区">西城区</option>
            <option value="东城区">东城区</option>
          </select>
        </div>
        <div id="helpList" class="help-list">
          <div v-for="item in filteredHelpData" :key="item.id" class="help-item">
            <h4>{{ item.name }}（{{ item.area }}）</h4>
            <p>需求：{{ item.needs }}</p>
            <div class="help-actions">
              <select v-model="item.selectedType">
                <option value="线下">线下帮扶</option>
                <option value="线上">线上帮扶</option>
              </select>
              <button class="help-button" @click="startHelp(item.id, item.selectedType)">开始帮扶</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 应急帮扶模块 -->
      <div class="card">
        <h3><i class="fas fa-first-aid"></i> 应急帮扶</h3>
        <div id="emergencyPanel" class="emergency-scroll">
          <div v-for="request in emergencyData" :key="request.id" class="emergency-item">
            <p>{{ request.content }}</p>
            <p>发布时间：{{ request.timestamp }}</p>
            <button
                class="accept-btn"
                :class="{ accepted: request.status === 'accepted' }"
                :disabled="request.status === 'accepted'"
                @click="acceptEmergency(request.id)"
            >
              {{ request.status === 'pending' ? '接取任务' : '已接取' }}
            </button>
            <p v-if="request.status === 'accepted'">接取者：{{ request.acceptedBy }}</p>
          </div>
        </div>
      </div>

      <!-- 积分统计模块 -->
      <div class="card">
        <h3><i class="fas fa-star"></i> 积分统计</h3>
        <div class="chart-container">
          <canvas ref="pointsChart"></canvas>
        </div>
        <div class="points-display">
          当前积分：<span>{{ userData.points }}</span>
        </div>
      </div>

      <!-- 帮扶记录模块 -->
      <div class="card">
        <h3><i class="fas fa-history"></i> 帮扶记录</h3>
        <div class="report-section">
          <button
              class="report-btn"
              @click="generateReport"
              :disabled="userData.helpRecords.length < 5"
          >
            生成报告（已完成 {{ userData.helpRecords.length }}/5 次）
          </button>
        </div>
        <div class="record-container">
          <table class="help-table">
            <thead>
            <tr>
              <th>日期</th>
              <th>类型</th>
              <th>帮扶对象</th>
              <th>积分</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(record, index) in userData.helpRecords" :key="index">
              <td>{{ record.date }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.name }}</td>
              <td>+{{ record.points }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 平台公告模块 -->
      <div class="card">
        <h3><i class="fas fa-bullhorn"></i> 平台公告</h3>
        <div class="announcement-content">
          <div v-for="(announcement, index) in announcements" :key="index" class="announcement-item">
            <h4><i :class="announcement.icon"></i> {{ announcement.title }}</h4>
            <div class="date"><i class="far fa-calendar-alt"></i> {{ announcement.date }}</div>
            <p v-for="(content, idx) in announcement.content" :key="idx">{{ content }}</p>
          </div>
        </div>
      </div>

      <!-- 帮扶指南模块 -->
      <div class="card">
        <h3><i class="fas fa-lightbulb"></i> 帮扶指南</h3>
        <div class="guide-content">
          <ol class="guide-steps">
            <li v-for="(step, index) in guideSteps" :key="index">{{ step }}</li>
          </ol>
          <div class="guide-tips">
            <h4><i class="fas fa-exclamation-circle"></i> 注意事项：</h4>
            <ul>
              <li v-for="(tip, index) in guideTips" :key="index">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default {
  name: 'BangfuPlatform',
  data() {
    return {
      selectedArea: '',
      userData: {
        username: "志愿者",
        points: 0,
        helpRecords: []
      },
      helpData: [
        { id: 1, name: "张先生", area: "朝阳区", needs: "生活物资采购", selectedType: "线下" },
        { id: 2, name: "李女士", area: "海淀区", needs: "医疗咨询", selectedType: "线下" },
        { id: 3, name: "王先生", area: "朝阳区", needs: "陪同就医", selectedType: "线下" },
        { id: 4, name: "赵女士", area: "西城区", needs: "家庭清洁", selectedType: "线下" },
        { id: 5, name: "刘先生", area: "东城区", needs: "法律咨询", selectedType: "线下" },
        { id: 6, name: "陈女士", area: "海淀区", needs: "心理疏导", selectedType: "线下" }
      ],
      emergencyData: [],
      pointsChart: null,
      announcements: [
        {
          title: '平台使用指南更新',
          icon: 'fas fa-info-circle',
          date: '2025-03-15',
          content: [
            '我们更新了平台使用指南，请各位志愿者及时查阅学习中心相关内容。',
            '新版本优化了积分系统，增加了更多可兑换的礼品。'
          ]
        },
        {
          title: '积分规则调整通知',
          icon: 'fas fa-exclamation-triangle',
          date: '2025-03-10',
          content: [
            '自2025年9月1日起，线上帮扶积分调整为每次4分，线下帮扶积分调整为每次6分。',
            '应急帮扶任务完成积分从10分提升到15分。'
          ]
        },
        {
          title: '优秀志愿者评选活动',
          icon: 'fas fa-trophy',
          date: '2025-03-05',
          content: [
            '2025年第二季度优秀志愿者评选活动开始啦！累计积分排名前10的志愿者将获得特别奖励。',
            '活动截止日期：2025年6月30日'
          ]
        }
      ],
      guideSteps: [
        '查看帮扶需求，选择适合自己的帮扶任务',
        '与帮扶对象确认时间、地点和具体需求',
        '提供帮扶服务，注意安全与沟通方式',
        '完成帮扶后，在平台确认完成情况',
        '获得积分，可在积分商城兑换奖励'
      ],
      guideTips: [
        '尊重帮扶对象的个人意愿和隐私',
        '注意个人安全，避免单独前往陌生环境',
        '遇到紧急情况，及时联系平台管理人员',
        '保持耐心，理解帮扶对象的特殊需求',
        '及时记录帮扶过程和发现的问题'
      ]
    }
  },
  computed: {
    filteredHelpData() {
      return this.selectedArea
          ? this.helpData.filter(item => item.area === this.selectedArea)
          : this.helpData;
    }
  },
  methods: {
    initEmergencyDB() {
      if (!sessionStorage.getItem('emergency_help_requests')) {
        const defaultEmergency = [
          {
            id: Date.now(),
            content: '急需帮助购物，地址：朝阳区XX街道',
            timestamp: new Date().toLocaleString(),
            status: 'pending',
            acceptedBy: null
          },
          {
            id: Date.now() + 1,
            content: '需要陪同就医，地点：海淀区人民医院',
            timestamp: new Date().toLocaleString(),
            status: 'pending',
            acceptedBy: null
          },
          {
            id: Date.now() + 2,
            content: '家中电器维修，地址：西城区XX小区',
            timestamp: new Date().toLocaleString(),
            status: 'pending',
            acceptedBy: null
          }
        ];
        sessionStorage.setItem('emergency_help_requests', JSON.stringify(defaultEmergency));
      }
      this.loadEmergencyFromDB();
    },
    loadEmergencyFromDB() {
      this.emergencyData = JSON.parse(sessionStorage.getItem('emergency_help_requests')) || [];
    },
    acceptEmergency(requestId) {
      const request = this.emergencyData.find(r => r.id === requestId);
      if (request && request.status === 'pending') {
        request.status = 'accepted';
        request.acceptedBy = this.userData.username;
        request.acceptedTime = new Date().toLocaleString();

        this.userData.points += 10;
        this.saveUserData();
        sessionStorage.setItem('emergency_help_requests', JSON.stringify(this.emergencyData));
        this.$alert('您已成功接取该求助！获得10积分奖励。');
      }
    },
    startHelp(id, type) {
      const item = this.helpData.find(i => i.id === id);
      if (!item) return;

      const record = {
        date: new Date().toLocaleDateString(),
        type: type,
        name: item.name,
        points: type === '线下' ? 5 : 3,
        area: item.area,
        needs: item.needs
      };

      this.userData.helpRecords.push(record);
      this.userData.points += record.points;
      this.saveUserData();
      this.updateChart();

      this.$alert(`您已开始帮扶${item.name}（${type}），完成后将获得${record.points}积分！`);
    },
    loadUserData() {
      const savedUser = sessionStorage.getItem('current_volunteer');
      const savedPoints = sessionStorage.getItem('volunteer_points');
      const savedRecords = sessionStorage.getItem('user_records');

      if (savedUser) this.userData.username = savedUser;
      if (savedPoints) this.userData.points = parseInt(savedPoints);
      if (savedRecords) this.userData.helpRecords = JSON.parse(savedRecords);
    },
    saveUserData() {
      sessionStorage.setItem('current_volunteer', this.userData.username);
      sessionStorage.setItem('volunteer_points', this.userData.points.toString());
      sessionStorage.setItem('user_records', JSON.stringify(this.userData.helpRecords));
    },
    updateChart() {
      if (this.pointsChart) {
        this.pointsChart.destroy();
      }

      const offlineCount = this.userData.helpRecords.filter(r => r.type === '线下').length;
      const onlineCount = this.userData.helpRecords.filter(r => r.type === '线上').length;

      this.pointsChart = new Chart(this.$refs.pointsChart, {
        type: 'doughnut',
        data: {
          labels: ['线下帮扶', '线上帮扶'],
          datasets: [{
            data: [offlineCount, onlineCount],
            backgroundColor: ['#4CAF50', '#2196F3'],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    },
    generateReport() {
      try {
        if (this.userData.helpRecords.length === 0) {
          this.$alert('无有效记录可生成报告');
          return;
        }

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.text('Volunteer Service Report', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text(`Volunteer: ${this.userData.username}`, 105, 28, null, null, 'center');
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 32, null, null, 'center');

        const headers = [["Date", "Type", "Assisted Person", "Points"]];
        const data = this.userData.helpRecords.map(record => [
          record.date,
          record.type === '线下' ? 'On-site' : 'Online',
          record.name,
          `+${record.points}`
        ]);

        doc.autoTable({
          startY: 40,
          head: headers,
          body: data,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 3,
            textColor: [50, 50, 50]
          },
          headStyles: {
            fillColor: [76, 175, 80],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          }
        });

        doc.save(`${this.userData.username}-service-report.pdf`);
      } catch (error) {
        console.error('报告生成错误:', error);
        this.$alert('生成报告失败，请检查浏览器控制台');
      }
    }
  },
  mounted() {
    this.initEmergencyDB();
    this.loadUserData();
    this.updateChart();
  }
}
</script>

<style>
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

.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0,0,0,0.1);
  min-height: 400px;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 10px;
  border-bottom: 2px solid #4CAF50;
  display: flex;
  align-items: center;
}

.card h3 i {
  margin-right: 10px;
  color: #4CAF50;
}

.help-list {
  margin-top: 1rem;
}

.help-item {
  background: #f9f9f9;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.help-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.help-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.help-button:hover {
  background: #3d8b40;
}

.emergency-scroll {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 1rem;
}

.emergency-item {
  background: #fff8dc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  border: 1px solid #ffd700;
}

.accept-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.accept-btn:hover {
  background: #3d8b40;
}

.accept-btn.accepted {
  background: #333;
  cursor: not-allowed;
}

.record-container {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.help-table {
  width: 100%;
  border-collapse: collapse;
}

.help-table th,
.help-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.help-table th {
  background: #4CAF50;
  color: white;
  position: sticky;
  top: 0;
}

.announcement-content,
.guide-content {
  height: 340px;
  overflow-y: auto;
  padding: 10px;
}

.announcement-item {
  background: #f9f9f9;
  border-left: 4px solid #4CAF50;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 0 4px 4px 0;
}

.guide-tips {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .card {
    min-height: 350px;
  }
}
</style>