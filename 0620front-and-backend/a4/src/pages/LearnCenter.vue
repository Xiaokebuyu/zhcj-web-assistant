<!-- App.vue -->
<template>
    <div class="learning-center">
      <!-- 左侧导航 -->
      <div class="learning-nav">
        <h3><i class="fas fa-compass"></i> 学习导航</h3>
        <div
            v-for="item in navItems"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeSection === item.id }"
            @click="activeSection = item.id"
        >
          <i :class="item.icon"></i>
          <span>{{ item.title }}</span>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="learning-content">
        <!-- 沟通技巧部分 -->
        <div v-if="activeSection === 'communication'" class="section">
          <h2 class="section-title">
            <i class="fas fa-comments"></i>
            与残障人士沟通技巧
          </h2>

          <div class="card-grid">
            <div class="learning-card" v-for="card in communicationCards" :key="card.title">
              <div class="card-header">
                <i :class="card.icon"></i>
                <h3 class="card-title">{{ card.title }}</h3>
              </div>
              <div class="card-content">
                <ul class="tips-list">
                  <li v-for="(tip, index) in card.tips" :key="index">{{ tip }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 服务指南部分 -->
        <div v-if="activeSection === 'service'" class="section">
          <h2 class="section-title">
            <i class="fas fa-hands-helping"></i>
            志愿服务指南
          </h2>

          <div class="card-grid">
            <div class="learning-card" v-for="card in serviceCards" :key="card.title">
              <div class="card-header">
                <i :class="card.icon"></i>
                <h3 class="card-title">{{ card.title }}</h3>
              </div>
              <div class="card-content">
                <p>{{ card.description }}</p>
                <ul class="tips-list">
                  <li v-for="(tip, index) in card.tips" :key="index">{{ tip }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 案例分享部分 -->
        <div v-if="activeSection === 'cases'" class="section">
          <h2 class="section-title">
            <i class="fas fa-book"></i>
            志愿服务案例分享
          </h2>

          <div class="card-grid">
            <div class="learning-card" v-for="card in caseCards" :key="card.title">
              <div class="card-header">
                <i :class="card.icon"></i>
                <h3 class="card-title">{{ card.title }}</h3>
              </div>
              <div class="card-content">
                <div class="case-study">
                  <p v-for="(detail, key) in card.details" :key="key">
                    <strong>{{ key }}：</strong>{{ detail }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习资源部分 -->
        <div v-if="activeSection === 'resources'" class="section">
          <h2 class="section-title">
            <i class="fas fa-folder-open"></i>
            学习资源库
          </h2>

          <div class="resource-grid">
            <div
                v-for="resource in resources"
                :key="resource.title"
                class="resource-card"
            >
              <div class="resource-icon">
                <i :class="resource.icon"></i>
              </div>
              <h3 class="resource-title">{{ resource.title }}</h3>
              <p class="resource-desc">{{ resource.description }}</p>
              <div class="resource-action" @click="handleResourceAction(resource)">
                {{ resource.actionText }}
              </div>
            </div>
          </div>

          <div class="learning-card">
            <div class="card-header">
              <i class="fas fa-hands"></i>
              <h3 class="card-title">基础手语学习</h3>
            </div>
            <div class="card-content">
              <p>掌握基础手语有助于与听障人士沟通：</p>
              <ul class="tips-list">
                <li v-for="(gesture, key) in basicGestures" :key="key">
                  <strong>{{ key }}：</strong>{{ gesture }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 心理支持部分 -->
        <div v-if="activeSection === 'psychology'" class="section">
          <h2 class="section-title">
            <i class="fas fa-brain"></i>
            心理支持技巧
          </h2>

          <div class="card-grid">
            <div class="learning-card" v-for="card in psychologyCards" :key="card.title">
              <div class="card-header">
                <i :class="card.icon"></i>
                <h3 class="card-title">{{ card.title }}</h3>
              </div>
              <div class="card-content">
                <p v-if="card.description">{{ card.description }}</p>
                <ul class="tips-list">
                  <li v-for="(tip, index) in card.tips" :key="index">{{ tip }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 权益保障部分 -->
        <div v-if="activeSection === 'rights'" class="section">
          <h2 class="section-title">
            <i class="fas fa-balance-scale"></i>
            权益保障知识
          </h2>

          <div class="card-grid">
            <div class="learning-card" v-for="card in rightsCards" :key="card.title">
              <div class="card-header">
                <i :class="card.icon"></i>
                <h3 class="card-title">{{ card.title }}</h3>
              </div>
              <div class="card-content">
                <ul class="tips-list">
                  <li v-for="(tip, index) in card.tips" :key="index">
                    <template v-if="tip.label">
                      <strong>{{ tip.label }}：</strong>{{ tip.content }}
                    </template>
                    <template v-else>{{ tip }}</template>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activeSection: 'communication',
      navItems: [
        { id: 'communication', title: '沟通技巧', icon: 'fas fa-comments' },
        { id: 'service', title: '服务指南', icon: 'fas fa-hands-helping' },
        { id: 'cases', title: '案例分享', icon: 'fas fa-book' },
        { id: 'resources', title: '学习资源', icon: 'fas fa-folder-open' },
        { id: 'psychology', title: '心理支持', icon: 'fas fa-brain' },
        { id: 'rights', title: '权益保障', icon: 'fas fa-balance-scale' }
      ],
      communicationCards: [
        {
          icon: 'fas fa-deaf',
          title: '与听障人士沟通',
          tips: [
            '保持眼神接触，让听障人士能看到你的面部表情',
            '说话时保持正常语速，避免夸张口型',
            '使用简单明了的句子，避免复杂表达',
            '提供纸笔或使用手机打字进行交流',
            '学习基本手语表达，如"谢谢"、"需要帮助吗？"等'
          ]
        },
        {
          icon: 'fas fa-blind',
          title: '与视障人士沟通',
          tips: [
            '接近时先自我介绍，让视障人士知道你是谁',
            '使用描述性语言提供环境信息',
            '避免使用"这里"、"那里"等模糊指示词',
            '提供帮助前先询问"需要帮忙吗？"',
            '引导行走时，让视障人士轻握你的肘部'
          ]
        },
        {
          icon: 'fas fa-wheelchair',
          title: '与肢体障碍者沟通',
          tips: [
            '与轮椅使用者交谈时，尽量保持视线平齐',
            '不要倚靠或推动轮椅，除非获得许可',
            '尊重个人空间，避免不必要的身体接触',
            '耐心等待对方表达，不要打断或替其表达',
            '询问"你希望我如何提供帮助？"'
          ]
        },
        {
          icon: 'fas fa-language',
          title: '与语言障碍者沟通',
          tips: [
            '保持耐心，给予充足时间表达',
            '使用简单词汇和短句，避免复杂表达',
            '借助图片、文字或手势辅助沟通',
            '确认理解正确，可复述关键信息',
            '使用辅助沟通工具（AAC）如沟通板'
          ]
        }
      ],
      serviceCards: [
        {
          icon: 'fas fa-walking',
          title: '陪同出行指南',
          description: '陪同残障人士出行时，请遵循以下原则：',
          tips: [
            '提前规划无障碍路线，避开台阶和陡坡',
            '预留更多时间，避免匆忙赶路',
            '在交通工具上，协助寻找无障碍座位',
            '进入建筑物时，注意寻找无障碍入口',
            '保持对周围环境的观察，及时提醒障碍物'
          ]
        },
        {
          icon: 'fas fa-shopping-cart',
          title: '购物协助指南',
          description: '协助购物时，请尊重对方的选择权：',
          tips: [
            '按照清单采购，不要擅自添加或删除物品',
            '详细描述商品信息（颜色、大小、价格等）',
            '协助检查商品保质期和生产日期',
            '在结账时提供必要的支付协助',
            '将购物袋放在对方指定的位置'
          ]
        },
        {
          icon: 'fas fa-stethoscope',
          title: '医疗陪护指南',
          description: '医疗陪护需格外谨慎：',
          tips: [
            '提前了解就诊流程和所需材料',
            '准确传达医生的问题和指示',
            '帮助记录医嘱和用药说明',
            '尊重隐私，在检查时适时回避',
            '协助取药时仔细核对药品信息'
          ]
        }
      ],
      caseCards: [
        {
          icon: 'fas fa-heart',
          title: '成功案例：社区无障碍改造',
          details: {
            '背景': '某老旧社区缺乏无障碍设施，轮椅使用者出行困难。',
            '行动': '志愿者团队联合社区居委会，进行实地调研，提出改造方案。',
            '成果': '加装坡道3处，改造公共卫生间1个，增设无障碍停车位2个。',
            '影响': '社区12位残障人士受益，活动范围显著扩大。'
          }
        },
        {
          icon: 'fas fa-graduation-cap',
          title: '教育支持案例',
          details: {
            '背景': '视障学生无法获得普通学校教材。',
            '行动': '志愿者组织教材转换项目，将教材转换为音频和盲文格式。',
            '成果': '完成小学至高中主要教材转换，惠及23名学生。',
            '影响': '学生学业成绩提升30%，自信心显著增强。'
          }
        }
      ],
      resources: [
        {
          icon: 'fas fa-book',
          title: '志愿者手册',
          description: '全面指导志愿服务流程与规范',
          actionText: '下载手册',
          action: 'download',
          file: '志愿者手册.pdf'
        },
        {
          icon: 'fas fa-file-pdf',
          title: '无障碍指南',
          description: '公共场所无障碍设施建设标准',
          actionText: '下载指南',
          action: 'download',
          file: '无障碍指南.pdf'
        },
        {
          icon: 'fas fa-video',
          title: '手语教学视频',
          description: '基础手语沟通技巧教学',
          actionText: '观看视频',
          action: 'view',
          content: '手语基础教学'
        },
        {
          icon: 'fas fa-file-alt',
          title: '服务清单',
          description: '各类服务注意事项与流程',
          actionText: '下载清单',
          action: 'download',
          file: '服务清单.pdf'
        }
      ],
      basicGestures: {
        '你好': '举手挥动',
        '谢谢': '一手伸拇指弯曲两下',
        '需要帮助吗？': '双手掌心向上，向前伸出',
        '我明白': '拇指和食指成圈，其他三指伸直',
        '不明白': '摇头同时摊开双手',
        '紧急情况': '双手交叉在胸前快速摆动'
      },
      psychologyCards: [
        {
          icon: 'fas fa-hand-holding-heart',
          title: '建立信任关系',
          description: '与残障人士建立信任是有效服务的基础：',
          tips: [
            '保持真诚和一致的态度',
            '尊重个人边界和隐私',
            '遵守承诺，说到做到',
            '积极倾听，不随意打断',
            '避免过度同情，保持平等态度'
          ]
        },
        {
          icon: 'fas fa-comment-medical',
          title: '情绪支持技巧',
          tips: [
            '识别非语言情绪信号',
            '使用开放式问题引导表达',
            '避免评判性语言',
            '提供安全的倾诉环境',
            '了解专业支持资源，必要时转介',
            '使用共情表达："我能理解这很困难"'
          ]
        },
        {
          icon: 'fas fa-home',
          title: '家庭支持策略',
          tips: [
            '了解家庭成员的角色和关系',
            '尊重家庭决策模式',
            '提供喘息服务支持照顾者',
            '组织家庭交流活动',
            '协助家庭获取社区资源',
            '关注家庭照顾者的心理健康'
          ]
        }
      ],
      rightsCards: [
        {
          icon: 'fas fa-gavel',
          title: '残障人士基本权利',
          tips: [
            { label: '平等权', content: '不受歧视，平等参与社会生活' },
            { label: '教育权', content: '获得包容性教育的权利' },
            { label: '就业权', content: '获得平等就业机会和合理便利' },
            { label: '无障碍权', content: '获取信息、使用设施和服务的权利' },
            { label: '健康权', content: '获得适宜医疗和康复服务的权利' },
            { label: '表达权', content: '自由表达意见和参与决策的权利' }
          ]
        },
        {
          icon: 'fas fa-user-shield',
          title: '志愿者在权益保障中的角色',
          tips: [
            '了解并宣传残障人士权益',
            '识别和报告权益侵害事件',
            '协助残障人士表达诉求',
            '提供合理便利支持',
            '连接专业法律援助资源',
            '倡导无障碍环境建设'
          ]
        },
        {
          icon: 'fas fa-exclamation-triangle',
          title: '常见侵权行为及应对',
          tips: [
            { label: '就业歧视', content: '协助收集证据，向劳动监察部门举报' },
            { label: '教育排斥', content: '联系教育主管部门，申请融合教育支持' },
            { label: '无障碍缺失', content: '向市政管理部门反映，督促整改' },
            { label: '服务拒绝', content: '向消费者协会或行业主管部门投诉' },
            { label: '家庭暴力', content: '联系妇女儿童保护机构或报警' },
            { label: '财产侵害', content: '协助寻求法律援助，保护合法权益' }
          ]
        }
      ]
    }
  },
  methods: {
    handleResourceAction(resource) {
      if (resource.action === 'download') {
        alert(`即将下载: ${resource.file}\n（在实际系统中，这里将开始文件下载）`)
      } else if (resource.action === 'view') {
        alert(`即将播放: ${resource.content} 视频\n（在实际系统中，这里将嵌入视频播放器）`)
      }
    }
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
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
}

.learning-center {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

.learning-nav {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.learning-nav h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f4f8;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-item {
  padding: 14px 18px;
  margin: 10px 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #4a5568;
}

.nav-item:hover, .nav-item.active {
  background: #e3f2fd;
  color: #2196F3;
  transform: translateX(5px);
}

.nav-item i {
  margin-right: 12px;
  font-size: 1.3rem;
  width: 24px;
  text-align: center;
}

.learning-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
}

.section-title {
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 3px solid #4CAF50;
  display: flex;
  align-items: center;
  font-size: 1.8rem;
}

.section-title i {
  margin-right: 15px;
  font-size: 1.8rem;
  color: #4CAF50;
  background: #e8f5e9;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.learning-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #edf2f7;
}

.learning-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.card-header i {
  font-size: 2rem;
  color: #2196F3;
  margin-right: 18px;
  background: #e3f2fd;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-content {
  line-height: 1.7;
  color: #4a5568;
}

.tips-list {
  padding-left: 25px;
  margin: 18px 0;
}

.tips-list li {
  margin-bottom: 14px;
  line-height: 1.7;
  position: relative;
}

.tips-list li:before {
  content: "•";
  color: #4CAF50;
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

.case-study {
  background: #e8f5e9;
  border-left: 4px solid #4CAF50;
  padding: 20px;
  margin: 25px 0;
  border-radius: 0 8px 8px 0;
}

.case-study p {
  margin-bottom: 10px;
}

.case-study p:last-child {
  margin-bottom: 0;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.resource-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.resource-icon {
  font-size: 2.8rem;
  color: #2196F3;
  margin-bottom: 15px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resource-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1.2rem;
  color: #2c3e50;
}

.resource-desc {
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 15px;
  min-height: 40px;
}

.resource-action {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.resource-action:hover {
  background: #3d8b40;
  transform: scale(1.05);
}

@media (max-width: 1000px) {
  .learning-center {
    grid-template-columns: 1fr;
  }

  .learning-nav {
    position: static;
    margin-bottom: 30px;
  }
}

@media (max-width: 768px) {
  .learning-content {
    padding: 20px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }

  .nav-btn span {
    display: none;
  }

  .nav-btn i {
    margin-right: 0;
    font-size: 1.2rem;
  }
}
</style>