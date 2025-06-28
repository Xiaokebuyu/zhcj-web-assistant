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
          <div v-for="item in filteredHelpData" :key="item.id" class="help-item" @click="showTaskDetail(item)">
            <h4>{{ item.name }}
              <span v-if="item.rIsOnline !== 1">（{{ item.area }}）</span>
            </h4>
            <p>需求类型：{{ item.type }}</p>
            <p>需求描述：{{ item.needs }}</p>
            <p>紧急程度：<span :class="{
              'urgency-normal': item.urgency === '一般',
              'urgency-urgent': item.urgency === '较急',
              'urgency-emergency': item.urgency === '紧急'
            }">{{ item.urgency }}</span></p>
            <p>帮扶类型:{{ item.rIsOnline === 1 ? '线上' : '线下' }}</p>
            <div class="help-actions">
              <button class="help-button" @click.stop="startHelp(item.id, item.rIsOnline)">接取帮扶任务</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 接取任务栏 -->
      <div class="card">
        <h3><i class="fas fa-tasks"></i> 接取任务栏</h3>
        <div v-if="acceptedTasks.length === 0" class="empty-tasks">
          <p>暂无接取的任务</p>
        </div>
        <div v-else id="emergencyPanel" class="emergency-scroll">
          <div v-for="task in acceptedTasks" :key="task.id" class="emergency-item" @click="showTaskDetail(task)">
            <h4>{{ task.name }}（{{ task.area }}）</h4>
            <p>需求类型：{{ task.type }}</p>
            <p>需求描述：{{ task.needs }}</p>
            <p>紧急程度：<span :class="{
              'urgency-normal': task.urgency === '一般',
              'urgency-urgent': task.urgency === '较急',
              'urgency-emergency': task.urgency === '紧急'
            }">{{ task.urgency }}</span></p>
            <p>帮扶类型：{{ task.helpType }}</p>
            <p>接取时间：{{ task.acceptedTime }}</p>
            <div class="task-actions">
              <button
                  class="cancel-btn"
                  @click.stop="cancelTask(task.id)"
                  v-if="task.status !== 'completed'"
              >
                取消任务
              </button>
            </div>
            <p v-if="task.status === 'completed'" class="task-status">状态：已完成</p>
          </div>
        </div>
      </div>

      <!-- 任务详情弹窗 -->
      <div class="task-detail-modal" v-if="showDetail" @click.self="closeTaskDetail">
        <div class="task-detail-content">
          <div class="task-detail-header">
            <h3>任务详情</h3>
            <button class="close-btn" @click="closeTaskDetail">&times;</button>
          </div>
          <div class="task-detail-body">
            <div class="detail-item">
              <label>帮扶对象：</label>
              <span>{{ currentTask.name }}</span>
            </div>
            <div class="detail-item">
              <label>所在地区：</label>
              <span>{{ currentTask.area }}</span>
            </div>
            <div class="detail-item">
              <label>需求类型：</label>
              <span>{{ currentTask.type }}</span>
            </div>
            <div class="detail-item">
              <label>需求描述：</label>
              <span>{{ currentTask.needs }}</span>
            </div>
            <div class="detail-item">
              <label>紧急程度：</label>
              <span :class="{
                'urgency-normal': currentTask.urgency === '一般',
                'urgency-urgent': currentTask.urgency === '较急',
                'urgency-emergency': currentTask.urgency === '紧急'
              }">{{ currentTask.urgency }}</span>
            </div>
            <div class="detail-item" v-if="currentTask.helpType">
              <label>帮扶类型：</label>
              <span>{{ currentTask.helpType }}</span>
            </div>
            <div class="detail-item" v-if="currentTask.acceptedTime">
              <label>接取时间：</label>
              <span>{{ currentTask.acceptedTime }}</span>
            </div>
            <div class="detail-item" v-if="currentTask.status">
              <label>任务状态：</label>
              <span>{{ currentTask.status === 'completed' ? '已完成' : '进行中' }}</span>
            </div>
          </div>
          <div class="task-detail-footer" v-if="currentTask.id">
            <!-- 添加联系求助者按钮 -->
            <button class="contact-btn" @click="contactRecipient">
              <i class="fas fa-phone"></i> 联系求助者
            </button>
          </div>
        </div>
      </div>

      <!-- 联系信息弹窗 -->
      <div class="contact-modal" v-if="showContactModal" @click.self="closeContactModal">
        <div class="contact-modal-content">
          <div class="contact-modal-header">
            <h3>联系求助者</h3>
            <button class="close-btn" @click="closeContactModal">&times;</button>
          </div>
          <div class="contact-modal-body">
            <div class="contact-info">
              <div class="contact-item">
                <label><i class="fas fa-user"></i> 求助者：</label>
                <span>{{ currentTask.name }}</span>
              </div>
              <div class="contact-item">
                <label><i class="fas fa-map-marker-alt"></i> 地址：</label>
                <span>{{ currentTask.area }}</span>
              </div>
              <div class="contact-item">
                <label><i class="fas fa-phone"></i> 联系电话：</label>
                <span>{{ currentTask.phone || '暂无联系方式' }}</span>
              </div>
              <div class="contact-item">
                <label><i class="fas fa-comment"></i> 需求描述：</label>
                <span>{{ currentTask.needs }}</span>
              </div>
            </div>
            <div class="contact-message">
              <label>发送消息：</label>
              <textarea 
                v-model="contactMessage" 
                placeholder="请输入您想发送给求助者的消息..."
                rows="4"
              ></textarea>
            </div>
          </div>
          <div class="contact-modal-footer">
            <button class="btn-cancel" @click="closeContactModal">取消</button>
            <button class="btn-send" @click="sendMessage" :disabled="!contactMessage.trim()">
              发送消息
            </button>
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
              :disabled="completedRecords.length < 5"
          >
            生成报告（已完成 {{ completedRecords.length }}/5 次）
          </button>
        </div>
        <div class="record-container">
          <table class="help-table">
            <thead>
            <tr>
              <th>任务编号</th>
              <th>日期</th>
              <th>类型</th>
              <th>帮扶对象</th>
              <th>积分</th>
              <th>状态</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(record, index) in userData.helpRecords" :key="index">
              <td>{{ record.r_id }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.name }}</td>
              <td>{{ record.status === '已完成' ? `+${record.points}` : '-' }}</td>
              <td>{{ record.status }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 消息记录模块 -->
      <div class="card">
        <h3><i class="fas fa-comments"></i> 联系记录</h3>
        <div class="message-container">
          <div v-if="messageHistory.length === 0" class="empty-messages">
            <p>暂无联系记录</p>
          </div>
          <div v-else class="message-list">
            <div v-for="(message, index) in messageHistory" :key="index" class="message-item">
              <div class="message-header">
                <span class="recipient-name">{{ message.recipientName || message.senderName || '未知用户' }}</span>
                <span class="message-time">{{ message.timestamp }}</span>
              </div>
              <div class="message-content">
                {{ message.message }}
              </div>
              <div class="message-footer">
                <span class="task-id">任务ID: {{ message.taskId }}</span>
                <span class="message-type" :class="message.senderName === '求助者' ? 'received' : 'sent'">
                  {{ message.senderName === '求助者' ? '收到回复' : '已发送' }}
                </span>
              </div>
            </div>
          </div>
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
import request from "@/utils/request";

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
      helpData: [],
      acceptedTasks: [],
      pointsChart: null,
      showDetail: false,
      currentTask: {},
      showContactModal: false,
      contactMessage: '',
      messageHistory: [],
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
          date: '2025-06-26',
          content: [
            '自2025年6月26日起，帮扶积分视难以程度进行调整，具体调整规则如下：' +
            '线上任务：一般:+3  较急:+5 紧急:+7；' +
            '线下任务：一般:+5 较急:+7；紧急:+10'
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
    },
    // 新增计算属性：只返回已完成的记录
    completedRecords() {
      return this.userData.helpRecords.filter(record => record.status === '已完成');
    }
  },
  methods: {

    // 新增方法：从后端加载已接取但未完成的任务
    async loadAcceptedTasks() {
      try {
        const response = await request.get('http://localhost:81/request/volunteer/accepted');

        if (response && response.code === 200) {
          this.acceptedTasks = response.data.map(item => ({
            id: item.rid,
            name: item.rhid ? `用户${item.rhid}` : '匿名用户',
            area: item.raddress || '未知地址',
            type: this.getTypeText(item.rtype),
            needs: item.rcontent || '无详细描述',
            urgency: this.getUrgencyText(item.rurgent),
            helpType: item.risOnline === 1 ? '线上' : '线下',
            acceptedTime: item.racceptTime ? new Date(item.racceptTime).toLocaleString() : '未知时间',
            status: item.rsolveTime ? 'completed' : 'accepted'
          }));

          console.log(this.acceptedTasks,'从后端下载已接取但未完成的任务');
        }
      } catch (error) {
        console.error('加载已接取任务出错:', error);
      }
    },

    // 新增方法：从后端加载帮扶数据
    // 修改后的loadHelpList方法
    async loadHelpList() {
      try {
        const response = await request.get('http://localhost:81/request/list', {
          params: {
            queryType: 0 // 获取未解决的任务
          }
        });

        if (response && response.code === 200) {
          this.helpData = response.data.map(item => ({
            id: item.rid,
            name: item.rhid ? `用户${item.rhid}` : '匿名用户',
            area: item.raddress || '未知地址',
            type: this.getTypeText(item.rtype),
            needs: item.rcontent || '无详细描述',
            urgency: this.getUrgencyText(item.rurgent),
            rIsOnline: item.risOnline, // 直接使用后端返回的rIsOnline值
            risSolve: item.rsolveTime
          }));
          console.log('帮扶数据sssss:', response.data.map(item => ({
            id: item.rid,
            rIsOnline: item.risOnline, // 检查是否为 null/undefined
          })));
        } else {
          console.error('获取帮扶列表失败:', response?.msg);
        }
      } catch (error) {
        console.error('加载帮扶列表出错:', error);
        this.$message.error('加载帮扶列表失败，请稍后重试');
      }
    },

    async cancelTask(taskId) {
      try {
        this.$confirm('确定要取消该任务吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const response = await request.put(`http://localhost:81/request/cancel/${taskId}`);

          if (response && response.code === 200) {
            // 从接取任务栏中移除该任务
            this.acceptedTasks = this.acceptedTasks.filter(t => t.id !== taskId);

            // 重新加载帮扶列表，确保取消的任务显示回来
            await this.loadHelpList();
            this.$message.success('任务已取消');
          } else {
            this.$message.error(response?.msg || '取消任务失败');
          }
        }).catch(() => {
          this.$message.info('已取消操作');
        });
      } catch (error) {
        console.error('取消任务出错:', error);
        this.$message.error('取消任务失败');
      }
    },

    // 辅助方法：从地址中提取区域信息
    extractArea(address) {
      if (!address) return '';
      // 简单提取逻辑，根据实际地址格式调整
      const areas = ['朝阳区', '海淀区', '西城区', '东城区'];
      for (const area of areas) {
        if (address.includes(area)) return area;
      }
      return '';
    },

    // 辅助方法：将类型代码转换为文本
    getTypeText(type) {
      const typeMap = {
        0: '日常生活',
        1: '医疗协助',
        2: '交通出行',
        3: '社交陪伴',
        4: '其他'
      };
      return typeMap[type] || '其他';
    },

    // 辅助方法：将紧急程度代码转换为文本
    getUrgencyText(urgency) {
      const urgencyMap = {
        0: '一般',
        1: '较急',
        2: '紧急'
      };
      return urgencyMap[urgency] || '一般';
    },

    // 获取当前用户ID
    async getCurrentUserId() {
      try {
        const response = await request.get('http://localhost:81/user/current');
        if (response && response.code === 200) {
          return response.data.uid;
        }
        return null;
      } catch (error) {
        console.error("获取用户ID出错:", error);
        return null;
      }
    },

    // 修改startHelp方法，调用后端接口
    async startHelp(id, rIsOnline) {
      try {
        const uid = await this.getCurrentUserId();
        if (!uid) {
          this.$message.error('无法获取用户ID');
          return;
        }

        const taskToAccept = this.helpData.find(item => item.id === id);
        if (!taskToAccept) {
          this.$message.error('未找到该任务');
          return;
        }

        const helpType = rIsOnline === 1 ? '线上' : '线下';

        const response = await request.put(`/request/accept/${id}`);

        if (response && response.code === 200) {
          // 从帮扶列表中移除该任务
          this.helpData = this.helpData.filter(item => item.id !== id);

          // 添加到已接取任务列表
          this.acceptedTasks.push({
            ...taskToAccept,
            id: id,
            status: 'accepted',
            acceptedTime: new Date().toLocaleString(),
            helpType: helpType,
            points: helpType === '线下' ? 5 : 3
          });

          this.$message.success('接取任务成功！');
        } else {
          this.$message.error(response?.msg || '接取任务失败');
        }
      } catch (error) {
        console.error('接取任务失败详情:', error);
        this.$message.error(`接取任务失败: ${error.message}`);
      }
    },

    // 新增方法：从后端加载帮扶记录
    async loadHelpRecords() {
      try {
        const response = await request.get('http://localhost:81/request/volunteer/records');

        if (response && response.code === 200) {
          this.userData.helpRecords = response.data
              .filter(item => item.risSolve === 2)  // 关键修改：只筛选已完成的记录
              .map(item => {
                // 根据任务类型和紧急程度计算积分
                let points = 0;
                if (item.risOnline === 1) { // 线上任务
                  if (item.rurgent === 0) points = 3; // 线上一般
                  else if (item.rurgent === 1) points = 5; // 线上较急
                  else if (item.rurgent === 2) points = 7; // 线上紧急
                } else { // 线下任务
                  if (item.rurgent === 0) points = 5; // 线下一般
                  else if (item.rurgent === 1) points = 7; // 线下较急
                  else if (item.rurgent === 2) points = 10; // 线下紧急
                }

                return {
                  r_id: item.rid,  // 新增需求编号字段
                  date: item.rsolveTime ? new Date(item.rsolveTime).toLocaleDateString('zh-CN') : '未完成',
                  type: item.risOnline === 1 ? '线上' : '线下',
                  name: item.rhid ? `用户${item.rhid}` : '匿名用户',
                  points: points,
                  status: item.rsolveTime ? '已完成' : '进行中',
                  urgency: this.getUrgencyText(item.rurgent) // 添加紧急程度字段
                };
              });

          // 计算总积分
          this.userData.points = this.completedRecords.reduce((sum, r) => sum + (r.points || 0), 0);

          this.saveUserData();
          this.updateChart();
        }
      } catch (error) {
        console.error('加载帮扶记录出错:', error);
      }
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

      // 修改这里：正确统计线上和线下帮扶次数
      const offlineCount = this.userData.helpRecords
          .filter(r => r.type === '线下' && r.status === '已完成').length;
      const onlineCount = this.userData.helpRecords
          .filter(r => r.type === '线上' && r.status === '已完成').length;

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

        const loading = this.$loading({
          lock: true,
          text: '正在生成报告，请稍候...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        setTimeout(async () => {
          try {
            const doc = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4"
            });

            // 设置字体为支持中文的字体
            doc.setFont('helvetica');

            doc.setFontSize(18);
            doc.setTextColor(44, 62, 80);
            // 使用英文标题避免中文显示问题
            doc.text('Volunteer Service Report', 105, 20, { align: 'center' });

            const totalTasks = this.userData.helpRecords.length;
            const completedTasks = this.completedRecords.length;

            doc.setFontSize(12);
            doc.text(`Total Tasks: ${totalTasks}`, 20, 40);
            doc.text(`Completed: ${completedTasks}`, 20, 45);
            doc.text(`Current Points: ${this.userData.points}`, 20, 50);

            // 使用英文表头避免中文显示问题
            const headers = [["Task ID", "Date", "Type", "Recipient", "Points", "Status"]];
            const data = this.completedRecords.map(record => [
              record.r_id || '-',
              record.date || 'No Date',
              record.type || 'Unknown',
              record.name || 'Anonymous',
              `+${record.points}`,
              record.status || 'Completed'
            ]);

            doc.autoTable({
              startY: 60,
              head: headers,
              body: data,
              theme: 'grid',
              headStyles: {
                fillColor: [76, 175, 80],
                textColor: [255, 255, 255],
                fontStyle: "bold"
              },
              styles: {
                fontSize: 10,
                cellPadding: 3,
                textColor: [50, 50, 50]
              },
              columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 20 },
                2: { cellWidth: 15 },
                3: { cellWidth: 35 },
                4: { cellWidth: 15 },
                5: { cellWidth: 15 }
              }
            });

            doc.save(`${this.userData.username}-Volunteer-Report.pdf`);
          } catch (error) {
            console.error('报告生成错误:', error);
            this.$alert('生成报告失败: ' + error.message);
          } finally {
            loading.close();
          }
        }, 100);
      } catch (error) {
        console.error('报告生成错误:', error);
        this.$alert('生成报告失败，请检查浏览器控制台');
      }
    },


    showTaskDetail(task) {
      this.currentTask = { ...task };
      this.showDetail = true;
    },
    closeTaskDetail() {
      this.showDetail = false;
      this.currentTask = {};
    },
    contactRecipient() {
      this.showContactModal = true;
    },
    closeContactModal() {
      this.showContactModal = false;
      this.contactMessage = '';
    },
    sendMessage() {
      // 实现发送消息的逻辑
      if (!this.contactMessage.trim()) {
        this.$message.warning('请输入消息内容');
        return;
      }

      // 显示发送中的提示
      this.$message.info('正在发送消息...');

      // 模拟发送消息到后端
      setTimeout(() => {
        // 这里应该调用后端API发送消息
        // const response = await request.post('/message/send', {
        //   taskId: this.currentTask.id,
        //   message: this.contactMessage,
        //   recipientId: this.currentTask.recipientId
        // });

        this.$message.success('消息发送成功！');
        
        // 保存消息记录
        this.saveMessageRecord();
        
        // 重新加载消息历史
        this.loadMessageHistory();
        
        this.closeContactModal();
      }, 1000);
    },
    
    saveMessageRecord() {
      // 保存消息记录到本地存储
      const messageRecord = {
        taskId: this.currentTask.id,
        recipientName: this.currentTask.name,
        message: this.contactMessage,
        timestamp: new Date().toLocaleString(),
        type: 'sent'
      };
      
      // 获取现有的消息记录
      let messageHistory = JSON.parse(localStorage.getItem('messageHistory') || '[]');
      messageHistory.push(messageRecord);
      
      // 保存到本地存储
      localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
    },
    loadMessageHistory() {
      this.messageHistory = JSON.parse(localStorage.getItem('messageHistory') || '[]');
    }
  },


  async mounted() {
        await this.loadHelpList();
        await this.loadHelpRecords();
        await this.loadAcceptedTasks(); // 新增方法，加载已接取但未完成的任务
        this.loadUserData();
        this.loadMessageHistory(); // 加载消息历史记录
        this.$nextTick(() => {
          this.updateChart();
        });


    // 添加beforeunload事件监听，确保页面关闭前保存数据
    window.addEventListener('beforeunload', () => {
      this.saveUserData();
    });
  },
  // 组件销毁前移除事件监听
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.saveUserData);
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
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  min-height: 450px;
  display: flex;
  flex-direction: column;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #4CAF50;
  display: flex;
  align-items: center;
  font-size: 20px;
}

.card h3 i {
  margin-right: 12px;
  color: #4CAF50;
  font-size: 22px;
}

.help-list {
  margin-top: 16px;
  flex: 1;
  overflow-y: auto;
  max-height: 600px;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: #4CAF50 #f0f0f0;
}

.help-list::-webkit-scrollbar {
  width: 6px;
}

.help-list::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.help-list::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 3px;
}

.help-list::-webkit-scrollbar-thumb:hover {
  background: #3d8b40;
}

.help-item {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: pointer;
}

.help-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #4CAF50;
}

.help-item h4 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 18px;
}

.help-item p {
  color: #666;
  margin-bottom: 12px;
  font-size: 16px;
}

.help-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.help-actions select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  background: white;
}

.help-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.help-button:hover {
  background: #3d8b40;
  transform: translateY(-1px);
}

.emergency-scroll {
  max-height: 600px;
  overflow-y: auto;
  margin-top: 16px;
  flex: 1;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: #4CAF50 #f0f0f0;
}

.emergency-scroll::-webkit-scrollbar {
  width: 6px;
}

.emergency-scroll::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.emergency-scroll::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 3px;
}

.emergency-scroll::-webkit-scrollbar-thumb:hover {
  background: #3d8b40;
}

.emergency-item {
  background: #fff8dc;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ffd700;
  transition: all 0.3s ease;
  cursor: pointer;
}

.emergency-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #ffd700;
}

.emergency-item p {
  margin-bottom: 8px;
  font-size: 16px;
  color: #333;
}

.task-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.accept-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.accept-btn:hover:not(:disabled) {
  background: #3d8b40;
  transform: translateY(-1px);
}

.accept-btn.accepted {
  background: #a0aec0;
  cursor: not-allowed;
}

.complete-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.complete-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
}

.chart-container {
  flex: 1;
  min-height: 300px;
  margin: 16px 0;
}

.points-display {
  text-align: center;
  font-size: 18px;
  color: #2c3e50;
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.points-display span {
  font-weight: bold;
  color: #4CAF50;
  font-size: 24px;
}

.record-container {
  flex: 1;
  overflow-y: auto;
  margin-top: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  max-height: 600px;
  scrollbar-width: thin;
  scrollbar-color: #4CAF50 #f0f0f0;
}

.record-container::-webkit-scrollbar {
  width: 6px;
}

.record-container::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.record-container::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 3px;
}

.record-container::-webkit-scrollbar-thumb:hover {
  background: #3d8b40;
}

.help-table {
  width: 100%;
  border-collapse: collapse;
}

.help-table th,
.help-table td {
  border: 1px solid #e9ecef;
  padding: 12px;
  text-align: left;
  font-size: 15px;
}

.help-table th {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  position: sticky;
  top: 0;
}

.announcement-content,
.guide-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  max-height: 600px;
  scrollbar-width: thin;
  scrollbar-color: #4CAF50 #f0f0f0;
}

.announcement-content::-webkit-scrollbar,
.guide-content::-webkit-scrollbar {
  width: 6px;
}

.announcement-content::-webkit-scrollbar-track,
.guide-content::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.announcement-content::-webkit-scrollbar-thumb,
.guide-content::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 3px;
}

.announcement-content::-webkit-scrollbar-thumb:hover,
.guide-content::-webkit-scrollbar-thumb:hover {
  background: #3d8b40;
}

.announcement-item {
  background: #f8f9fa;
  border-left: 4px solid #4CAF50;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 0 8px 8px 0;
}

.announcement-item h4 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.announcement-item .date {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.announcement-item p {
  color: #333;
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.6;
}

.guide-steps {
  list-style-position: inside;
  margin-bottom: 20px;
}

.guide-steps li {
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
  line-height: 1.6;
}

.guide-tips {
  background: #e8f5e9;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.guide-tips h4 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-tips ul {
  list-style-position: inside;
}

.guide-tips li {
  margin-bottom: 8px;
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .card {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 12px;
  }
  .card {
    padding: 16px;
  }
  .help-actions {
    flex-direction: column;
  }
  .help-button {
    width: 100%;
  }
}

.task-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.task-detail-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

.task-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #4CAF50;
}

.task-detail-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.task-detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  gap: 12px;
}

.detail-item label {
  font-weight: bold;
  color: #666;
  min-width: 100px;
}

.detail-item span {
  color: #333;
  flex: 1;
}

.help-item, .emergency-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.help-item:hover, .emergency-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.urgency-normal {
  color: #4CAF50;
  font-weight: 500;
}

.urgency-urgent {
  color: #FFC107;
  font-weight: 500;
}

.urgency-emergency {
  color: #F44336;
  font-weight: 500;
}

.contact-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.contact-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

.contact-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #4CAF50;
}

.contact-modal-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.contact-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-item {
  display: flex;
  gap: 12px;
}

.contact-item label {
  font-weight: bold;
  color: #666;
  min-width: 100px;
}

.contact-item span {
  color: #333;
  flex: 1;
}

.contact-message {
  display: flex;
  flex-direction: column;
}

.contact-message label {
  font-weight: bold;
  color: #666;
  margin-bottom: 8px;
}

.contact-message textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}

.contact-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #1976D2;
  transform: translateY(-1px);
}

.btn-send {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.btn-send:hover {
  background: #3d8b40;
  transform: translateY(-1px);
}

.btn-send:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

/* 消息记录样式 */
.message-container {
  margin-top: 16px;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.empty-messages {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.message-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.recipient-name {
  font-weight: bold;
  color: #2c3e50;
}

.message-time {
  font-size: 12px;
  color: #666;
}

.message-content {
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.task-id {
  color: #666;
}

.message-type {
  color: #4CAF50;
  font-weight: bold;
}

.message-type.sent {
  color: #4CAF50;
}

.message-type.received {
  color: #2196F3;
}

/* 联系按钮样式 */
.contact-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
}

.contact-btn i {
  font-size: 16px;
}

/* 任务详情弹窗footer样式 */
.task-detail-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
}
</style>