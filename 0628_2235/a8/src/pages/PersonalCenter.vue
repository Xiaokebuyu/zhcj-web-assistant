<template>
  <div class="profile-layout" v-if="user.account">
    <h1 class="profile-title">个人中心</h1>
    <div class="profile-main">
      <!-- 左侧菜单 -->
      <div class="profile-menu">
        <div v-for="item in menuList" :key="item.key" :class="['menu-item', {active: currentMenu===item.key}]" @click="switchMenu(item.key)">
          <i :class="item.icon"></i> {{ item.label }}
        </div>
      </div>
      <!-- 右侧内容区 -->
      <div class="profile-content">
        <div v-if="currentMenu==='info'" class="block">
          <div class="block-title">个人信息</div>

          <!-- 添加签到模块 -->
          <!-- 修改后的签到模块 -->
          <div v-if="user.type === 'volunteer'" class="checkin-section">
            <div class="checkin-card" :class="{ 'checked-in': hasCheckedIn }">
              <div class="checkin-left">
                <div class="checkin-icon">
                  <i v-if="hasCheckedIn" class="fas fa-check-circle"></i>
                  <i v-else class="far fa-calendar-check"></i>
                </div>
                <div class="checkin-info">
                  <h4 v-if="hasCheckedIn">今日已签到</h4>
                  <h4 v-else>今日未签到</h4>
                  <p v-if="hasCheckedIn">已连续签到 {{ consecutiveDays }} 天</p>
                  <p v-else>签到可获得 {{ todayPoints }} 积分</p>
                </div>
              </div>
              <button
                  class="checkin-btn"
                  :class="{ 'checked-in': hasCheckedIn }"
                  @click="handleCheckIn"
                  :disabled="hasCheckedIn"
              >
                {{ hasCheckedIn ? '已签到' : '立即签到' }}
              </button>
            </div>
            <!-- 移除了checkin-calendar部分 -->
          </div>
          <!-- 签到模块结束 -->
          <!-- 签到模块结束 -->

          <div class="info-edit-area">
            <table class="info-table" v-if="!isEditing">
              <tbody>
                <tr>
                  <td class="info-label">用户名：</td>
                  <td class="info-value">{{ user.account }}</td>
                </tr>
                <tr>
                  <td class="info-label">手机号：</td>
                  <td class="info-value">{{ user.phone }}</td>
                </tr>
                <tr>
                  <td class="info-label">身份：</td>
                  <td class="info-value">{{ user.type==='volunteer' ? '志愿者' : '求助者' }}</td>
                </tr>
                <tr>
                  <td class="info-label">实名认证：</td>
                  <td class="info-value">
                    <span v-if="user.isVerified" class="verified-tag">已认证</span>
                    <span v-else class="unverified-tag">未认证</span>
                  </td>
                </tr>
                <tr v-if="user.isVerified">
                  <td class="info-label">姓名：</td>
                  <td class="info-value">{{ user.realName }}</td>
                </tr>
                <tr v-if="user.isVerified">
                  <td class="info-label">身份证：</td>
                  <td class="info-value">{{ maskIdCard(user.idCard) }}</td>
                </tr>
                <tr>
                  <td class="info-label">地址：</td>
                  <td class="info-value">{{ user.province }} {{ user.city }} {{ user.district }}</td>
                </tr>
                <tr>
                  <td class="info-label">个人介绍：</td>
                  <td class="info-value">{{ user.intro || '暂无介绍' }}</td>
                </tr>
                <tr v-if="user.type==='disabled'">
                  <td class="info-label">残疾类型：</td>
                  <td class="info-value">{{ user.disabledTypes.join(', ') || '未设置' }}</td>
                </tr>
                <tr v-if="user.type==='volunteer'">
                  <td class="info-label">性格标签：</td>
                  <td class="info-value">{{ user.tags.join(', ') || '未设置' }}</td>
                </tr>
              </tbody>
            </table>
            <form v-else class="info-form" @submit.prevent="saveInfo">
              <div v-if="!user.isVerified" class="form-group">
                <label>实名认证</label>
                <div class="verify-group">
                  <input v-model="editForm.realName" placeholder="真实姓名" class="verify-input">
                  <input v-model="editForm.idCard" placeholder="身份证号码" class="verify-input">
                </div>
              </div>
              <div class="form-group">
                <label>地址</label>
                <div class="address-group">
                  <input v-model="editForm.province" placeholder="省">
                  <input v-model="editForm.city" placeholder="市">
                  <input v-model="editForm.district" placeholder="区/县">
                </div>
              </div>
              <div class="form-group">
                <label>个人介绍</label>
                <textarea v-model="editForm.intro" placeholder="简单介绍一下自己"></textarea>
              </div>
              <div v-if="user.type==='disabled'" class="form-group">
                <label>残疾类型（可多选）</label>
                <div class="tag-group">
                  <label v-for="type in disabledTypeOptions" :key="type" :class="['tag-btn', {selected: editForm.disabledTypes.includes(type)}]">
                    <input type="checkbox" :value="type" v-model="editForm.disabledTypes"> {{ type }}
                  </label>
                </div>
              </div>
              <div v-if="user.type==='volunteer'" class="form-group">
                <label>性格标签（可多选）</label>
                <div class="tag-group">
                  <label v-for="tag in volunteerTags" :key="tag" :class="['tag-btn', {selected: editForm.tags.includes(tag)}]">
                    <input type="checkbox" :value="tag" v-model="editForm.tags"> {{ tag }}
                  </label>
                </div>
              </div>
            </form>
            <div class="info-actions">
              <button v-if="!isEditing" @click="startEdit" class="edit-btn">编辑信息</button>
              <template v-else>
                <button @click="saveInfo" class="save-btn">保存</button>
                <button @click="cancelEdit" class="cancel-btn">取消</button>
              </template>
            </div>
          </div>
        </div>
        <div v-if="currentMenu==='help' && user.type==='disabled'" class="block">
          <div class="block-title">求助信息</div>
          <div class="help-list">
            <div class="help-item" v-for="item in paginatedDisabledHelpList" :key="item.id">
              <div class="help-date">{{ item.date }}</div>
              <div class="help-info">
                <div class="help-type">{{ item.type }}</div>
                <div class="help-volunteer">志愿者：{{ item.volunteer }}</div>
                <div :class="['help-status', item.status === '已完成' ? 'completed' : item.status === '进行中' ? 'ongoing' : 'pending']">
                  {{ item.status }}
                </div>
              </div>
            </div>
          </div>
          <div class="pagination" v-if="disabledHelpList.length > pageSize">
            <button 
              :class="['page-btn', { disabled: currentPage === 1 }]"
              @click="currentPage > 1 && (currentPage--)"
            >上一页</button>
            <span class="page-info">{{ currentPage }} / {{ Math.ceil(disabledHelpList.length / pageSize) }}</span>
            <button 
              :class="['page-btn', { disabled: currentPage >= Math.ceil(disabledHelpList.length / pageSize) }]"
              @click="currentPage < Math.ceil(disabledHelpList.length / pageSize) && (currentPage++)"
            >下一页</button>
          </div>
        </div>
        <div v-if="currentMenu==='help' && user.type==='volunteer'" class="block">
          <div class="block-title">帮助信息</div>
          <div class="help-list">
            <div class="help-item" v-for="item in paginatedVolunteerHelpList" :key="item.id">
              <div class="help-date">{{ item.date }}</div>
              <div class="help-info">
                <div class="help-type">{{ item.type }}</div>
                <div class="help-user">服务对象：{{ item.user }}</div>
                <div :class="['help-status', item.status === '已完成' ? 'completed' : item.status === '进行中' ? 'ongoing' : 'pending']">
                  {{ item.status }}
                </div>
              </div>
            </div>
          </div>
          <div class="pagination" v-if="volunteerHelpList.length > pageSize">
            <button 
              :class="['page-btn', { disabled: helpPage === 1 }]"
              @click="helpPage > 1 && (helpPage--)"
            >上一页</button>
            <span class="page-info">{{ helpPage }} / {{ Math.ceil(volunteerHelpList.length / pageSize) }}</span>
            <button 
              :class="['page-btn', { disabled: helpPage >= Math.ceil(volunteerHelpList.length / pageSize) }]"
              @click="helpPage < Math.ceil(volunteerHelpList.length / pageSize) && (helpPage++)"
            >下一页</button>
          </div>
        </div>
        <div v-if="currentMenu==='rate' && user.type==='disabled'" class="block">
          <div class="block-title">评价记录</div>
          <div class="help-list">
            <div class="help-item" v-for="item in paginatedDisabledRatedHelpList" :key="item.id">
              <div class="help-date">{{ item.date }}</div>
              <div class="help-info">
                <div class="help-type">{{ item.type }}</div>
                <div class="help-volunteer">志愿者：{{ item.volunteer }}</div>
                <div class="help-rating">
                  <span class="star" v-for="n in 5" :key="n">{{ n <= item.rating ? '★' : '☆' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="pagination" v-if="disabledHelpList.filter(i => i.rating).length > pageSize">
            <button 
              :class="['page-btn', { disabled: helpPage === 1 }]"
              @click="helpPage > 1 && (helpPage--)"
            >上一页</button>
            <span class="page-info">{{ helpPage }} / {{ Math.ceil(disabledHelpList.filter(i => i.rating).length / pageSize) }}</span>
            <button 
              :class="['page-btn', { disabled: helpPage >= Math.ceil(disabledHelpList.filter(i => i.rating).length / pageSize) }]"
              @click="helpPage < Math.ceil(disabledHelpList.filter(i => i.rating).length / pageSize) && (helpPage++)"
            >下一页</button>
          </div>
        </div>
        <div v-if="currentMenu==='rate' && user.type==='volunteer'" class="block">
          <div class="block-title">个人评价得分</div>
          <div class="rating-summary">
            <div class="average-rating">
              <div class="rating-score">{{ averageRating.toFixed(1) }}</div>
              <div class="rating-stars">
                <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= Math.round(averageRating) }">
                  {{ n <= Math.round(averageRating) ? '★' : '☆' }}
                </span>
              </div>
              <div class="rating-text">平均评分</div>
            </div>
            <div class="rating-stats">
              <div class="stat-item">
                <span class="stat-label">总评价数：</span>
                <span class="stat-value">{{ totalRatings }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">5星评价：</span>
                <span class="stat-value">{{ fiveStarCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">4星评价：</span>
                <span class="stat-value">{{ fourStarCount }}</span>
              </div>
            </div>
          </div>
          <div class="rating-details">
            <h4>详细评价记录</h4>
            <div class="rating-list">
              <div v-for="item in paginatedRatedHelpList" :key="item.id" class="rating-item">
                <div class="rating-date">{{ item.date }}</div>
                <div class="rating-info">
                  <div class="rating-type">{{ item.type }}</div>
                  <div class="rating-user">服务对象：{{ item.user }}</div>
                  <div class="rating-stars">
                    <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= item.rating }">
                      {{ n <= item.rating ? '★' : '☆' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="pagination" v-if="ratedHelpList.length > pageSize">
              <button 
                :class="['page-btn', { disabled: ratePage === 1 }]"
                @click="ratePage > 1 && (ratePage--)"
              >上一页</button>
              <span class="page-info">{{ ratePage }} / {{ Math.ceil(ratedHelpList.length / pageSize) }}</span>
              <button 
                :class="['page-btn', { disabled: ratePage >= Math.ceil(ratedHelpList.length / pageSize) }]"
                @click="ratePage < Math.ceil(ratedHelpList.length / pageSize) && (ratePage++)"
              >下一页</button>
            </div>
          </div>
        </div>
        <div v-if="currentMenu==='score' && user.type==='volunteer'" class="block">
          <div class="block-title">个人积分得分</div>
          <div class="score-display">
            <div class="score-value">{{ user.uscore }}</div>
            <div class="score-label">当前积分</div>
            <div class="score-description">
              积分获取规则：
              <br>
              - 获得5星评价：+3分<br>
              - 获得4星评价：+2分<br>
              - 每日签到：+2分
              <br>完成帮扶任务   <br>
              --线上任务：一般:+3分 较急:+5分 紧急:+7分
              <br>
              --线下任务：一般:+5分 较急:+7分 紧急:+10分<br>

            </div>
          </div>
        </div>
        <div v-if="currentMenu==='setting'" class="block">
          <div class="block-title">账号设置</div>
          <div class="profile-actions">
            <button @click="showChangePwd = !showChangePwd">修改密码</button>
            <button @click="logout">退出登录</button>
          </div>
          <!-- 修改密码表单 -->
          <div v-if="showChangePwd" class="password-form">
            <div class="form-group">
              <label>原密码</label>
              <input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  @input="clearError('oldPassword')"
              >
              <div v-if="errors.oldPassword" class="error-message">{{ errors.oldPassword }}</div>
            </div>

            <div class="form-group">
              <label>新密码</label>
              <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="至少6位字符"
                  @input="validatePassword"
              >
              <div v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</div>
            </div>

            <div class="form-group">
              <label>确认密码</label>
              <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="再次输入新密码"
                  @blur="checkPasswordMatch"
              >
              <div v-if="!passwordMatch" class="error-message">两次输入的密码不一致</div>
            </div>

            <button
                @click="submitPasswordChange"
                :disabled="isSubmitting || !isFormValid"
                class="submit-btn"
            >
              {{ isSubmitting ? '处理中...' : '确认修改' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';


export default {
  name: 'PersonCenter',
  data() {
    return {
      user: {
        account: '',
        phone: '',
        type: '',
        province: '',
        city: '',
        district: '',
        intro: '',
        disabledTypes: [],
        tags: [],
        realName: '',
        idCard: '',
        isVerified: false,
        uscore: 0,   //添加积分字段
      },
      isEditing: false,
      editForm: {
        province: '',
        city: '',
        district: '',
        intro: '',
        disabledTypes: [],
        tags: [],
        realName: '',
        idCard: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      errors: {
        oldPassword: '',
        newPassword: ''
      },
      passwordMatch: true,
      isSubmitting: false,
      showChangePwd: false,

      // 新增签到相关数据
      hasCheckedIn: false,      // 今日是否已签到
      consecutiveDays: 0,       // 连续签到天数
      todayPoints: 1,           // 今日签到可获得积分
      checkinRecords: [],       // 签到记录
      currentDate: new Date(),  // 当前日期
      currentMenu: 'info',
      disabledTypeOptions: ['听力障碍','视力障碍','语言障碍','行动障碍','其他'],
      disabledMap:{
        '听力障碍' : 1,
        '视力障碍' : 2,
        '语言障碍' : 3,
        '行动障碍' : 4,
        '其他' : 5
      },
      volunteerTags: ['开朗','乐观','细心','耐心','热情','责任心强','善于沟通','有爱心'],
      volunteerMap:{
        '开朗':6,
        '乐观':7,
        '细心':8,
        '耐心':9,
        '热情':10,
        '责任心强':11,
        '善于沟通':12,
        '有爱心':13
      },

      // 分页相关数据
      pageSize: 5,
      currentPage: 1,
      // 独立的分页状态
      helpPage: 1,
      ratePage: 1,
      // 志愿者帮助信息
      volunteerHelpList: [
        { id: 1, date: '2024-06-01', type: '陪同就医', status: '已完成', user: '张先生', rating: 5 },
        { id: 2, date: '2024-06-03', type: '生活照料', status: '进行中', user: '李阿姨', rating: null },
        { id: 3, date: '2024-06-05', type: '心理咨询', status: '已完成', user: '王女士', rating: 5 },
        { id: 4, date: '2024-06-07', type: '家政服务', status: '已完成', user: '赵爷爷', rating: 4 },
        { id: 5, date: '2024-06-09', type: '陪同购物', status: '已完成', user: '刘奶奶', rating: 5 },
        { id: 6, date: '2024-06-11', type: '康复训练', status: '待开始', user: '孙先生', rating: null },
        { id: 7, date: '2024-06-13', type: '文化娱乐', status: '已完成', user: '钱女士', rating: 5 },
        { id: 8, date: '2024-06-15', type: '陪同就医', status: '已完成', user: '周阿姨', rating: 4 },
        { id: 9, date: '2024-06-17', type: '生活照料', status: '进行中', user: '吴爷爷', rating: null },
        { id: 10, date: '2024-06-19', type: '心理咨询', status: '待开始', user: '郑女士', rating: null },
        { id: 11, date: '2024-06-21', type: '家政服务', status: '已完成', user: '王先生', rating: 5 },
        { id: 12, date: '2024-06-23', type: '陪同购物', status: '已完成', user: '李奶奶', rating: 5 }
      ],
      // 求助者求助信息
      disabledHelpList: [
        { id: 1, date: '2024-06-01', type: '就医陪诊', status: '已完成', volunteer: '张志愿', rating: 5 },
        { id: 2, date: '2024-06-03', type: '康复训练', status: '进行中', volunteer: '李志愿', rating: null },
        { id: 3, date: '2024-06-05', type: '心理咨询', status: '已完成', volunteer: '王志愿', rating: 4 },
        { id: 4, date: '2024-06-07', type: '生活照料', status: '已完成', volunteer: '赵志愿', rating: 5 },
        { id: 5, date: '2024-06-09', type: '文化娱乐', status: '已完成', volunteer: '刘志愿', rating: 5 },
        { id: 6, date: '2024-06-11', type: '家政服务', status: '待开始', volunteer: '孙志愿', rating: null },
        { id: 7, date: '2024-06-13', type: '陪同购物', status: '已完成', volunteer: '钱志愿', rating: 4 },
        { id: 8, date: '2024-06-15', type: '就医陪诊', status: '已完成', volunteer: '周志愿', rating: 5 },
        { id: 9, date: '2024-06-17', type: '康复训练', status: '进行中', volunteer: '吴志愿', rating: null },
        { id: 10, date: '2024-06-19', type: '心理咨询', status: '待开始', volunteer: '郑志愿', rating: null },
        { id: 11, date: '2024-06-21', type: '生活照料', status: '已完成', volunteer: '冯志愿', rating: 5 },
        { id: 12, date: '2024-06-23', type: '文化娱乐', status: '已完成', volunteer: '陈志愿', rating: 5 }
      ]
    }
  },
  computed: {
    // 新增计算属性：生成日历天数数组

    // 计算属性：生成日历天数数组
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const today = new Date();

      // 获取当月第一天
      const firstDay = new Date(year, month, 1);
      // 获取当月最后一天
      const lastDay = new Date(year, month + 1, 0);
      // 获取第一天是星期几 (0-6)
      const firstDayOfWeek = firstDay.getDay();

      // 生成日历数组
      const days = [];

      // 添加上个月的最后几天
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          isCurrentMonth: false,
          checked: false,
          isToday: false,
          isFuture: false
        });
      }

      // 添加当月的天数
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        const isToday = date.toDateString() === today.toDateString();
        const isFuture = date > today;
        const isChecked = this.checkinRecords.some(record => {
          const recordDate = new Date(record.date);
          return recordDate.getDate() === i &&
              recordDate.getMonth() === month &&
              recordDate.getFullYear() === year;
        });

        days.push({
          day: i,
          isCurrentMonth: true,
          checked: isChecked,
          isToday: isToday,
          isFuture: isFuture
        });
      }

      // 添加下个月的前几天
      const daysNeeded = 42 - days.length; // 6行7列
      for (let i = 1; i <= daysNeeded; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          checked: false,
          isToday: false,
          isFuture: true
        });
      }

      return days;
    },
    menuList() {
      if (this.user.type === 'disabled') {
        return [
          { key: 'info', label: '个人信息', icon: 'el-icon-user' },
          { key: 'help', label: '求助信息', icon: 'el-icon-s-help' },
          { key: 'rate', label: '评价记录', icon: 'el-icon-star-on' },
          { key: 'setting', label: '账号设置', icon: 'el-icon-setting' }
        ];
      } else if (this.user.type === 'volunteer') {
        return [
          { key: 'info', label: '个人信息', icon: 'el-icon-user' },
          { key: 'help', label: '帮助信息', icon: 'el-icon-s-custom' },
          { key: 'rate', label: '个人评分', icon: 'el-icon-star-on' },
          { key: 'score', label: '个人积分', icon: 'el-icon-medal' },
          { key: 'setting', label: '账号设置', icon: 'el-icon-setting' }
        ];
      } else {
        return [];
      }
    },
    paginatedVolunteerHelpList() {
      const start = (this.helpPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.volunteerHelpList.slice(start, end);
    },
    paginatedDisabledHelpList() {
      const start = (this.helpPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.disabledHelpList.slice(start, end);
    },
    isFormValid() {
      return (
          this.passwordForm.oldPassword &&
          this.passwordForm.newPassword &&
          this.passwordForm.confirmPassword &&
          this.passwordMatch &&
          !this.errors.newPassword
      );
    },
    // 评分相关计算属性
    ratedHelpList() {
      return this.volunteerHelpList.filter(item => item.rating !== null);
    },
    averageRating() {
      const ratedItems = this.volunteerHelpList.filter(item => item.rating !== null);
      if (ratedItems.length === 0) return 0;
      const totalRating = ratedItems.reduce((sum, item) => sum + item.rating, 0);
      return totalRating / ratedItems.length;
    },
    totalRatings() {
      return this.volunteerHelpList.filter(item => item.rating !== null).length;
    },
    fiveStarCount() {
      return this.volunteerHelpList.filter(item => item.rating === 5).length;
    },
    fourStarCount() {
      return this.volunteerHelpList.filter(item => item.rating === 4).length;
    },
    paginatedRatedHelpList() {
      const start = (this.ratePage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.ratedHelpList.slice(start, end);
    },
    paginatedDisabledRatedHelpList() {
      const ratedItems = this.disabledHelpList.filter(i => i.rating);
      const start = (this.helpPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return ratedItems.slice(start, end);
    }
  },
  created() {
    this.loadUser();
    // 先从本地存储加载签到状态
    const today = new Date().toDateString();
    const lastCheckInDate = localStorage.getItem('lastCheckInDate');
    this.hasCheckedIn = lastCheckInDate === today;
    this.consecutiveDays = parseInt(localStorage.getItem('consecutiveDays')) || 0;
    // 然后从服务器加载签到记录
    this.loadCheckInData();
    if (!localStorage.getItem('userPhone')) {
      this.$router.replace('/LoginPage');
    }
  },
  methods: {
// 处理签到逻辑
// 修改后的handleCheckIn方法
    async handleCheckIn() {
      if (this.hasCheckedIn) return;

      try {
        this.$confirm('确定要签到吗?', '签到确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(async () => {
          const response = await request.post('http://localhost:81/signin');

          if (response.code === 200) {
            const today = new Date();
            const todayStr = today.toDateString();

            // 更新状态
            this.hasCheckedIn = true;
            this.todayPoints = response.data;
            this.user.uscore += this.todayPoints;

            // 更新签到记录
            this.checkinRecords.unshift({
              date: today.toISOString(),
              points: this.todayPoints
            });

            // 更新本地存储
            localStorage.setItem('lastCheckInDate', todayStr);
            localStorage.setItem('hasCheckedIn', 'true');
            localStorage.setItem('userUscore', this.user.uscore.toString());

            // 计算连续签到天数
            this.calculateConsecutiveDays();
            localStorage.setItem('consecutiveDays', this.consecutiveDays.toString());

            this.$message.success(`签到成功！获得${this.todayPoints}积分`);
          } else {
            this.$message.error(response.msg || '签到失败');
          }
        });
      } catch (error) {
        console.error('签到失败:', error);
        this.$message.error('签到失败，请稍后重试');
      }
    },

// 修改后的loadCheckInData方法
    async loadCheckInData() {
      try {
        const response = await request.get('http://localhost:81/signin/records', {
          params: {
            pageNum: 1,
            pageSize: 31
          }
        });

        if (response.code === 200) {
          this.checkinRecords = response.data.records.map(record => ({
            date: new Date(record.sTime).toISOString(),
            points: record.sScore
          }));

          // 检查今天是否已签到
          const today = new Date().toDateString();
          const todayChecked = this.checkinRecords.some(record =>
              new Date(record.date).toDateString() === today
          );

          // 更新本地存储和状态
          this.hasCheckedIn = todayChecked;
          if (todayChecked) {
            localStorage.setItem('lastCheckInDate', today);
          }

          // 重新计算连续签到天数
          this.calculateConsecutiveDays();
        }
      } catch (error) {
        console.error('获取签到记录失败:', error);
        // 回退到本地存储的数据
        const today = new Date().toDateString();
        const lastCheckInDate = localStorage.getItem('lastCheckInDate');
        this.hasCheckedIn = lastCheckInDate === today;
        this.consecutiveDays = parseInt(localStorage.getItem('consecutiveDays')) || 0;
      }
    },

    // 计算连续签到天数
    calculateConsecutiveDays() {
      if (!this.checkinRecords || this.checkinRecords.length === 0) {
        this.consecutiveDays = 0;
        return;
      }

      // 按日期从新到旧排序
      const sortedRecords = [...this.checkinRecords].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      let consecutive = 0;
      let prevDate = null;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // 检查今天是否已签到
      const todayChecked = sortedRecords.some(record =>
          new Date(record.date).toDateString() === today.toDateString()
      );

      if (!todayChecked && this.hasCheckedIn) {
        // 如果本地存储显示今天已签到但记录中没有，添加虚拟记录
        sortedRecords.unshift({
          date: today.toISOString(),
          points: this.todayPoints
        });
      }

      for (let i = 0; i < sortedRecords.length; i++) {
        const currentDate = new Date(sortedRecords[i].date);

        if (i === 0) {
          // 第一条记录
          if (currentDate.toDateString() === today.toDateString()) {
            consecutive = 1;
          } else if (currentDate.toDateString() === yesterday.toDateString()) {
            consecutive = this.hasCheckedIn ? 2 : 1;
          }
          prevDate = currentDate;
          continue;
        }

        // 检查是否是连续的前一天
        const expectedDate = new Date(prevDate);
        expectedDate.setDate(expectedDate.getDate() - 1);

        if (currentDate.toDateString() === expectedDate.toDateString()) {
          consecutive++;
          prevDate = currentDate;
        } else {
          // 如果不是连续的前一天，中断计算
          break;
        }
      }

      this.consecutiveDays = consecutive;
    },

    maskIdCard(idCard) {
      if (!idCard) return '';
      return idCard.substring(0, 6) + '********' + idCard.substring(14);
    },
    async loadUser() {
      try {
        // 从后端获取当前用户信息
        const response = await request.get('http://localhost:81/user/current', { withCredentials: true });

        if (response.code === 200 && response.data) {
          const userData = response.data;

          // 更新本地用户数据
          this.user.account = userData.uname || localStorage.getItem('userName') || '';
          this.user.phone = userData.uPhone || localStorage.getItem('userPhone') || '';
          this.user.type = userData.uType || localStorage.getItem('userType') || '';
          this.user.province = userData.uProvince || localStorage.getItem('userProvince') || '';
          this.user.city = userData.uCity || localStorage.getItem('userCity') || '';
          this.user.district = userData.uDistrict || localStorage.getItem('userDistrict') || '';
          this.user.intro = userData.uInfo || localStorage.getItem('userIntro') || '';
          this.user.realName = userData.uRealName || localStorage.getItem('userRealName') || '';
          this.user.idCard = userData.uIdentityNumber || localStorage.getItem('userIdCard') || '';
          this.user.isVerified = !!userData.uRealName || localStorage.getItem('userIsVerified') === 'true';
          this.user.uscore = userData.uscore || 0; // 获取积分数据

          // 处理标签
          const labelNumbers = userData.uLabel ? userData.uLabel.split(',').map(Number) :
              JSON.parse(localStorage.getItem('userLabelNumbers') || '[]');

          if (this.user.type === 'disabled') {
            this.user.disabledTypes = this.convertNumbersToTags(labelNumbers, 'disabled');
          } else if (this.user.type === 'volunteer') {
            this.user.tags = this.convertNumbersToTags(labelNumbers, 'volunteer');
          }

          // 更新本地存储
          localStorage.setItem('userAccount', this.user.account);
          localStorage.setItem('userPhone', this.user.phone);
          localStorage.setItem('userType', this.user.type);
          localStorage.setItem('userProvince', this.user.province);
          localStorage.setItem('userCity', this.user.city);
          localStorage.setItem('userDistrict', this.user.district);
          localStorage.setItem('userIntro', this.user.intro);
          localStorage.setItem('userRealName', this.user.realName);
          localStorage.setItem('userIdCard', this.user.idCard);
          localStorage.setItem('userIsVerified', this.user.isVerified.toString());
          localStorage.setItem('userLabelNumbers', JSON.stringify(labelNumbers));
        } else {
          // 如果接口请求失败，使用本地存储的数据
          this.loadFromLocalStorage();
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.loadFromLocalStorage();
      }

      if (!localStorage.getItem('userPhone')) {
        this.$router.replace('/LoginPage');
      }
    },

    loadFromLocalStorage() {
      this.user.account = localStorage.getItem('userAccount') || '';
      this.user.phone = localStorage.getItem('userPhone') || '';
      this.user.type = localStorage.getItem('userType') || '';
      this.user.province = localStorage.getItem('userProvince') || '';
      this.user.city = localStorage.getItem('userCity') || '';
      this.user.district = localStorage.getItem('userDistrict') || '';
      this.user.intro = localStorage.getItem('userIntro') || '';
      this.user.realName = localStorage.getItem('userRealName') || '';
      this.user.idCard = localStorage.getItem('userIdCard') || '';
      this.user.isVerified = localStorage.getItem('userIsVerified') === 'true';
      this.user.uscore = parseInt(localStorage.getItem('userUscore')) || 0;

      const labelNumbers = JSON.parse(localStorage.getItem('userLabelNumbers') || '[]');
      if (this.user.type === 'disabled') {
        this.user.disabledTypes = this.convertNumbersToTags(labelNumbers, 'disabled');
      } else if (this.user.type === 'volunteer') {
        this.user.tags = this.convertNumbersToTags(labelNumbers, 'volunteer');
      }
    },
    startEdit() {
      this.editForm = {
        province: this.user.province,
        city: this.user.city,
        district: this.user.district,
        intro: this.user.intro,
        disabledTypes: [...this.user.disabledTypes],
        tags: [...this.user.tags],
        realName: this.user.realName,
        idCard: this.user.idCard
      };
      this.isEditing = true;
    },

    // 将标签数组转换为数字数组
    convertTagsToNumbers(tags, type) {
      const map = type === 'disabled' ? this.disabledMap : this.volunteerMap;
      return tags.map(tag => map[tag]).filter(num => num !== undefined);
    },

    // 将数字数组转换回标签数组
    convertNumbersToTags(numbers, type) {
      const map = type === 'disabled' ? this.disabledMap : this.volunteerMap;
      const invertedMap = {};
      for (const key in map) {
        invertedMap[map[key]] = key;
      }
      return numbers.map(num => invertedMap[num]).filter(tag => tag !== undefined);
    },

    validateIdCard(idCard) {
      // 简单的身份证验证：18位，最后一位可以是数字或X
      const reg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      return reg.test(idCard);
    },
    async saveInfo() {
      // 如果是首次实名认证，进行验证
      if (!this.user.isVerified && (this.editForm.realName || this.editForm.idCard)) {
        if (!this.editForm.realName || !this.editForm.idCard) {
          alert('请填写完整的实名认证信息！');
          return;
        }
        if (!this.validateIdCard(this.editForm.idCard)) {
          alert('请输入正确的身份证号码！');
          return;
        }
      }
      try {
        const labelNumbers = this.user.type === 'disabled'
            ? this.convertTagsToNumbers(this.editForm.disabledTypes, 'disabled')
            : this.convertTagsToNumbers(this.editForm.tags, 'volunteer');

        const response = await request.put('http://localhost:81/user/update-info', {
          urealName: this.editForm.realName,
          uidentityNumber: this.editForm.idCard,
          uaddress: `${this.editForm.province} ${this.editForm.city} ${this.editForm.district}`,
          uinfo: this.editForm.intro,
          ulabel: labelNumbers.join(','), // 发送数字数组
        }, { withCredentials: true });

        if (response.code === 200) {
          // 更新本地存储
          if (!this.user.isVerified && this.editForm.realName && this.editForm.idCard) {
            this.user.isVerified = true;
            localStorage.setItem('userIsVerified', 'true');
            localStorage.setItem('userRealName', this.editForm.realName);
            localStorage.setItem('userIdCard', this.editForm.idCard);
          }

            localStorage.setItem('userProvince', this.editForm.province);
            localStorage.setItem('userCity', this.editForm.city);
            localStorage.setItem('userDistrict', this.editForm.district);
            localStorage.setItem('userIntro', this.editForm.intro);

          if (this.user.type === 'disabled') {
            localStorage.setItem('userDisabledTypes', JSON.stringify(this.editForm.disabledTypes));
          }
          if (this.user.type === 'volunteer') {
            localStorage.setItem('userTags', JSON.stringify(this.editForm.tags));
          }

          Object.assign(this.user, this.editForm);
          this.isEditing = false;
          alert('资料更新成功！');
        } else {
          alert(response.message || '资料更新失败');
        }
      } catch (error) {
        console.error('更新资料失败:', error);
        alert('更新资料失败，请稍后重试');
      }
    },
    cancelEdit() {
      this.isEditing = false;
    },
    logout() {
      localStorage.removeItem('userType');
      localStorage.removeItem('userAccount');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userProvince');
      localStorage.removeItem('userCity');
      localStorage.removeItem('userDistrict');
      localStorage.removeItem('userIntro');
      localStorage.removeItem('userDisabledTypes');
      localStorage.removeItem('userTags');
      localStorage.removeItem('userRealName');
      localStorage.removeItem('userIdCard');
      localStorage.removeItem('userIsVerified');
      window.dispatchEvent(new Event('storage'));
      alert('已退出登录');
      this.$router.replace('/login');
    },

    clearError(field) {
      this.errors[field] = '';
    },

    validatePassword() {
      const pwd = this.passwordForm.newPassword;
      if (pwd.length < 6) {
        this.errors.newPassword = '密码长度不能少于6位';
      } else {
        this.errors.newPassword = '';
      }
      this.checkPasswordMatch();
    },

    checkPasswordMatch() {
      this.passwordMatch = (
          this.passwordForm.newPassword === this.passwordForm.confirmPassword
      );
    },

    async submitPasswordChange() {
      if (!this.isFormValid) return;

      // 新增：检查新密码是否与旧密码相同
      if (this.passwordForm.newPassword === this.passwordForm.oldPassword) {
        this.errors.newPassword = '新密码不能与旧密码相同';
        return;
      }
      this.isSubmitting = true;
      try {
        const response = await request.put('http://localhost:81/user/update-password', {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword,
          reNewPassword: this.passwordForm.confirmPassword
        },{withCredentials:true});

        console.log(response);
        if (response.code === 200) {
          alert(response.message || '密码修改成功');
          this.showChangePwd = false;
          this.resetPasswordForm();
        } else if (response.code === 0){
          alert('旧密码输入错误！请重新输入');
          this.errors.oldPassword = response.message; // 可选：在表单显示错误
        } else {
          // 其他业务错误
          this.handleApiError(response);
        }
      } catch (error) {
        if (error instanceof Error && !error.response) {
          alert('网络连接错误，请稍后重试');
        } else {
          // 其他错误（如HTTP错误）交给特定处理器
          this.handleNetworkError(error);
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    resetPasswordForm() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.errors = {
        oldPassword: '',
        newPassword: ''
      };
      this.passwordMatch = true;
    },

    handleApiError(response) {
      if (response.msg.includes('旧密码')) {
        this.errors.oldPassword = response.msg;
      } else if (response.msg.includes('密码')) {
        this.errors.newPassword = response.msg;
      } else {
        alert(response.msg || '操作失败');
      }
    },

    handleNetworkError(error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            alert('登录已过期，请重新登录');
            this.$router.push('/login');
            break;
          default:
            alert(`请求错误: ${error.response.status}`);
        }
      } else {
        alert('网络连接错误，请稍后重试');
      }
    },
    switchMenu(key) {
      this.currentMenu = key;
      this.resetPagination();
    },
    resetPagination() {
      this.currentPage = 1;
      this.helpPage = 1;
      this.ratePage = 1;
    }
  }
}
</script>

<style scoped>
/* 新布局样式 */
.profile-title {
  font-size: 36px;
  font-weight: bold;
  margin: 16px 0 16px 0;
  text-align: left;
  padding-left: 32px;
}
.profile-layout {
  max-width: 1000px;
  margin: 40px auto 80px auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(74,108,247,0.08);
  padding-bottom: 40px;
  overflow: hidden;
  min-height: 90vh;
}
.profile-main {
  display: flex;
  flex-direction: row;
  min-height: 520px;
}
.profile-menu {
  width: 230px;
  background: #f7f9fc;
  border-radius: 0 0 0 0;
  padding: 40px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 2px 0 12px rgba(74,108,247,0.04);
  align-items: flex-end;
}
.menu-item {
  padding: 20px 40px 20px 28px;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  border-left: 4px solid transparent;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s;
  border-radius: 0 24px 24px 0;
  position: relative;
}
.menu-item i {
  width: 48px;
  height: 48px;
  background: #c8e6c9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #4caf50;
  margin-right: 8px;
  transition: background 0.2s, color 0.2s;
}
.menu-item.active {
  background: #e8f5e8;
  color: #4caf50;
  border-left: 4px solid #4caf50;
  font-weight: bold;
  box-shadow: 0 2px 12px rgba(76,175,80,0.08);
}
.menu-item.active i {
  background: #4caf50;
  color: #fff;
}
.menu-item:hover:not(.active) {
  background: #f1f8e9;
  color: #66bb6a;
}
.menu-item:hover:not(.active) i {
  background: #dbeafe;
  color: #66bb6a;
}
.profile-content {
  flex: 1;
  padding: 20px 56px 32px 56px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 60px;
}
.score-display {
  text-align: center;
  padding: 20px;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  color: #ff9800;
  margin: 10px 0;
}

.score-label {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.score-description {
  text-align: left;
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.6;
}
.block {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(76,175,80,0.04);
  padding: 18px 36px 18px 36px;
  margin-bottom: 0;
  text-align: left;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.block + .block {
  margin-top: 18px;
  border-top: 1.5px solid #e8f5e8;
  box-shadow: 0 2px 12px rgba(76,175,80,0.04);
}
.block-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #4caf50;
}
.block-list {
  padding-left: 18px;
  color: #333;
  font-size: 16px;
  line-height: 2.1;
}
.score {
  font-size: 30px;
  color: #f7b500;
  font-weight: bold;
  margin: 10px 0 0 0;
}
.profile-actions {
  display: flex;
  gap: 28px;
  margin-bottom: 0;
  margin-top: 8px;
}
.profile-actions button {
  background: linear-gradient(90deg,#4caf50 60%,#66bb6a 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-size: 17px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(76,175,80,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.profile-actions button:hover {
  background: #66bb6a;
  box-shadow: 0 4px 16px rgba(76,175,80,0.12);
}
.change-pwd {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.change-pwd input {
  padding: 12px;
  border: 1.5px solid #e3eafc;
  border-radius: 6px;
  font-size: 16px;
  background: #f7f9fc;
  transition: border 0.2s;
}
.change-pwd input:focus {
  border-color: #4caf50;
  outline: none;
}
.change-pwd button {
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 4px;
  box-shadow: 0 2px 8px rgba(76,175,80,0.08);
  transition: background 0.2s;
}
.change-pwd button:hover {
  background: #66bb6a;
}
@media (max-width: 900px) {
  .profile-layout {
    max-width: 100vw;
    border-radius: 0;
    box-shadow: none;
  }
  .profile-main {
    flex-direction: column;
  }
  .profile-menu {
    flex-direction: row;
    width: 100vw;
    padding: 0 0 0 0;
    box-shadow: none;
    align-items: flex-start;
    gap: 0;
    border-radius: 0;
    background: #f7f9fc;
    overflow-x: auto;
  }
  .menu-item {
    border-radius: 0 0 0 0;
    padding: 14px 18px;
    font-size: 16px;
    min-width: 110px;
    justify-content: center;
  }
  .profile-content {
    padding: 24px 8vw 24px 8vw;
  }
  .block {
    padding: 18px 10px 14px 10px;
  }
}

/* 新增样式 */
.info-edit-area {
  position: relative;
}
.info-actions {
  margin-top: 20px;
  display: flex;
  gap: 16px;
}
.edit-btn, .save-btn, .cancel-btn {
  padding: 12px 28px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}
.edit-btn {
  background: #4caf50;
  color: #fff;
}
.save-btn {
  background: #4caf50;
  color: #fff;
}
.cancel-btn {
  background: #f5f5f5;
  color: #666;
}
.info-form {
  margin-top: 20px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}
.address-group {
  display: flex;
  gap: 12px;
}
.address-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-size: 16px;
  line-height: 1.6;
}
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.tag-btn {
  padding: 8px 18px;
  border-radius: 20px;
  background: #f1f8e9;
  color: #4caf50;
  cursor: pointer;
  border: 1px solid #4caf50;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 500;
}
.tag-btn.selected {
  background: #4caf50;
  color: #fff;
}
.tag-btn input[type="checkbox"] {
  display: none;
}
.verified-tag {
  background: #4caf50;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.unverified-tag {
  background: #ff9800;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.verify-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.verify-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.verify-input:focus {
  border-color: #4caf50;
  outline: none;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.help-item {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 20px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(74,108,247,0.05);
}

.help-date {
  font-size: 14px;
  color: #666;
  min-width: 100px;
}

.help-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.help-type {
  font-weight: bold;
  color: #2c3e50;
  min-width: 100px;
}

.help-volunteer, .help-user {
  color: #4caf50;
  min-width: 150px;
}

.help-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.help-status.completed {
  background: #e6f7e6;
  color: #52c41a;
}

.help-status.ongoing {
  background: #e6f4ff;
  color: #1890ff;
}

.help-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.help-rating {
  color: #f7b500;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 4px;
  font-size: 14px;
  transition: background 0.2s;
}

.page-btn:hover:not(.disabled) {
  background-color: #66bb6a;
}

.page-btn.disabled {
  background: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.star {
  margin-right: 2px;
}

.password-form {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: #f5222d;
  font-size: 12px;
  margin-top: 4px;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #66bb6a;
}

.submit-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

/* 评分相关样式 */
.rating-summary {
  display: flex;
  gap: 40px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #e8f5e8;
  border-radius: 12px;
}

.average-rating {
  text-align: center;
  padding: 15px;
  border-radius: 12px;
  color: #2c3e50;
  min-width: 200px;
}

.rating-score {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
  display: inline-block;
  min-width: 80px;
  text-align: center;
}

.rating-stars {
  margin-bottom: 8px;
}

.rating-stars .star {
  font-size: 24px;
  color: #f7b500;
  margin-right: 4px;
}

.rating-text {
  font-size: 16px;
  color: #666;
}

.rating-stats {
  flex: 1;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
  color: #2c3e50;
}

.stat-label {
  opacity: 0.8;
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.rating-details {
  margin-top: 20px;
}

.rating-details h4 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
}

.rating-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rating-item {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 20px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(74,108,247,0.05);
}

.rating-date {
  font-size: 14px;
  color: #666;
  min-width: 100px;
}

.rating-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.rating-type {
  font-weight: bold;
  color: #2c3e50;
  min-width: 100px;
}

.rating-user {
  color: #4caf50;
  min-width: 150px;
}

.rating-info .rating-stars {
  margin: 0;
}

.rating-info .rating-stars .star {
  font-size: 16px;
  color: #f7b500;
  margin-right: 2px;
}

.rating-info .rating-stars .star.active {
  color: #f7b500;
}

/* 个人信息表格样式 */
.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.info-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.info-table tr:last-child {
  border-bottom: none;
}

.info-table tr:hover {
  background-color: #f8f9fa;
}

.info-label {
  width: 140px;
  padding: 18px 24px;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
  border-right: 1px solid #e9ecef;
  vertical-align: top;
}

.info-value {
  padding: 18px 24px;
  color: #495057;
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
}

.info-value .verified-tag,
.info-value .unverified-tag {
  margin-left: 0;
  display: inline-block;
  font-size: 14px;
  padding: 4px 10px;
}
/* 新增签到模块样式 */
.checkin-section {
  margin-bottom: 20px;
}

.checkin-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ddd;
  transition: all 0.3s;
}

.checkin-card.checked-in {
  background-color: #e8f5e9;
  border-left-color: #4caf50;
}

.checkin-left {
  display: flex;
  align-items: center;
}

.checkin-icon {
  font-size: 28px;
  margin-right: 15px;
  color: #757575;
}

.checkin-card.checked-in .checkin-icon {
  color: #4caf50;
}

.checkin-info h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.checkin-info p {
  margin: 5px 0 0;
  font-size: 13px;
  color: #666;
}

.checkin-btn {
  padding: 8px 20px;
  font-size: 14px;
  color: white;
  background-color: #4caf50;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.checkin-btn:hover:not(:disabled) {
  background-color: #3d8b40;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.checkin-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.checkin-btn.checked-in {
  background-color: #81c784;
}

/* 签到日历样式 */
.checkin-calendar {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.checkin-calendar h4 {
  margin: 0 0 15px;
  text-align: center;
  color: #333;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-header {
  text-align: center;
  font-weight: bold;
  color: #666;
  padding: 5px 0;
}

.calendar-day {
  position: relative;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: white;
  font-size: 13px;
}

.calendar-day.checked {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.calendar-day.today {
  border: 1px solid #4caf50;
}

.calendar-day.future {
  color: #bdbdbd;
}

.calendar-day.other-month {
  color: #e0e0e0;
}

.calendar-day .fa-check {
  position: absolute;
  bottom: 1px;
  right: 1px;
  font-size: 8px;
  color: #4caf50;
}
</style>