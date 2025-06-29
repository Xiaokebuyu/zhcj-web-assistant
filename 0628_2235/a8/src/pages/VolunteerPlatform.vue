<template>
  <div class="container">
    <div class="dashboard">
      <!-- 一对一帮扶模块 -->
      <div class="card">
        <h3><i class="fas fa-hand-holding-heart"></i> 一对一帮扶</h3>
        <div class="filter-form">
          <select v-model="selectedServiceType" @change="loadHelpList">
            <option value="">全部服务类型</option>
            <option value="online">线上服务</option>
            <option value="offline">线下服务</option>
          </select>
          <select v-model="selectedUrgency" @change="loadHelpList">
            <option value="">全部紧急程度</option>
            <option value="一般">一般</option>
            <option value="较急">较急</option>
            <option value="紧急">紧急</option>
          </select>
        </div>
        <div id="helpList" class="help-list">
          <div v-for="item in filteredHelpData" :key="item.id" 
               :class="['help-item', {
                 'urgency-normal-bg': item.urgency === '一般',
                 'urgency-urgent-bg': item.urgency === '较急',
                 'urgency-emergency-bg': item.urgency === '紧急'
               }]" 
               @click="showTaskDetail(item)">
            <h4>{{ item.name }}
              <span v-if="item.rIsOnline !== 1">（{{ item.area }}）</span>
            </h4>
            <table class="task-info-table">
              <tr>
                <td class="label">需求类型：</td>
                <td>{{ item.type }}</td>
              </tr>
              <tr>
                <td class="label">需求描述：</td>
                <td>{{ item.needs }}</td>
              </tr>
              <tr>
                <td class="label">紧急程度：</td>
                <td><span :class="{
                  'urgency-normal': item.urgency === '一般',
                  'urgency-urgent': item.urgency === '较急',
                  'urgency-emergency': item.urgency === '紧急'
                }">{{ item.urgency }}</span></td>
              </tr>
              <tr>
                <td class="label">帮扶类型：</td>
                <td>{{ item.rIsOnline === 1 ? '线上' : '线下' }}</td>
              </tr>
            </table>
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
          <div v-for="task in acceptedTasks" :key="task.id"
               :class="['emergency-item', {
             'urgency-normal-bg': task.urgency === '一般',
             'urgency-urgent-bg': task.urgency === '较急',
             'urgency-emergency-bg': task.urgency === '紧急',
             'submitted-bg': task.rissolve === 2  // 为已提交但未确认的任务添加特殊背景
           }]"
               @click="showTaskDetail(task)">
            <h4>{{ task.name }}<span v-if="task.helpType === '线下'">（{{ task.area }}）</span>
              <span v-if="task.rissolve === 2" class="submitted-badge">待确认</span>
            </h4>
            <table class="task-info-table">
              <tr>
                <td class="label">需求类型：</td>
                <td>{{ task.type }}</td>
              </tr>
              <tr>
                <td class="label">需求描述：</td>
                <td>{{ task.needs }}</td>
              </tr>
              <tr>
                <td class="label">紧急程度：</td>
                <td><span :class="{
              'urgency-normal': task.urgency === '一般',
              'urgency-urgent': task.urgency === '较急',
              'urgency-emergency': task.urgency === '紧急'
            }">{{ task.urgency }}</span></td>
              </tr>
              <tr>
                <td class="label">帮扶类型：</td>
                <td>{{ task.helpType }}</td>
              </tr>
              <tr>
                <td class="label">发布时间：</td>
                <td>{{ task.acceptedTime }}</td>
              </tr>
            </table>
            <div class="task-actions">
              <button
                  class="cancel-btn"
                  @click.stop="cancelTask(task.id)"
                  v-if="task.status !== 'completed' && task.rissolve !== 2"
              >
                取消任务
              </button>
              <button
                  class="contact-btn"
                  @click.stop="contactRecipient(task)"
              >
                联系求助者
              </button>

              <button
                  class="complete-btn"
                  @click.stop="completeTask(task.id)"
                  v-if="task.status !== 'completed' && task.rissolve !== 2"
              >
                提交任务
              </button>
              <button
                  class="remind-btn"
                  @click.stop="remindRecipient(task.id)"
                  v-if="task.rissolve === 2"
              >
                提醒确认
              </button>
            </div>
            <p v-if="task.rissolve === 1" class="task-status submitted-status">状态：已接取</p>
            <p v-if="task.rissolve === 2" class="task-status submitted-status">状态：已提交，等待确认</p>
          </div>
        </div>
      </div>

      <!-- 聊天对话框 -->
      <div class="chat-modal" v-if="showChatModal" @click.self="closeChatModal">
        <div class="chat-modal-content">
          <div class="chat-modal-header">
            <h3>与 {{ currentRecipient.name }} 的历史对话</h3>
            <button class="close-btn" @click="closeChatModal">&times;</button>
          </div>
          <div class="chat-modal-body">
            <div class="chat-messages" ref="chatMessages">
              <div v-for="(message, index) in chatMessages" :key="index"
                   :class="['message', message.sender === 'volunteer' ? 'sent' : 'received']">
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>
            <div v-if="!isHistoryView" class="chat-input">
        <textarea
            v-model="newMessage"
            placeholder="输入消息..."
            @keyup.enter="sendChatMessage"
        ></textarea>
              <button @click="sendChatMessage" :disabled="!newMessage.trim()">发送</button>
            </div>
            <div v-else class="chat-disabled-notice">
              <p>此任务已完成，无法继续对话</p>
            </div>
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
            <button class="contact-btn" @click="contactRecipient(currentTask)">
              <i class="fas fa-phone"></i> 联系求助者
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
              <th>日期</th>
              <th>类型</th>
              <th>需求描述</th>
              <th>帮扶对象</th>
              <th>积分</th>
              <th>状态</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(record, index) in userData.helpRecords" :key="index">
              <td>{{ record.date }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.needs }}</td>
              <td>{{ record.name }}</td>
              <td>{{ record.status === '已完成' ? `+${record.points}` : '-' }}</td>
              <td>{{ record.status }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 消息记录模块 -->
      <!-- 消息记录模块 -->
      <div class="card">
        <h3><i class="fas fa-comments"></i> 联系记录</h3>
        <div class="message-container">
          <div v-if="completedTaskChatRecords.length === 0" class="empty-messages">
            <p>暂无联系记录</p>
          </div>
          <div v-else class="task-chat-list">
            <div v-for="(taskChat, index) in completedTaskChatRecords" :key="index" class="task-chat-item">
              <div class="task-chat-header">
                <div class="task-info">
                  <!-- 修改这里：将任务ID替换为【需求类型】需求内容 -->
                  <h4>【{{ taskChat.taskType }}】{{ taskChat.taskNeeds || '无详细描述' }}</h4>
                  <div class="task-details">
                    <span class="task-type">{{ taskChat.taskType }}</span>
                    <span class="message-count">{{ taskChat.messages.length }} 条消息</span>
                  </div>
                </div>
                <div class="task-summary">
                  <span class="last-time">{{ taskChat.lastMessageTime }}</span>
                </div>
              </div>
              <div class="task-chat-actions">
                <button class="view-full-chat" @click="viewHistoryChat(taskChat)">
                  <i class="fas fa-eye"></i> 查看历史对话
                </button>
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
      currentUserId: null,
      selectedServiceType: '',
      selectedUrgency: '',
      userData: {
        username: "志愿者",
        points: 0,
        helpRecords: []
      },
      isHistoryView: false, // 标记是否为查看历史对话
      helpData: [],
      acceptedTasks: [],
      pointsChart: null,
      showDetail: false,
      currentTask: {},
      contactMessage: '',
      messageHistory: [],
      taskChatRecords: [],
      showChatModal: false,
      currentRecipient: {},
      chatMessages: [],
      newMessage: '',
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
            '自2025年6月26日起，帮扶积分视难易程度进行调整，具体调整规则如下：' +
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
    // 已完成任务的聊天记录
    completedTaskChatRecords() {
      return this.taskChatRecords.filter(chat => {
        // 查找对应的任务记录，检查是否已完成
        const taskRecord = this.userData.helpRecords.find(
            record => record.r_id === chat.taskId
        );
        return taskRecord && taskRecord.status === '已完成';
      });
    },
    filteredHelpData() {
      let filtered = this.helpData;
      // 按服务类型筛选
      if (this.selectedServiceType) {
        if (this.selectedServiceType === 'online') {
          filtered = filtered.filter(item => item.rIsOnline === 1);
        } else if (this.selectedServiceType === 'offline') {
          filtered = filtered.filter(item => item.rIsOnline !== 1);
        }
      }

      // 按紧急程度筛选
      if (this.selectedUrgency) {
        filtered = filtered.filter(item => item.urgency === this.selectedUrgency);
      }

      return filtered;
    },
    // 新增计算属性：只返回已完成的记录
    completedRecords() {
      return this.userData.helpRecords.filter(record => record.status === '已完成');
    },
  },
  methods: {

    // 查看历史对话（只读模式）
    viewHistoryChat(taskChat) {
      this.currentRecipient = {
        id: taskChat.taskId,
        name: taskChat.taskName,
        taskInfo: `${taskChat.taskType} - ${taskChat.taskId}`
      };
      this.chatMessages = taskChat.messages;
      this.isHistoryView = true; // 设置为历史查看模式
      this.showChatModal = true;
    },

    async completeTask(taskId) {
      try {
        this.$confirm('确认已完成该帮扶任务吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const response = await request.put(`http://localhost:81/request/complete/${taskId}`);

          if (response && response.code === 200) {
            // 更新任务状态为已完成
            const taskIndex = this.acceptedTasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              this.acceptedTasks[taskIndex].status = 'completed';
            }

            // 重新加载帮扶记录以更新积分
            await this.loadHelpRecords();
            this.$message.success('任务已完成！');
          } else {
            this.$message.error(response?.msg || '完成任务失败');
          }
        }).catch(() => {
          this.$message.info('已取消操作');
        });
      } catch (error) {
        console.error('完成任务出错:', error);
        this.$message.error('完成任务失败');
      }
    },
    // 新增方法：从后端加载已接取但未完成的任务
    async loadAcceptedTasks() {
      try {
        const response = await request.get('http://localhost:81/request/volunteer/accepted');
        console.log(response,'从后端接取');
        if (response && response.code === 200) {
          this.acceptedTasks = response.data.map(item => ({
            id: item.request.rid,
            name: item.hname ? `${item.hname}` : '匿名用户',
            area: item.request.raddress || '未知地址',
            type: this.getTypeText(item.request.rtype),
            needs: item.request.rcontent || '无详细描述',
            urgency: this.getUrgencyText(item.request.rurgent),
            helpType: item.request.risOnline === 1 ? '线上' : '线下',
            acceptedTime: item.request.rsendTime ? new Date(item.request.rsendTime).toLocaleString() : '未知时间',
            status: item.request.rsolveTime ? 'completed' : 'accepted',
            rissolve: item.request.risSolve // 新增字段，表示任务解决状态
          }));

          console.log(this.acceptedTasks,'从后端下载已接取但未完成的任务');
        }
      } catch (error) {
        console.error('加载已接取任务出错:', error);
      }
    },
    // 新增方法：提醒求助者确认任务
    async remindRecipient(taskId) {
      try {
        this.$confirm('确定要提醒求助者确认任务完成吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const response = await request.post(`http://localhost:81/request/remind/${taskId}`);

          if (response && response.code === 200) {
            this.$message.success('已发送提醒通知');
          } else {
            this.$message.error(response?.msg || '发送提醒失败');
          }
        }).catch(() => {
          this.$message.info('已取消操作');
        });
      } catch (error) {
        console.error('提醒求助者出错:', error);
        this.$message.error('发送提醒失败');
      }
    },
    // 新增方法：从后端加载帮扶数据
    async loadHelpList() {
      try {
        const response = await request.get('http://localhost:81/request/list', {
          params: {
            queryType: 0 // 获取未解决的任务
          },

        });
        console.log(response,'恰是好时节')
        if (response && response.code === 200) {
          this.helpData = response.data.map(item => ({
            id: item.request.rid,
            name: item.hname ? `用户${item.hname}` : '匿名用户',
            area: item.request.raddress || '未知地址',
            type: this.getTypeText(item.request.rtype),
            needs: item.request.rcontent || '无详细描述',
            urgency: this.getUrgencyText(item.request.rurgent),
            rIsOnline: item.request.risOnline, // 直接使用后端返回的rIsOnline值
            risSolve: item.request.rsolveTime
          }));
          console.log('帮扶数据', response.data.map(item => ({
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

    // 联系求助者
// 联系求助者
    // 联系求助者（正常聊天模式）
    async contactRecipient(task) {
      if (!this.currentUserId) {
        await this.getCurrentUserId();
      }

      this.currentRecipient = {
        id: task.id,
        name: task.name,
        taskInfo: `${task.type} - ${task.needs}`
      };

      await this.loadChatMessages(task.id);
      this.isHistoryView = false; // 设置为正常聊天模式
      this.showChatModal = true;
    },

    // 关闭聊天对话框时重置状态
    closeChatModal() {
      this.showChatModal = false;
      this.currentRecipient = {};
      this.chatMessages = [];
      this.newMessage = '';
      this.isHistoryView = false;
    },


    // 加载聊天记录
    // 加载聊天记录
    async loadChatMessages(taskId) {
      try {
        const response = await request.get(`http://localhost:81/chat/${taskId}`);

        if (response && response.code === 200) {
          // 确保已经获取当前用户ID
          if (!this.currentUserId) {
            await this.getCurrentUserId();
          }

          // 格式化聊天记录
          this.chatMessages = response.data.map(item => ({
            id: item.cid,
            taskId: item.crid,
            sender: item.cuid === this.currentUserId ? 'volunteer' : 'recipient',
            content: item.ccontent,
            time: new Date(item.ctime).toLocaleTimeString()
          }));

          // 滚动到底部
          this.$nextTick(() => {
            this.scrollChatToBottom();
          });
        } else {
          this.$message.error(response?.msg || '加载聊天记录失败');
        }
      } catch (error) {
        console.error('加载聊天记录失败:', error);
        this.$message.error('加载聊天记录失败');
      }
    },

    async sendChatMessage() {
      if (!this.newMessage.trim()) return;

      try {
        // 确保有当前用户ID
        if (!this.currentUserId) {
          await this.getCurrentUserId();
          if (!this.currentUserId) {
            this.$message.error('无法获取用户ID');
            return;
          }
        }

        // 构造消息数据
        const messageData = {
          crid: this.currentRecipient.id,
          cuid: this.currentUserId,
          ccontent: this.newMessage.trim(),
          ctime: new Date().toISOString()
        };

        // 发送消息
        const response = await request.post('http://localhost:81/chat/message', messageData);

        if (response && response.code === 200) {
          // 添加到本地消息列表
          const newMessage = {
            id: response.data.cid,
            taskId: response.data.crid,
            sender: 'volunteer',
            content: response.data.ccontent,
            time: new Date(response.data.ctime).toLocaleTimeString()
          };

          this.chatMessages.push(newMessage);
          this.newMessage = '';

          // 滚动到底部
          this.$nextTick(() => {
            this.scrollChatToBottom();
          });

          this.$message.success('消息发送成功');
        } else {
          this.$message.error(response?.msg || '发送消息失败');
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        this.$message.error('发送消息失败');
      }
    },


    // 滚动聊天到底部
    scrollChatToBottom() {
      const container = this.$refs.chatMessages;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    // 获取当前用户ID
    async getCurrentUserId() {
      try {
        const response = await request.get('http://localhost:81/user/current');
        if (response && response.code === 200) {
          this.currentUserId = response.data.uid; // 保存到组件数据
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
            points: helpType === '线下' ? 5 : 3,
            needType: taskToAccept.type // 保存需求类型信息
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
        console.log(response,'这是iii付信息啊啊啊啊');
        if (response && response.code === 200) {
          this.userData.helpRecords = response.data
              .filter(item => item.risSolve === 3)  // 修改为只筛选 risSolve 为 3 的记录
              .map(item => {
                // 确保正确识别线上/线下任务
                const isOnline = item.risOnline === 1; // 1表示线上，其他值表示线下

                // 根据任务类型和紧急程度计算积分
                let points = 0;
                if (isOnline) { // 线上任务
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
                  type: isOnline ? '线上' : '线下', // 确保类型显示正确
                  name: item.rhid ? `用户${item.rhid}` : '匿名用户',
                  needs: item.rcontent || '无详细描述', // 添加需求描述
                  points: points,
                  status: item.rsolveTime ? '已完成' : '进行中',
                  urgency: this.getUrgencyText(item.rurgent), // 添加紧急程度字段
                  needType: this.getTypeText(item.rtype) // 添加需求类型
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

      // 统计各种需求类型的线上和线下帮扶次数
      const typeStats = {};

      // 初始化所有需求类型
      const allTypes = ['日常生活', '医疗协助', '交通出行', '社交陪伴', '其他'];
      allTypes.forEach(type => {
        typeStats[type] = { online: 0, offline: 0 };
      });

      // 统计已完成任务的线上和线下分布
      this.userData.helpRecords
          .filter(r => r.status === '已完成')
          .forEach(record => {
            const needType = record.needType || '其他';
            if (record.type === '线上') {
              typeStats[needType].online++;
            } else if (record.type === '线下') {
              typeStats[needType].offline++;
            }
          });

      // 准备图表数据
      const labels = [];
      const data = [];
      const colors = [];

      // 为每种需求类型定义颜色
      const typeColors = {
        '日常生活': '#FF6B6B', // 珊瑚红
        '医疗协助': '#4ECDC4', // 青绿色
        '交通出行': '#45B7D1', // 天蓝色
        '社交陪伴': '#96CEB4', // 薄荷绿
        '其他': '#FFEAA7'      // 奶油黄
      };

      // 为每种需求类型添加线上和线下数据（即使为0也显示）
      allTypes.forEach(type => {
        const stats = typeStats[type];
        const baseColor = typeColors[type];

        // 显示线上数据（较浅的颜色，但社交陪伴使用更深的颜色）
        labels.push(`${type}-线上`);
        data.push(stats.online);
        if (type === '社交陪伴') {
          colors.push(this.darkenColor(baseColor, 0.1)); // 社交陪伴线上用稍深的颜色
        } else {
          colors.push(this.lightenColor(baseColor, 0.4)); // 其他线上用较浅色
        }

        // 显示线下数据（较深的颜色）
        labels.push(`${type}-线下`);
        data.push(stats.offline);
        colors.push(this.darkenColor(baseColor, 0.2)); // 线下用更深色
      });

      this.pointsChart = new Chart(this.$refs.pointsChart, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            hoverOffset: 8,
            borderWidth: 0,
            borderColor: 'transparent'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 12,
                  family: "'Segoe UI', 'Microsoft YaHei', sans-serif"
                },
                generateLabels: function(chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const dataset = data.datasets[0];
                      const value = dataset.data[i];
                      const backgroundColor = dataset.backgroundColor[i];

                      return {
                        text: `${label} (${value})`,
                        fillStyle: backgroundColor,
                        strokeStyle: backgroundColor,
                        lineWidth: 0,
                        pointStyle: 'circle',
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#2c3e50',
              bodyColor: '#2c3e50',
              borderColor: '#4CAF50',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutQuart'
          },
          cutout: '60%'
        }
      });
    },

    // 辅助方法：使颜色变浅
    lightenColor(color, amount) {
      const usePound = color[0] === "#";
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      let r = (num >> 16) + Math.round(255 * amount);
      let g = (num >> 8 & 0x00FF) + Math.round(255 * amount);
      let b = (num & 0x0000FF) + Math.round(255 * amount);

      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;

      return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, "0");
    },

    // 辅助方法：使颜色变深
    darkenColor(color, amount) {
      const usePound = color[0] === "#";
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      let r = (num >> 16) - Math.round(255 * amount);
      let g = (num >> 8 & 0x00FF) - Math.round(255 * amount);
      let b = (num & 0x0000FF) - Math.round(255 * amount);

      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;

      return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, "0");
    },
    async generateReport() {
      try {
        // 重新加载数据确保是最新的
        await this.loadHelpRecords();

        if (this.userData.helpRecords.length === 0) {
          this.$alert('无有效记录可生成报告');
          return;
        }

        // 添加调试信息
        console.log('生成报告 - 所有记录:', this.userData.helpRecords);
        console.log('生成报告 - 已完成记录:', this.completedRecords);

        const loading = this.$loading({
          lock: true,
          text: '正在生成报告，请稍候...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        setTimeout(() => {
          try {
            const doc = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4"
            });

            // 使用默认字体
            doc.setFont('helvetica');
            doc.setFontSize(18);
            doc.setTextColor(44, 62, 80);
            doc.text('Volunteer Service Report', 105, 20, { align: 'center' });

            const totalTasks = this.userData.helpRecords.length;
            const completedTasks = this.completedRecords.length;

            doc.setFontSize(12);
            doc.text(`Total Tasks: ${totalTasks}`, 20, 40);
            doc.text(`Completed: ${completedTasks}`, 20, 45);
            doc.text(`Current Points: ${this.userData.points}`, 20, 50);

            // 检查是否有数据
            if (this.completedRecords.length === 0) {
              doc.setFontSize(14);
              doc.text('No completed records found.', 20, 70);
            } else {
              // 使用英文表头，数据内容保持原样
              const headers = [["Date", "Type", "Description", "Recipient", "Points", "Status"]];
              const data = this.completedRecords.map(record => {
                console.log('处理记录:', record);
                return [
                  record.date || 'No Date',
                  record.type || 'Unknown',
                  record.needs || 'No Description',
                  record.name || 'Anonymous',
                  `+${record.points || 0}`,
                  record.status || 'Completed'
                ];
              });

              console.log('PDF表格数据:', data);

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
                  1: { cellWidth: 15 },
                  2: { cellWidth: 40 },
                  3: { cellWidth: 25 },
                  4: { cellWidth: 15 },
                  5: { cellWidth: 15 }
                }
              });
            }

            doc.save(`${this.userData.username}-Volunteer-Report.pdf`);
            loading.close();
            this.$message.success('报告生成成功！');
          } catch (error) {
            console.error('报告生成错误:', error);
            this.$alert('生成报告失败: ' + error.message);
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
    // 保存消息到历史记录
    saveMessageToHistory(message) {
      const history = JSON.parse(localStorage.getItem('messageHistory') || '[]');
      history.push({
        taskId: message.taskId,
        recipientName: this.currentRecipient.name,
        message: message.content,
        timestamp: message.time,
        type: 'sent'
      });
      localStorage.setItem('messageHistory', JSON.stringify(history));
    },
// 发送消息
    async sendMessage() {
      if (!this.contactMessage.trim()) {
        this.$message.warning('请输入消息内容');
        return;
      }

      try {
        // 确保有当前用户ID
        if (!this.currentUserId) {
          await this.getCurrentUserId();
          if (!this.currentUserId) {
            this.$message.error('无法获取用户ID');
            return;
          }
        }

        // 构造消息数据
        const messageData = {
          crid: this.currentTask.id,  // 任务/请求ID
          cuid: this.currentUserId,   // 发送者ID（志愿者）
          ccontent: this.contactMessage.trim(),
          ctime: new Date().toISOString()
        };

        // 调用后端接口发送消息
        const response = await request.post('http://localhost:81/chat/message', messageData);

        if (response && response.code === 200) {
          // 添加到本地消息列表
          const newMessage = {
            id: response.data.cid,
            taskId: response.data.crid,
            sender: 'volunteer',
            content: response.data.ccontent,
            time: new Date(response.data.ctime).toLocaleTimeString()
          };

          // 如果聊天对话框是打开的，则添加到消息列表
          if (this.showChatModal) {
            this.chatMessages.push(newMessage);
            this.$nextTick(() => {
              this.scrollChatToBottom();
            });
          }

          // 保存消息到历史记录
          this.saveMessageToHistory(newMessage);

          // 清空输入框
          this.contactMessage = '';

          // 关闭联系模态框，打开聊天对话框
          this.showContactModal = false;
          this.showChatModal = true;

          this.$message.success('消息发送成功');

          // 重新加载任务聊天记录
          await this.loadTaskChatRecords();
        } else {
          this.$message.error(response?.msg || '发送消息失败');
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        this.$message.error('发送消息失败');
      }
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
    },

    // 新增：加载任务聊天记录
    async loadTaskChatRecords() {
      try {
        const completedTasks = this.userData.helpRecords.filter(
            record => record.status === '已完成'
        );

        const taskChats = [];

        for (const task of completedTasks) {
          try {
            const response = await request.get(`http://localhost:81/chat/${task.r_id}`);

            if (response && response.code === 200 && response.data.length > 0) {
              if (!this.currentUserId) {
                await this.getCurrentUserId();
              }

              const messages = response.data.map(item => ({
                id: item.cid,
                taskId: item.crid,
                sender: item.cuid === this.currentUserId ? 'volunteer' : 'recipient',
                content: item.ccontent,
                time: new Date(item.ctime).toLocaleString()
              }));
console.log(messages,"messages我的");
              messages.sort((a, b) => new Date(a.time) - new Date(b.time));

              // 修改这里：添加需求内容字段
              const taskChat = {
                taskId: task.r_id,
                taskName: task.name,
                taskType: task.type || task.needType,
                taskNeeds: task.needs, // 添加需求内容
                status: task.status,
                messages: messages,
                lastMessageTime: messages.length > 0 ? messages[messages.length - 1].time : '',
                messageCount: messages.length
              };

              taskChats.push(taskChat);
            }
          } catch (error) {
            console.warn(`获取任务 ${task.r_id} 的聊天记录失败:`, error);
          }
        }

        taskChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        this.taskChatRecords = taskChats;
      } catch (error) {
        console.error('加载任务聊天记录失败:', error);
      }
    },

    // 查看完整对话
    viewFullChat(taskChat) {
      this.currentRecipient = {
        id: taskChat.taskId,
        name: taskChat.taskName,
        taskInfo: `${taskChat.taskType} - ${taskChat.taskId}`
      };
      this.chatMessages = taskChat.messages;
      this.showChatModal = true;
    },
  },


  async mounted() {
         // 获取当前用户ID
        await this.getCurrentUserId();
        await this.loadHelpList();
        await this.loadHelpRecords();
        await this.loadAcceptedTasks(); // 新增方法，加载已接取但未完成的任务
        this.loadUserData();
        this.loadMessageHistory(); // 加载消息历史记录
        await this.loadTaskChatRecords(); // 加载任务聊天记录
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

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.task-status-badge {
  background-color: #4CAF50;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 10px;
}

.chat-disabled-notice {
  text-align: center;
  padding: 15px;
  color: #999;
  font-style: italic;
  border-top: 1px solid #eee;
}

.chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chat-modal-content {
  background-color: white;
  width: 80%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.chat-modal-header {
  padding: 15px;
  background-color: #4CAF50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.message {
  margin-bottom: 10px;
  max-width: 80%;
}

.message.sent {
  margin-left: auto;
  text-align: right;
}

.message.received {
  margin-right: auto;
  text-align: left;
}

.message-content {
  padding: 8px 12px;
  border-radius: 18px;
  display: inline-block;
}

.message.sent .message-content {
  background-color: #4CAF50;
  color: white;
}

.message.received .message-content {
  background-color: #f1f1f1;
  color: #333;
}

.message-time {
  font-size: 0.8em;
  color: #777;
  margin-top: 4px;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #eee;
  display: flex;
}

.chat-input textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  height: 60px;
}

.chat-input button {
  margin-left: 10px;
  padding: 0 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.chat-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  text-align: center;
}

.chat-note {
  color: #666;
  font-size: 14px;
  font-style: italic;
  margin: 0;
}

/* 调整任务操作按钮样式 */
.task-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.contact-btn {
  background-color: #2196F3;
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

.cancel-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.complete-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.complete-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  transition: background-color 0.3s;
}

.complete-btn:hover {
  background-color: #45a049;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #d32f2f;
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
  position: relative;
  display: flex;
  align-items: center;
  font-size: 20px;
}

.card h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.card h3 i {
  margin-right: 12px;
  color: #4CAF50;
  font-size: 22px;
}

.filter-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-form select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: white;
  min-width: 120px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.filter-form select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.filter-form select:hover {
  border-color: #4CAF50;
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 18px;
  padding: 24px 20px;
  transition: box-shadow 0.2s, border 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
}

.help-item:hover {
  box-shadow: 0 6px 24px rgba(76,175,80,0.10);
  border-width: 2.5px;
}

.urgency-normal-bg {
  background: linear-gradient(90deg, #e8fbe5 0%, #d2f8d2 100%);
  border-color: #4CAF50;
}

.urgency-urgent-bg {
  background: linear-gradient(90deg, #fffbe5 0%, #fff3c2 100%);
  border-color: #FFC107;
}

.urgency-emergency-bg {
  background: linear-gradient(90deg, #ffeaea 0%, #ffd6d6 100%);
  border-color: #F44336;
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

/* 任务信息表格样式 */
.task-info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.task-info-table tr {
  position: relative;
}

.task-info-table tr:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
}

.task-info-table tr:last-child {
  border-bottom: none;
}

.task-info-table td {
  padding: 8px 0;
  vertical-align: top;
  font-size: 16px;
}

.task-info-table .label {
  color: #000;
  font-weight: 500;
  width: 80px;
  min-width: 80px;
}

.task-info-table td:last-child {
  color: #000;
  word-break: break-word;
  position: relative;
  padding-bottom: 4px;
}

.task-info-table td:last-child::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  opacity: 0.6;
  border-radius: 1px;
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 18px;
  padding: 24px 20px;
  transition: box-shadow 0.2s, border 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
}

.urgency-normal-bg.emergency-item {
  background: linear-gradient(90deg, #e8fbe5 0%, #d2f8d2 100%);
  border-color: #4CAF50;
}

.urgency-urgent-bg.emergency-item {
  background: linear-gradient(90deg, #fffbe5 0%, #fff3c2 100%);
  border-color: #FFC107;
}

.urgency-emergency-bg.emergency-item {
  background: linear-gradient(90deg, #ffeaea 0%, #ffd6d6 100%);
  border-color: #F44336;
}

.emergency-item:hover {
  box-shadow: 0 6px 24px rgba(76,175,80,0.10);
  border-width: 2.5px;
}

.emergency-item h4 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 18px;
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
  padding: 20px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
  position: relative;
  overflow: hidden;
}

.points-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(76, 175, 80, 0.1) 50%, transparent 70%);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}

.points-display span {
  font-weight: bold;
  color: #2c3e50;
  font-size: 36px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
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
  position: relative;
}

.task-detail-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 1px;
  box-shadow: 0 1px 3px rgba(76, 175, 80, 0.2);
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
  color: #1976d2;
  font-weight: 500;
}

.urgency-urgent {
  color: #f57c00;
  font-weight: 500;
}

.urgency-emergency {
  color: #d32f2f;
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
  position: relative;
}

.contact-modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 1px;
  box-shadow: 0 1px 3px rgba(76, 175, 80, 0.2);
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
  max-height: 800px; /* 增加高度 */
  min-height: 400px; /* 设置最小高度 */
}

.empty-messages {
  text-align: center;
  color: #666;
  padding: 60px 0; /* 增加内边距 */
  font-size: 16px; /* 增加字体大小 */
}

.task-chat-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 增加间距 */
}

.task-chat-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px; /* 增加内边距 */
  transition: all 0.3s ease;
  margin-bottom: 16px; /* 增加底部间距 */
}

.task-chat-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); /* 增加阴影 */
}

.task-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  position: relative;
}

.task-chat-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e9ecef, transparent);
  border-radius: 1px;
}

.task-info h4 {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 18px;
}

.task-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.task-id, .task-type, .message-count {
  color: #666;
  font-size: 13px;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.message-count {
  color: #4CAF50;
  font-weight: 500;
}

.task-summary {
  text-align: right;
  font-size: 13px;
  color: #666;
}

.last-time {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.task-chat-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  position: relative;
}

.task-chat-actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e9ecef, transparent);
  border-radius: 1px;
}

.view-full-chat {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px; /* 增加内边距 */
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500; /* 添加字体粗细 */
}

.view-full-chat:hover {
  background: #3d8b40;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.view-full-chat i {
  font-size: 14px;
}
</style>