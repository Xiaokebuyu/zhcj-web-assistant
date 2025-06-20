<template>
  <div class="profile-layout" v-if="user.account">
    <h1 class="profile-title">个人中心</h1>
    <div class="profile-main">
      <!-- 左侧菜单 -->
      <div class="profile-menu">
        <div v-for="item in menuList" :key="item.key" :class="['menu-item', {active: currentMenu===item.key}]" @click="currentMenu=item.key">
          <i :class="item.icon"></i> {{ item.label }}
        </div>
      </div>
      <!-- 右侧内容区 -->
      <div class="profile-content">
        <div v-if="currentMenu==='info'" class="block">
          <div class="block-title">个人信息</div>
          <div class="info-edit-area">
            <ul class="block-list" v-if="!isEditing">
              <li><strong>账号：</strong>{{ user.account }}</li>
              <li><strong>手机号：</strong>{{ user.phone }}</li>
              <li><strong>身份：</strong>{{ user.type==='volunteer' ? '志愿者' : '求助者' }}</li>
              <li>
                <strong>实名认证：</strong>
                <span v-if="user.isVerified" class="verified-tag">已认证</span>
                <span v-else class="unverified-tag">未认证</span>
              </li>
              <li v-if="user.isVerified"><strong>姓名：</strong>{{ user.realName }}</li>
              <li v-if="user.isVerified"><strong>身份证：</strong>{{ maskIdCard(user.idCard) }}</li>
              <li><strong>地址：</strong>{{ user.province }} {{ user.city }} {{ user.district }}</li>
              <li><strong>个人介绍：</strong>{{ user.intro || '暂无介绍' }}</li>
              <li v-if="user.type==='disabled'"><strong>残疾类型：</strong>{{ user.disabledTypes.join(', ') || '未设置' }}</li>
              <li v-if="user.type==='volunteer'"><strong>性格标签：</strong>{{ user.tags.join(', ') || '未设置' }}</li>
            </ul>
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
              :class="['page-btn', { disabled: currentPage === 1 }]"
              @click="currentPage > 1 && (currentPage--)"
            >上一页</button>
            <span class="page-info">{{ currentPage }} / {{ Math.ceil(volunteerHelpList.length / pageSize) }}</span>
            <button 
              :class="['page-btn', { disabled: currentPage >= Math.ceil(volunteerHelpList.length / pageSize) }]"
              @click="currentPage < Math.ceil(volunteerHelpList.length / pageSize) && (currentPage++)"
            >下一页</button>
          </div>
        </div>
        <div v-if="currentMenu==='rate' && user.type==='disabled'" class="block">
          <div class="block-title">评价记录</div>
          <div class="help-list">
            <div class="help-item" v-for="item in paginatedDisabledHelpList.filter(i => i.rating)" :key="item.id">
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
              :class="['page-btn', { disabled: currentPage === 1 }]"
              @click="currentPage > 1 && (currentPage--)"
            >上一页</button>
            <span class="page-info">{{ currentPage }} / {{ Math.ceil(disabledHelpList.filter(i => i.rating).length / pageSize) }}</span>
            <button 
              :class="['page-btn', { disabled: currentPage >= Math.ceil(disabledHelpList.filter(i => i.rating).length / pageSize) }]"
              @click="currentPage < Math.ceil(disabledHelpList.filter(i => i.rating).length / pageSize) && (currentPage++)"
            >下一页</button>
          </div>
        </div>
        <div v-if="currentMenu==='rate' && user.type==='volunteer'" class="block">
          <div class="block-title">个人评价得分</div>
          <div class="score">4.8 / 5.0</div>
        </div>
        <div v-if="currentMenu==='score' && user.type==='volunteer'" class="block">
          <div class="block-title">个人积分得分</div>
          <div class="score">120</div>
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
        isVerified: false
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
          { key: 'score', label: '个人积分得分', icon: 'el-icon-medal' },
          { key: 'setting', label: '账号设置', icon: 'el-icon-setting' }
        ];
      } else {
        return [];
      }
    },
    paginatedVolunteerHelpList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.volunteerHelpList.slice(start, end);
    },
    paginatedDisabledHelpList() {
      const start = (this.currentPage - 1) * this.pageSize;
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
    }

  },
  created() {
    this.loadUser();
    if (!this.user.account) {
      this.$router.replace('/login');
    }
  },
  methods: {
    maskIdCard(idCard) {
      if (!idCard) return '';
      return idCard.substring(0, 6) + '********' + idCard.substring(14);
    },
    loadUser() {
      this.user.account = localStorage.getItem('userAccount') || '';
      this.user.phone = localStorage.getItem('userPhone') || '';
      // 将数字类型的type转换为字符串表示

      // 处理标签数字转换
      const labelNumbers = JSON.parse(localStorage.getItem('userLabelNumbers') || '[]');
      if (this.user.type === 'disabled') {
        this.user.disabledTypes = this.convertNumbersToTags(labelNumbers, 'disabled');
      } else if (this.user.type === 'volunteer') {
        this.user.tags = this.convertNumbersToTags(labelNumbers, 'volunteer');
      }

      this.user.type = localStorage.getItem('userType') || '';
      this.user.province = localStorage.getItem('userProvince') || '';
      this.user.city = localStorage.getItem('userCity') || '';
      this.user.district = localStorage.getItem('userDistrict') || '';
      this.user.intro = localStorage.getItem('userIntro') || '';
      this.user.disabledTypes = JSON.parse(localStorage.getItem('userDisabledTypes') || '[]');
      this.user.tags = JSON.parse(localStorage.getItem('userTags') || '[]');
      this.user.realName = localStorage.getItem('userRealName') || '';
      this.user.idCard = localStorage.getItem('userIdCard') || '';
      this.user.isVerified = localStorage.getItem('userIsVerified') === 'true';
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
    }

  }
}
</script>

<style scoped>
/* 新布局样式 */
.profile-title {
  font-size: 32px;
  font-weight: bold;
  margin: 32px 0 32px 0;
  text-align: left;
  padding-left: 32px;
}
.profile-layout {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(74,108,247,0.08);
  padding-bottom: 40px;
  overflow: hidden;
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
  padding: 18px 36px 18px 24px;
  font-size: 19px;
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
  width: 44px;
  height: 44px;
  background: #e3eafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #4a6cf7;
  margin-right: 8px;
  transition: background 0.2s, color 0.2s;
}
.menu-item.active {
  background: #e3eafc;
  color: #4a6cf7;
  border-left: 4px solid #4a6cf7;
  font-weight: bold;
  box-shadow: 0 2px 12px rgba(74,108,247,0.08);
}
.menu-item.active i {
  background: #4a6cf7;
  color: #fff;
}
.menu-item:hover:not(.active) {
  background: #f0f4ff;
  color: #2196f3;
}
.menu-item:hover:not(.active) i {
  background: #dbeafe;
  color: #2196f3;
}
.profile-content {
  flex: 1;
  padding: 48px 56px 32px 56px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.block {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(74,108,247,0.06);
  padding: 32px 36px 24px 36px;
  margin-bottom: 0;
  text-align: left;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.block + .block {
  margin-top: 18px;
  border-top: 1.5px solid #e3eafc;
  box-shadow: 0 2px 12px rgba(74,108,247,0.04);
}
.block-title {
  font-size: 22px;
  font-weight: bold;
  color: #4a6cf7;
  margin-bottom: 10px;
  letter-spacing: 1px;
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
  background: linear-gradient(90deg,#4a6cf7 60%,#2196f3 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-size: 17px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(74,108,247,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.profile-actions button:hover {
  background: linear-gradient(90deg,#2196f3 60%,#4a6cf7 100%);
  box-shadow: 0 4px 16px rgba(74,108,247,0.12);
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
  border-color: #4a6cf7;
  outline: none;
}
.change-pwd button {
  background: #4a6cf7;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 4px;
  box-shadow: 0 2px 8px rgba(74,108,247,0.08);
  transition: background 0.2s;
}
.change-pwd button:hover {
  background: #2196f3;
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
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  border: none;
}
.edit-btn {
  background: #4a6cf7;
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
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}
.address-group {
  display: flex;
  gap: 12px;
}
.address-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.tag-btn {
  padding: 6px 16px;
  border-radius: 20px;
  background: #f0f5ff;
  color: #4a6cf7;
  cursor: pointer;
  border: 1px solid #4a6cf7;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tag-btn.selected {
  background: #4a6cf7;
  color: #fff;
}
.tag-btn input[type="checkbox"] {
  display: none;
}
.verified-tag {
  background: #4caf50;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-left: 8px;
}

.unverified-tag {
  background: #ff9800;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-left: 8px;
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
  border-color: #4a6cf7;
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
  color: #4a6cf7;
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
  padding: 8px 16px;
  border: none;
  background: #4a6cf7;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-btn:hover:not(.disabled) {
  background: #2196f3;
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
  background-color: #4a6cf7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.submit-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

</style>