<template>
  <div class="disabled-dashboard">
    <div class="publish-row">
      <div class="card card-publish">
        <div class="card-title">发布求助任务</div>
        <form class="publish-form" @submit.prevent="submitRequest">
          <div class="form-group">
            <label>帮助类型</label>
            <div class="urgency-group">
              <label class="urgency-normal"><input type="radio" value="offline" v-model="newRequest.helpType" required> 线下帮助</label>
              <label class="urgency-urgent"><input type="radio" value="online" v-model="newRequest.helpType"> 线上帮助</label>
            </div>
          </div>
          
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
            <textarea v-model="newRequest.desc" required placeholder="请详细描述您的需求,并写下联系方式"></textarea>
          </div>
          <div class="form-group">
            <label>紧急程度</label>
            <div class="urgency-group">
              <label class="urgency-normal"><input type="radio" value="normal" v-model="newRequest.urgency" required> 一般</label>
              <label class="urgency-urgent"><input type="radio" value="medium" v-model="newRequest.urgency"> 较急</label>
              <label class="urgency-emergency"><input type="radio" value="urgent" v-model="newRequest.urgency"> 紧急</label>
            </div>
          </div>
          <div class="form-group" v-if="newRequest.helpType === 'offline'">
            <label>地址信息 <span class="required">*</span></label>
            <div class="address-tip">请选择任务执行的具体地址，志愿者将根据地址信息提供上门服务</div>
            <div class="address-row">
              <div class="address-select-group">
                <div class="common-address-container">
                  <select v-model="selectedCommonAddress" @change="fillCommonAddress" class="common-address-select">
                    <option value="">选择常用地址</option>
                    <option v-for="(addr, idx) in commonAddresses" :key="idx" :value="idx">{{ addr.label }}</option>
                  </select>
                  <button type="button" class="add-address-btn" @click="showAddAddressModal = true" title="添加新地址">
                    <i class="fas fa-plus"></i>
                  </button>
                  <button type="button" class="location-btn" @click="getCurrentLocation" title="获取当前位置">
                    <i class="fas fa-map-marker-alt"></i>
                  </button>
                </div>
              </div>
              <div class="address-select-group">
                <select v-model="newRequest.address.province" @change="onProvinceChange" required>
                  <option value="">选择省/直辖市</option>
                  <option v-for="prov in provinces" :key="prov.name" :value="prov.name">{{ prov.name }}</option>
                </select>
              </div>
              <div class="address-select-group">
                <select v-model="newRequest.address.city" @change="onCityChange" required>
                  <option value="">选择市</option>
                  <option v-for="city in cities" :key="city.name" :value="city.name">{{ city.name }}</option>
                </select>
              </div>
              <div class="address-select-group">
                <select v-model="newRequest.address.district" required>
                  <option value="">选择区/县</option>
                  <option v-for="dist in districts" :key="dist" :value="dist">{{ dist }}</option>
                </select>
              </div>
              <div class="address-input-group">
                <input type="text" v-model="newRequest.address.detail" required placeholder="详细地址（如街道、门牌号、小区名称）" />
              </div>
            </div>
            <div class="address-preview" v-if="newRequest.address.province && newRequest.address.city && newRequest.address.district && newRequest.address.detail">
              <span class="preview-label">地址预览：</span>
              <span class="preview-content">{{ newRequest.address.province }} {{ newRequest.address.city }} {{ newRequest.address.district }} {{ newRequest.address.detail }}</span>
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
              <div class="task-actions" v-if="task.status === 'accepted'">
                <button class="complete-task-btn" @click="completeTask(task.id)">
                  确认完成任务
                </button>
                <button class="view-messages-btn" @click="viewMessages(task.id)">
                  <i class="fas fa-comments"></i> 查看消息
                </button>
              </div>
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

    <!-- 添加常用地址模态框 -->
    <div class="modal-overlay" v-if="showAddAddressModal" @click="showAddAddressModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加常用地址</h3>
          <button class="modal-close" @click="showAddAddressModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>地址名称</label>
            <input type="text" v-model="newAddress.label" placeholder="如：家、公司、亲戚家" />
          </div>
          <div class="form-group">
            <label>省份</label>
            <select v-model="newAddress.province" @change="onNewAddressProvinceChange">
              <option value="">选择省</option>
              <option v-for="prov in provinces" :key="prov.name" :value="prov.name">{{ prov.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>城市</label>
            <select v-model="newAddress.city" @change="onNewAddressCityChange">
              <option value="">选择市</option>
              <option v-for="city in newAddressCities" :key="city.name" :value="city.name">{{ city.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>区县</label>
            <select v-model="newAddress.district">
              <option value="">选择区/县</option>
              <option v-for="dist in newAddressDistricts" :key="dist" :value="dist">{{ dist }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>详细地址</label>
            <input type="text" v-model="newAddress.detail" placeholder="详细地址（如街道、门牌号）" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddAddressModal = false">取消</button>
          <button class="btn-confirm" @click="addCommonAddress">确认添加</button>
        </div>
      </div>
    </div>

    <!-- 消息查看弹窗 -->
    <div class="modal-overlay" v-if="showMessagesModal" @click="closeMessagesModal">
      <div class="modal-content messages-modal" @click.stop>
        <div class="modal-header">
          <h3>消息记录</h3>
          <button class="modal-close" @click="closeMessagesModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="messages-container">
            <div v-if="currentMessages.length === 0" class="empty-messages">
              <p>暂无消息记录</p>
            </div>
            <div v-else class="message-list">
              <div v-for="(message, index) in currentMessages" :key="index" class="message-item">
                <div class="message-header">
                  <span class="sender-name">{{ message.senderName || '志愿者' }}</span>
                  <span class="message-time">{{ message.timestamp }}</span>
                </div>
                <div class="message-content">
                  {{ message.message }}
                </div>
                <div class="message-type">
                  <span :class="message.type === 'sent' ? 'sent' : 'received'">
                    {{ message.type === 'sent' ? '已发送' : '已接收' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="reply-section">
            <label>回复消息：</label>
            <textarea 
              v-model="replyMessage" 
              placeholder="请输入您的回复..."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeMessagesModal">关闭</button>
          <button class="btn-send" @click="sendReply" :disabled="!replyMessage.trim()">
            发送回复
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  name: 'DisabledPlatform',
  data() {
    return {
      area: '',
      progressOngoing:[],
      progressDone:[],

      steps: ['未被接取', '已被接取', '已完成'],
      score: 0,
      record: [],
      matchTab: 'disabled',
      matchInput: '',
      matchList: [],
      newRequest: {
        type: '',
        desc: '',
        urgency: '',
        address: { province: '', city: '', district: '', detail: '' },
        helpType: 'offline'
      },
      selectedCommonAddress: '',
      commonAddresses: [
        { label: '家：北京市北京市朝阳区XX小区1号楼101', value: { province: '北京市', city: '北京市', district: '朝阳区', detail: 'XX小区1号楼101' } },
        { label: '公司：北京市北京市海淀区中关村大街100号', value: { province: '北京市', city: '北京市', district: '海淀区', detail: '中关村大街100号' } },
        { label: '亲戚家：广东省广州市天河区体育东路88号', value: { province: '广东省', city: '广州市', district: '天河区', detail: '体育东路88号' } }
      ],
      provinces: [
        { name: '北京市', cities: [ { name: '北京市', districts: ['东城区','西城区','朝阳区','海淀区','丰台区','石景山区','门头沟区','房山区','通州区','顺义区','昌平区','大兴区','怀柔区','平谷区','密云区','延庆区'] } ] },
        { name: '上海市', cities: [ { name: '上海市', districts: ['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','金山区','松江区','青浦区','奉贤区','崇明区'] } ] },
        { name: '天津市', cities: [ { name: '天津市', districts: ['和平区','河东区','河西区','南开区','河北区','红桥区','东丽区','西青区','津南区','北辰区','武清区','宝坻区','滨海新区','宁河区','静海区','蓟州区'] } ] },
        { name: '重庆市', cities: [ { name: '重庆市', districts: ['渝中区','大渡口区','江北区','沙坪坝区','九龙坡区','南岸区','北碚区','渝北区','巴南区','涪陵区','綦江区','大足区','璧山区','铜梁区','潼南区','荣昌区'] } ] },
        { name: '广东省', cities: [ 
          { name: '广州市', districts: ['越秀区','海珠区','荔湾区','天河区','白云区','黄埔区','番禺区','花都区','南沙区','从化区','增城区'] }, 
          { name: '深圳市', districts: ['福田区','罗湖区','南山区','宝安区','龙岗区','盐田区','龙华区','坪山区','光明区'] },
          { name: '珠海市', districts: ['香洲区','斗门区','金湾区'] },
          { name: '佛山市', districts: ['禅城区','南海区','顺德区','三水区','高明区'] },
          { name: '东莞市', districts: ['莞城区','东城区','南城区','万江区','石碣镇','石龙镇','茶山镇','石排镇','企石镇','横沥镇','桥头镇','谢岗镇','东坑镇','常平镇','寮步镇','大朗镇','黄江镇','清溪镇','塘厦镇','凤岗镇','长安镇'] },
          { name: '中山市', districts: ['石岐区','东区','西区','南区','五桂山区','火炬开发区','小榄镇','黄圃镇','民众镇','东凤镇','古镇镇','沙溪镇','坦洲镇','港口镇','三角镇','横栏镇','南头镇','阜沙镇','南朗镇','三乡镇','板芙镇','大涌镇','神湾镇'] }
        ] },
        { name: '浙江省', cities: [ 
          { name: '杭州市', districts: ['上城区','下城区','江干区','拱墅区','西湖区','滨江区','萧山区','余杭区','富阳区','临安区','桐庐县','淳安县','建德市'] }, 
          { name: '宁波市', districts: ['海曙区','江北区','北仑区','镇海区','鄞州区','奉化区','象山县','宁海县','余姚市','慈溪市'] },
          { name: '温州市', districts: ['鹿城区','龙湾区','瓯海区','洞头区','永嘉县','平阳县','苍南县','文成县','泰顺县','瑞安市','乐清市'] },
          { name: '嘉兴市', districts: ['南湖区','秀洲区','嘉善县','海盐县','海宁市','平湖市','桐乡市'] },
          { name: '湖州市', districts: ['吴兴区','南浔区','德清县','长兴县','安吉县'] },
          { name: '绍兴市', districts: ['越城区','柯桥区','上虞区','新昌县','诸暨市','嵊州市'] }
        ] },
        { name: '江苏省', cities: [ 
          { name: '南京市', districts: ['玄武区','秦淮区','建邺区','鼓楼区','浦口区','栖霞区','雨花台区','江宁区','六合区','溧水区','高淳区'] }, 
          { name: '苏州市', districts: ['姑苏区','虎丘区','吴中区','相城区','吴江区','常熟市','张家港市','昆山市','太仓市'] },
          { name: '无锡市', districts: ['梁溪区','锡山区','惠山区','滨湖区','新吴区','江阴市','宜兴市'] },
          { name: '常州市', districts: ['天宁区','钟楼区','新北区','武进区','金坛区','溧阳市'] },
          { name: '南通市', districts: ['崇川区','港闸区','通州区','如东县','启东市','如皋市','海门市','海安市'] },
          { name: '徐州市', districts: ['云龙区','鼓楼区','贾汪区','泉山区','铜山区','丰县','沛县','睢宁县','新沂市','邳州市'] }
        ] },
        { name: '山东省', cities: [ 
          { name: '济南市', districts: ['历下区','市中区','槐荫区','天桥区','历城区','长清区','章丘区','济阳区','莱芜区','钢城区','平阴县','商河县'] }, 
          { name: '青岛市', districts: ['市南区','市北区','黄岛区','崂山区','李沧区','城阳区','即墨区','胶州市','平度市','莱西市'] },
          { name: '烟台市', districts: ['芝罘区','福山区','牟平区','莱山区','长岛县','龙口市','莱阳市','莱州市','蓬莱市','招远市','栖霞市','海阳市'] },
          { name: '潍坊市', districts: ['潍城区','寒亭区','坊子区','奎文区','临朐县','昌乐县','青州市','诸城市','寿光市','安丘市','高密市','昌邑市'] },
          { name: '临沂市', districts: ['兰山区','罗庄区','河东区','沂南县','郯城县','沂水县','兰陵县','费县','平邑县','莒南县','蒙阴县','临沭县'] }
        ] },
        { name: '四川省', cities: [ 
          { name: '成都市', districts: ['锦江区','青羊区','金牛区','武侯区','成华区','龙泉驿区','青白江区','新都区','温江区','双流区','郫都区','新津区','金堂县','大邑县','蒲江县','都江堰市','彭州市','邛崃市','崇州市','简阳市'] }, 
          { name: '绵阳市', districts: ['涪城区','游仙区','安州区','三台县','盐亭县','梓潼县','北川羌族自治县','平武县','江油市'] },
          { name: '德阳市', districts: ['旌阳区','罗江区','中江县','广汉市','什邡市','绵竹市'] },
          { name: '南充市', districts: ['顺庆区','高坪区','嘉陵区','南部县','营山县','蓬安县','仪陇县','西充县','阆中市'] }
        ] },
        { name: '湖北省', cities: [ 
          { name: '武汉市', districts: ['江岸区','江汉区','硚口区','汉阳区','武昌区','青山区','洪山区','东西湖区','汉南区','蔡甸区','江夏区','黄陂区','新洲区'] }, 
          { name: '宜昌市', districts: ['西陵区','伍家岗区','点军区','猇亭区','夷陵区','远安县','兴山县','秭归县','长阳土家族自治县','五峰土家族自治县','宜都市','当阳市','枝江市'] },
          { name: '襄阳市', districts: ['襄城区','樊城区','襄州区','南漳县','谷城县','保康县','老河口市','枣阳市','宜城市'] },
          { name: '荆州市', districts: ['沙市区','荆州区','公安县','监利县','江陵县','石首市','洪湖市','松滋市'] }
        ] },
        { name: '湖南省', cities: [ 
          { name: '长沙市', districts: ['芙蓉区','天心区','岳麓区','开福区','雨花区','望城区','长沙县','浏阳市','宁乡市'] }, 
          { name: '株洲市', districts: ['荷塘区','芦淞区','石峰区','天元区','渌口区','攸县','茶陵县','炎陵县','醴陵市'] },
          { name: '湘潭市', districts: ['雨湖区','岳塘区','湘潭县','湘乡市','韶山市'] },
          { name: '衡阳市', districts: ['珠晖区','雁峰区','石鼓区','蒸湘区','南岳区','衡阳县','衡南县','衡山县','衡东县','祁东县','耒阳市','常宁市'] }
        ] },
        { name: '河南省', cities: [ 
          { name: '郑州市', districts: ['中原区','二七区','管城回族区','金水区','上街区','惠济区','中牟县','巩义市','荥阳市','新密市','新郑市','登封市'] }, 
          { name: '洛阳市', districts: ['老城区','西工区','瀍河回族区','涧西区','吉利区','洛龙区','孟津县','新安县','栾川县','嵩县','汝阳县','宜阳县','洛宁县','伊川县','偃师市'] },
          { name: '开封市', districts: ['龙亭区','顺河回族区','鼓楼区','禹王台区','祥符区','杞县','通许县','尉氏县','兰考县'] },
          { name: '安阳市', districts: ['文峰区','北关区','殷都区','龙安区','安阳县','汤阴县','滑县','内黄县','林州市'] }
        ] },
        { name: '河北省', cities: [ 
          { name: '石家庄市', districts: ['长安区','桥西区','新华区','井陉矿区','裕华区','藁城区','鹿泉区','栾城区','井陉县','正定县','行唐县','灵寿县','高邑县','深泽县','赞皇县','无极县','平山县','元氏县','赵县','辛集市','晋州市','新乐市'] }, 
          { name: '唐山市', districts: ['路南区','路北区','古冶区','开平区','丰南区','丰润区','曹妃甸区','滦南县','乐亭县','迁西县','玉田县','遵化市','迁安市','滦州市'] },
          { name: '秦皇岛市', districts: ['海港区','山海关区','北戴河区','抚宁区','青龙满族自治县','昌黎县','卢龙县'] },
          { name: '邯郸市', districts: ['邯山区','丛台区','复兴区','峰峰矿区','肥乡区','永年区','临漳县','成安县','大名县','涉县','磁县','邱县','鸡泽县','广平县','馆陶县','魏县','曲周县','武安市'] }
        ] },
        { name: '陕西省', cities: [ 
          { name: '西安市', districts: ['新城区','碑林区','莲湖区','灞桥区','未央区','雁塔区','阎良区','临潼区','长安区','高陵区','鄠邑区','蓝田县','周至县'] }, 
          { name: '宝鸡市', districts: ['渭滨区','金台区','陈仓区','凤翔县','岐山县','扶风县','眉县','陇县','千阳县','麟游县','凤县','太白县'] },
          { name: '咸阳市', districts: ['秦都区','杨陵区','渭城区','三原县','泾阳县','乾县','礼泉县','永寿县','彬州市','长武县','旬邑县','淳化县','武功县','兴平市'] },
          { name: '延安市', districts: ['宝塔区','安塞区','延长县','延川县','子长县','志丹县','吴起县','甘泉县','富县','洛川县','宜川县','黄龙县','黄陵县'] }
        ] },
        { name: '福建省', cities: [ 
          { name: '福州市', districts: ['鼓楼区','台江区','仓山区','马尾区','晋安区','长乐区','闽侯县','连江县','罗源县','闽清县','永泰县','平潭县','福清市'] }, 
          { name: '厦门市', districts: ['思明区','海沧区','湖里区','集美区','同安区','翔安区'] },
          { name: '泉州市', districts: ['鲤城区','丰泽区','洛江区','泉港区','惠安县','安溪县','永春县','德化县','金门县','石狮市','晋江市','南安市'] },
          { name: '漳州市', districts: ['芗城区','龙文区','云霄县','漳浦县','诏安县','长泰县','东山县','南靖县','平和县','华安县','龙海市'] }
        ] },
        { name: '安徽省', cities: [ 
          { name: '合肥市', districts: ['瑶海区','庐阳区','蜀山区','包河区','经开区','高新区','新站区','滨湖新区','肥东县','肥西县','长丰县','庐江县','巢湖市'] }, 
          { name: '芜湖市', districts: ['镜湖区','弋江区','鸠江区','湾沚区','繁昌区','无为市','南陵县'] },
          { name: '蚌埠市', districts: ['龙子湖区','蚌山区','禹会区','淮上区','怀远县','五河县','固镇县'] },
          { name: '阜阳市', districts: ['颍州区','颍东区','颍泉区','临泉县','太和县','阜南县','颍上县','界首市'] }
        ] },
        { name: '江西省', cities: [ 
          { name: '南昌市', districts: ['东湖区','西湖区','青云谱区','湾里区','青山湖区','新建区','南昌县','安义县','进贤县'] }, 
          { name: '九江市', districts: ['濂溪区','浔阳区','柴桑区','武宁县','修水县','永修县','德安县','都昌县','湖口县','彭泽县','瑞昌市','共青城市','庐山市'] },
          { name: '上饶市', districts: ['信州区','广丰区','广信区','玉山县','铅山县','横峰县','弋阳县','余干县','鄱阳县','万年县','婺源县','德兴市'] },
          { name: '抚州市', districts: ['临川区','东乡区','南城县','黎川县','南丰县','崇仁县','乐安县','宜黄县','金溪县','资溪县','广昌县'] }
        ] },
        { name: '云南省', cities: [ 
          { name: '昆明市', districts: ['五华区','盘龙区','官渡区','西山区','东川区','呈贡区','晋宁区','富民县','宜良县','石林彝族自治县','嵩明县','禄劝彝族苗族自治县','寻甸回族彝族自治县','安宁市'] }, 
          { name: '大理白族自治州', districts: ['大理市','漾濞彝族自治县','祥云县','宾川县','弥渡县','南涧彝族自治县','巍山彝族回族自治县','永平县','云龙县','洱源县','剑川县','鹤庆县'] },
          { name: '丽江市', districts: ['古城区','玉龙纳西族自治县','永胜县','华坪县','宁蒗彝族自治县'] },
          { name: '西双版纳傣族自治州', districts: ['景洪市','勐海县','勐腊县'] }
        ] },
        { name: '贵州省', cities: [ 
          { name: '贵阳市', districts: ['南明区','云岩区','花溪区','乌当区','白云区','观山湖区','开阳县','息烽县','修文县','清镇市'] }, 
          { name: '遵义市', districts: ['红花岗区','汇川区','播州区','桐梓县','绥阳县','正安县','道真仡佬族苗族自治县','务川仡佬族苗族自治县','凤冈县','湄潭县','余庆县','习水县','赤水市','仁怀市'] },
          { name: '安顺市', districts: ['西秀区','平坝区','普定县','镇宁布依族苗族自治县','关岭布依族苗族自治县','紫云苗族布依族自治县'] },
          { name: '六盘水市', districts: ['钟山区','六枝特区','水城县','盘州市'] }
        ] },
        { name: '广西壮族自治区', cities: [ 
          { name: '南宁市', districts: ['兴宁区','青秀区','江南区','西乡塘区','良庆区','邕宁区','武鸣区','隆安县','马山县','上林县','宾阳县','横县'] }, 
          { name: '桂林市', districts: ['秀峰区','叠彩区','象山区','七星区','雁山区','临桂区','阳朔县','灵川县','全州县','兴安县','永福县','灌阳县','龙胜各族自治县','资源县','平乐县','荔浦市','恭城瑶族自治县'] },
          { name: '柳州市', districts: ['城中区','鱼峰区','柳南区','柳北区','柳江区','柳城县','鹿寨县','融安县','融水苗族自治县','三江侗族自治县'] },
          { name: '北海市', districts: ['海城区','银海区','铁山港区','合浦县'] }
        ] },
        { name: '海南省', cities: [ 
          { name: '海口市', districts: ['秀英区','龙华区','琼山区','美兰区'] }, 
          { name: '三亚市', districts: ['海棠区','吉阳区','天涯区','崖州区'] },
          { name: '三沙市', districts: ['西沙区','南沙区'] },
          { name: '儋州市', districts: ['那大镇','和庆镇','南丰镇','大成镇','雅星镇','兰洋镇','光村镇','木棠镇','海头镇','峨蔓镇','王五镇','白马井镇','中和镇','排浦镇','东成镇','新州镇','洋浦经济开发区'] }
        ] },
        { name: '内蒙古自治区', cities: [ 
          { name: '呼和浩特市', districts: ['新城区','回民区','玉泉区','赛罕区','土默特左旗','托克托县','和林格尔县','清水河县','武川县'] }, 
          { name: '包头市', districts: ['东河区','昆都仑区','青山区','石拐区','白云鄂博矿区','九原区','土默特右旗','固阳县','达尔罕茂明安联合旗'] },
          { name: '鄂尔多斯市', districts: ['东胜区','康巴什区','达拉特旗','准格尔旗','鄂托克前旗','鄂托克旗','杭锦旗','乌审旗','伊金霍洛旗'] },
          { name: '呼伦贝尔市', districts: ['海拉尔区','扎赉诺尔区','阿荣旗','莫力达瓦达斡尔族自治旗','鄂伦春自治旗','鄂温克族自治旗','陈巴尔虎旗','新巴尔虎左旗','新巴尔虎右旗','满洲里市','牙克石市','扎兰屯市','额尔古纳市','根河市'] }
        ] },
        { name: '新疆维吾尔自治区', cities: [ 
          { name: '乌鲁木齐市', districts: ['天山区','沙依巴克区','新市区','水磨沟区','头屯河区','达坂城区','米东区','乌鲁木齐县'] }, 
          { name: '克拉玛依市', districts: ['独山子区','克拉玛依区','白碱滩区','乌尔禾区'] },
          { name: '吐鲁番市', districts: ['高昌区','鄯善县','托克逊县'] },
          { name: '哈密市', districts: ['伊州区','巴里坤哈萨克自治县','伊吾县'] }
        ] },
        { name: '西藏自治区', cities: [ 
          { name: '拉萨市', districts: ['城关区','堆龙德庆区','达孜区','林周县','当雄县','尼木县','曲水县','墨竹工卡县'] }, 
          { name: '日喀则市', districts: ['桑珠孜区','南木林县','江孜县','定日县','萨迦县','拉孜县','昂仁县','谢通门县','白朗县','仁布县','康马县','定结县','仲巴县','亚东县','吉隆县','聂拉木县','萨嘎县','岗巴县'] },
          { name: '昌都市', districts: ['卡若区','江达县','贡觉县','类乌齐县','丁青县','察雅县','八宿县','左贡县','芒康县','洛隆县','边坝县'] },
          { name: '林芝市', districts: ['巴宜区','工布江达县','米林县','墨脱县','波密县','察隅县','朗县'] }
        ] },
        { name: '青海省', cities: [ 
          { name: '西宁市', districts: ['城东区','城中区','城西区','城北区','大通回族土族自治县','湟中县','湟源县'] }, 
          { name: '海东市', districts: ['乐都区','平安区','民和回族土族自治县','互助土族自治县','化隆回族自治县','循化撒拉族自治县'] },
          { name: '海北藏族自治州', districts: ['门源回族自治县','祁连县','海晏县','刚察县'] },
          { name: '黄南藏族自治州', districts: ['同仁县','尖扎县','泽库县','河南蒙古族自治县'] }
        ] },
        { name: '宁夏回族自治区', cities: [ 
          { name: '银川市', districts: ['兴庆区','西夏区','金凤区','永宁县','贺兰县','灵武市'] }, 
          { name: '石嘴山市', districts: ['大武口区','惠农区','平罗县'] },
          { name: '吴忠市', districts: ['利通区','红寺堡区','盐池县','同心县','青铜峡市'] },
          { name: '固原市', districts: ['原州区','西吉县','隆德县','泾源县','彭阳县'] }
        ] },
        { name: '甘肃省', cities: [ 
          { name: '兰州市', districts: ['城关区','七里河区','西固区','安宁区','红古区','永登县','皋兰县','榆中县'] }, 
          { name: '嘉峪关市', districts: ['雄关区','镜铁区','长城区'] },
          { name: '金昌市', districts: ['金川区','永昌县'] },
          { name: '白银市', districts: ['白银区','平川区','靖远县','会宁县','景泰县'] }
        ] },
        { name: '山西省', cities: [ 
          { name: '太原市', districts: ['小店区','迎泽区','杏花岭区','尖草坪区','万柏林区','晋源区','清徐县','阳曲县','娄烦县','古交市'] }, 
          { name: '大同市', districts: ['新荣区','平城区','云冈区','云州区','阳高县','天镇县','广灵县','灵丘县','浑源县','左云县'] },
          { name: '阳泉市', districts: ['城区','矿区','郊区','平定县','盂县'] },
          { name: '长治市', districts: ['潞州区','上党区','屯留区','潞城区','襄垣县','平顺县','黎城县','壶关县','长子县','武乡县','沁县','沁源县'] }
        ] },
        { name: '辽宁省', cities: [ 
          { name: '沈阳市', districts: ['和平区','沈河区','大东区','皇姑区','铁西区','苏家屯区','浑南区','沈北新区','于洪区','辽中区','康平县','法库县','新民市'] }, 
          { name: '大连市', districts: ['中山区','西岗区','沙河口区','甘井子区','旅顺口区','金州区','普兰店区','长海县','瓦房店市','庄河市'] },
          { name: '鞍山市', districts: ['铁东区','铁西区','立山区','千山区','台安县','岫岩满族自治县','海城市'] },
          { name: '抚顺市', districts: ['新抚区','东洲区','望花区','顺城区','抚顺县','新宾满族自治县','清原满族自治县'] }
        ] },
        { name: '吉林省', cities: [ 
          { name: '长春市', districts: ['南关区','宽城区','朝阳区','二道区','绿园区','双阳区','九台区','农安县','榆树市','德惠市'] }, 
          { name: '吉林市', districts: ['昌邑区','龙潭区','船营区','丰满区','永吉县','蛟河市','桦甸市','舒兰市','磐石市'] },
          { name: '四平市', districts: ['铁西区','铁东区','梨树县','伊通满族自治县','公主岭市','双辽市'] },
          { name: '辽源市', districts: ['龙山区','西安区','东丰县','东辽县'] }
        ] },
        { name: '黑龙江省', cities: [ 
          { name: '哈尔滨市', districts: ['道里区','南岗区','道外区','平房区','松北区','香坊区','呼兰区','阿城区','双城区','依兰县','方正县','宾县','巴彦县','木兰县','通河县','延寿县','尚志市','五常市'] }, 
          { name: '齐齐哈尔市', districts: ['龙沙区','建华区','铁锋区','昂昂溪区','富拉尔基区','碾子山区','梅里斯达斡尔族区','龙江县','依安县','泰来县','甘南县','富裕县','克山县','克东县','拜泉县','讷河市'] },
          { name: '牡丹江市', districts: ['东安区','阳明区','爱民区','西安区','林口县','绥芬河市','海林市','宁安市','穆棱市','东宁市'] },
          { name: '佳木斯市', districts: ['前进区','向阳区','东风区','郊区','桦南县','桦川县','汤原县','同江市','富锦市','抚远市'] }
        ] }
      ],
      cities: [],
      districts: [],
      // 评价数据，key为已完成任务索引，value为星级
      ratings: {},
      showAddAddressModal: false,
      newAddress: {
        label: '',
        province: '',
        city: '',
        district: '',
        detail: ''
      },
      newAddressCities: [],
      newAddressDistricts: [],
      showMessagesModal: false,
      currentMessages: [],
      replyMessage: ''
    }
  },
  computed: {
  },
  created() {
    this.fetchRequests();
  },
  methods: {
    goProfile() {
      this.$router.push('/profile');
    },
    onProvinceChange() {
      const prov = this.provinces.find(p => p.name === this.newRequest.address.province);
      this.cities = prov ? prov.cities : [];
      this.newRequest.address.city = '';
      this.districts = [];
      this.newRequest.address.district = '';
    },
    onCityChange() {
      const prov = this.provinces.find(p => p.name === this.newRequest.address.province);
      const city = prov && prov.cities.find(c => c.name === this.newRequest.address.city);
      this.districts = city ? city.districts : [];
      this.newRequest.address.district = '';
    },
    fillCommonAddress() {
      console.log('fillCommonAddress 被调用，selectedCommonAddress:', this.selectedCommonAddress, '类型:', typeof this.selectedCommonAddress);
      
      if (this.selectedCommonAddress === null) {
        // 清空地址信息
        this.newRequest.address = { province: '', city: '', district: '', detail: '' };
        this.cities = [];
        this.districts = [];
        console.log('清空地址信息');
        return;
      }
      
      // 确保索引是数字类型
      const index = parseInt(this.selectedCommonAddress);
      console.log('解析后的索引:', index);
      
      const addr = this.commonAddresses[index]?.value;
      console.log('选择的地址信息:', addr);
      
      if (addr) {
        // 先更新省市区的数据，但不设置地址值
        const prov = this.provinces.find(p => p.name === addr.province);
        this.cities = prov ? prov.cities : [];
        console.log('更新城市列表:', this.cities);
        
        const city = prov && prov.cities.find(c => c.name === addr.city);
        this.districts = city ? city.districts : [];
        console.log('更新区县列表:', this.districts);
        
        // 然后设置地址信息
        this.newRequest.address = { ...addr };
        console.log('设置地址信息:', this.newRequest.address);
        
        // 给用户一个反馈
        this.$message.success('已自动填充常用地址信息');
      } else {
        this.$message.error('常用地址信息无效，请重新选择');
      }
    },


    async submitRequest() {
      if (!this.newRequest.type || !this.newRequest.desc || !this.newRequest.urgency) {
        this.$message.error('请填写完整的需求信息');
        return;
      }

      let raddress = '';
      if (this.newRequest.helpType === 'offline') {
        const addr = this.newRequest.address;
        if (!addr.province || !addr.city || !addr.district || !addr.detail) {
          this.$message.error('请填写完整的地址信息');
          return;
        }
        raddress = `${addr.province}${addr.city}${addr.district}${addr.detail}`;
      }

      try {
        // 准备请求数据
        const requestData = {
          rtype: this.getRequestTypeCode(this.newRequest.type),
          rcontent: this.newRequest.desc,
          rurgent: this.getUrgencyCode(this.newRequest.urgency),
          raddress: raddress,
          risOnline:this.newRequest.helpType === 'offline'? 0 : 1,
        };
        console.log(requestData,'测试request');

        // 发送请求
        const response = await request.post('http://localhost:81/request/publish', requestData);
        console.log('完整响应对象:', response); // 添加这行
        // console.log('响应数据:', response.data); // 添加这行

        if (response && response.code === 200) {
          this.$message.success('任务发布成功！');
          // 清空表单
          this.newRequest = {
            type: '',
            desc: '',
            urgency: '',
            address: { province: '', city: '', district: '', detail: '' },
            helpType: 'offline'
          };
          this.selectedCommonAddress = null;
          this.cities = [];
          this.districts = [];

          // 刷新任务列表
          this.fetchRequests();
        } else {
          console.error("详细错误信息:", {
            status: response.status,
            statusText: response.statusText,
            data: response.data
          });
          this.$message.error(response?.msg || '任务发布失败');
        }
      } catch (error) {
        console.log('发布任务失败:', error);
        this.$message.error('任务发布失败，请稍后重试');
      }
    },

    // 获取需求类型对应的编码
    getRequestTypeCode(type) {
      const typeMap = {
        'daily': 0,     // 日常生活
        'medical': 1,   // 医疗协助
        'transport': 2, // 交通出行
        'social': 3,    // 社交陪伴
        'other': 4      // 其他
      };
      return typeMap[type] || 4;
    },

    // 获取紧急程度对应的编码
    getUrgencyCode(urgency) {
      const urgencyMap = {
        'normal': 0,   // 一般
        'medium': 1,   // 较急
        'urgent': 2    // 紧急
      };
      return urgencyMap[urgency] || 0;
    },
    // 获取当前用户ID
    async getCurrentUserId() {
      try {
        const response = await request.get('http://localhost:81/user/current', {
          withCredentials: true
        });
        // console.log(response.data,"这是反馈的用户信息")
        if (response && response.code === 200) {
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

    // 获取任务列表
    async fetchRequests() {
      try {
        const uid = await this.getCurrentUserId();
        if (!uid) {
          console.error('无法获取用户ID');
          return;
        }

        // 方案2：获取所有任务然后在前端过滤
        const allResponse = await request.get('http://localhost:81/request/list', {
          params: {
            uid: uid
            // 不传queryType获取所有状态的任务
          }
        });

        if (allResponse && allResponse.code === 200) {
          // 进行中任务（risSolve=0或1）
          this.progressOngoing = allResponse.data
              .filter(item => item.risSolve === 0 || item.risSolve === 1)
              .map(item => this.mapRequestToTask(item));

          // 已完成任务（risSolve=2）
          this.progressDone = allResponse.data
              .filter(item => item.risSolve === 2)
              .map(item => this.mapRequestToTask(item, true));
        }
      } catch (error) {
        console.error('获取任务列表失败:', error);
        this.$message.error('获取任务列表失败，请稍后重试');
      }
    },

// 辅助方法：将后端请求数据映射为前端任务对象
    mapRequestToTask(item, isDone = false) {
      // 设置默认值防止undefined
      item = item || {};

      // 根据risSolve设置状态 (0=未接取，1=已接取)
      let status = 'pending'; // 默认未接取
      if (item.risSolve === 1) {
        status = 'accepted';
      }
      if (isDone) {
        status = 'done';
      }

      return {
        id: item.rid || item.id || 0,
        type: this.getRequestTypeText(item.rtype || item.type),
        desc: item.rcontent || item.content || '无描述内容',
        urgency: this.getUrgencyText(item.rurgent || item.urgent),
        address: item.raddress || item.address || '',
        status: status,
        helpType: (item.rIsOnline === 1 || item.isOnline) ? 'online' : 'offline',
        createTime: item.rCreateTime || item.createTime || ''
      };
    },


    // 获取需求类型对应的文本
    getRequestTypeText(type) {
      const typeMap = {
        0: '日常生活',
        1: '医疗协助',
        2: '交通出行',
        3: '社交陪伴',
        4: '其他'
      };
      return typeMap[type] || '其他';
    },

    // 获取紧急程度对应的文本
    getUrgencyText(urgency) {
      const urgencyMap = {
        0: 'normal',
        1: 'medium',
        2: 'urgent'
      };
      return urgencyMap[urgency] || 'normal';
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
      const statusMap = {
        'pending': '未被接取',
        'accepted': '已被接取',
        'done': '已完成'
      };
      return statusMap[status] || status;
    },
    stepIndex(status) {
      const stepMap = {
        'pending': 0,  // 未被接取
        'accepted': 1, // 已被接取
        'done': 2      // 已完成
      };
      return stepMap[status] || 0;
    },
    progressPercent(status) {
      const percentMap = {
        'pending': 33,   // 未被接取 - 33%
        'accepted': 66,  // 已被接取 - 66%
        'done': 100      // 已完成 - 100%
      };
      return percentMap[status] || 0;
    },
    setRating(idx, star) {
      this.$set(this.ratings, idx, star);
    },
    onNewAddressProvinceChange() {
      const prov = this.provinces.find(p => p.name === this.newAddress.province);
      this.newAddressCities = prov ? prov.cities : [];
      this.newAddress.city = '';
      this.newAddressDistricts = [];
      this.newAddress.district = '';
    },
    onNewAddressCityChange() {
      const prov = this.provinces.find(p => p.name === this.newAddress.province);
      const city = prov && prov.cities.find(c => c.name === this.newAddress.city);
      this.newAddressDistricts = city ? city.districts : [];
      this.newAddress.district = '';
    },
    addCommonAddress() {
      if (!this.newAddress.label || !this.newAddress.province || !this.newAddress.city || !this.newAddress.district || !this.newAddress.detail) {
        this.$message.error('请填写完整地址信息');
        return;
      }

      const newAddr = {
        label: this.newAddress.label,
        value: {
          province: this.newAddress.province,
          city: this.newAddress.city,
          district: this.newAddress.district,
          detail: this.newAddress.detail
        }
      };

      this.commonAddresses.push(newAddr);
      this.selectedCommonAddress = this.commonAddresses.length - 1;
      this.showAddAddressModal = false;
      this.$message.success('常用地址添加成功');
    },
    completeTask(taskId) {
      // 确认是否完成任务
      this.$confirm('确认志愿者已完成任务吗？', '确认完成任务', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await request.put(`/request/complete/${taskId}`);
          
          if (response && response.code === 200) {
            this.$message.success('任务已完成！');
            // 重新加载任务列表
            await this.fetchRequests();
          } else {
            this.$message.error(response?.msg || '完成任务失败');
          }
        } catch (error) {
          console.error('完成任务出错:', error);
          this.$message.error('完成任务失败');
        }
      }).catch(() => {
        // 用户取消操作
        this.$message.info('已取消操作');
      });
    },
    viewMessages(taskId) {
      // 实现查看消息的功能
      console.log(`查看消息：任务ID ${taskId}`);
      
      // 从本地存储获取消息历史
      const allMessages = JSON.parse(localStorage.getItem('messageHistory') || '[]');
      
      // 筛选当前任务的消息
      this.currentMessages = allMessages.filter(msg => msg.taskId == taskId);
      
      // 按时间排序
      this.currentMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      this.showMessagesModal = true;
    },
    closeMessagesModal() {
      this.showMessagesModal = false;
      this.currentMessages = [];
      this.replyMessage = '';
    },
    sendReply() {
      // 实现发送回复的功能
      if (!this.replyMessage.trim()) {
        this.$message.warning('请输入回复内容');
        return;
      }

      // 显示发送中的提示
      this.$message.info('正在发送回复...');

      // 模拟发送回复
      setTimeout(() => {
        // 创建回复消息记录
        const replyRecord = {
          taskId: this.currentMessages[0]?.taskId || 'unknown',
          senderName: '求助者',
          message: this.replyMessage,
          timestamp: new Date().toLocaleString(),
          type: 'sent'
        };

        // 保存到本地存储
        let messageHistory = JSON.parse(localStorage.getItem('messageHistory') || '[]');
        messageHistory.push(replyRecord);
        localStorage.setItem('messageHistory', JSON.stringify(messageHistory));

        // 添加到当前消息列表
        this.currentMessages.push(replyRecord);

        this.$message.success('回复发送成功！');
        this.replyMessage = '';
      }, 1000);
    },
    // 获取当前位置
    getCurrentLocation() {
      if (!navigator.geolocation) {
        this.$message.error('您的浏览器不支持地理定位功能');
        return;
      }

      this.$message.info('正在获取您的位置信息...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('获取位置失败:', error);
          let errorMessage = '获取位置失败';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '请允许浏览器获取位置权限';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '位置信息不可用';
              break;
            case error.TIMEOUT:
              errorMessage = '获取位置超时';
              break;
          }
          this.$message.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    },

    // 反向地理编码（将坐标转换为地址）
    async reverseGeocode(latitude, longitude) {
      try {
        // 这里使用免费的Nominatim服务进行反向地理编码
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        
        if (!response.ok) {
          throw new Error('地理编码服务不可用');
        }

        const data = await response.json();
        
        if (data.address) {
          // 解析地址信息
          const address = data.address;
          let province = address.state || address.province || '';
          let city = address.city || address.town || address.county || '';
          let district = address.suburb || address.district || address.neighbourhood || '';
          let detail = address.road || address.house_number || '';

          // 处理中国地址的特殊情况
          if (address.country_code === 'cn') {
            // 中国地址处理
            if (address.state) {
              province = address.state;
            }
            if (address.city) {
              city = address.city;
            }
            if (address.suburb) {
              district = address.suburb;
            }
          }

          // 尝试匹配我们的省份数据
          const matchedProvince = this.provinces.find(p => 
            p.name.includes(province) || province.includes(p.name)
          );

          if (matchedProvince) {
            this.newRequest.address.province = matchedProvince.name;
            this.onProvinceChange();
            
            // 尝试匹配城市
            const matchedCity = matchedProvince.cities.find(c => 
              c.name.includes(city) || city.includes(c.name)
            );
            
            if (matchedCity) {
              this.newRequest.address.city = matchedCity.name;
              this.onCityChange();
              
              // 尝试匹配区县
              const matchedDistrict = matchedCity.districts.find(d => 
                d.includes(district) || district.includes(d)
              );
              
              if (matchedDistrict) {
                this.newRequest.address.district = matchedDistrict;
              }
            }
          }

          // 设置详细地址
          if (detail) {
            this.newRequest.address.detail = detail;
          }

          this.$message.success('位置信息已自动填充');
        } else {
          this.$message.warning('无法解析当前位置的详细地址');
        }
      } catch (error) {
        console.error('反向地理编码失败:', error);
        this.$message.error('无法获取当前位置的地址信息');
      }
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
  justify-content: center;
  align-items: center;
}
.urgency-group label {
  font-size: 22px;
  padding: 4px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.urgency-group input[type="radio"] {
  width: 22px;
  height: 22px;
  margin-right: 8px;
}
.urgency-group label.urgency-normal { color: #4CAF50 !important; }
.urgency-group label.urgency-urgent { color: #FFC107 !important; }
.urgency-group label.urgency-emergency { color: #F44336 !important; }
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
.status-accepted { color: #2196f3; }
.status-done { color: #4caf50; }
.status-pending { color: #ff9800; }
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
.address-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.address-select-group,
.address-input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 140px;
}

.address-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.common-address-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.common-address-select {
  flex: 1;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #495057;
}

.common-address-select:focus {
  border-color: #4CAF50;
  background: white;
}

.add-address-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}

.add-address-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.add-address-btn:active {
  transform: translateY(0);
}

.add-address-btn i {
  font-size: 14px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-body .form-group {
  margin-bottom: 20px;
}

.modal-body label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.modal-body input,
.modal-body select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.modal-body input:focus,
.modal-body select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
  color: #333;
}

.btn-confirm {
  background: #4CAF50;
  color: white;
}

.btn-confirm:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.address-row select,
.address-row input {
  width: 100%;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  padding: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.address-row select:focus,
.address-row input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.address-row select {
  background: white;
  cursor: pointer;
}

.address-row input {
  min-width: 200px;
}

@media (max-width: 768px) {
  .address-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .address-select-group,
  .address-input-group {
    min-width: 100%;
  }
  
  .address-row input {
    min-width: 100%;
  }
}

/* 完成任务按钮样式 */
.task-actions {
  margin-top: 12px;
  text-align: center;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.complete-task-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.complete-task-btn:hover {
  background: #45a049;
}

.complete-task-btn:active {
  background: #3d8b40;
}

.view-messages-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-messages-btn:hover {
  background: #1976D2;
}

.view-messages-btn i {
  font-size: 14px;
}

/* 消息弹窗样式 */
.messages-modal {
  max-width: 700px;
  max-height: 80vh;
}

.messages-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  background: #f9f9f9;
}

.empty-messages {
  text-align: center;
  color: #666;
  padding: 20px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s ease;
}

.message-item:hover {
  border-color: #2196F3;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sender-name {
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

.message-type {
  text-align: right;
}

.message-type span {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.message-type .sent {
  background: #4CAF50;
  color: white;
}

.message-type .received {
  background: #2196F3;
  color: white;
}

.reply-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-section label {
  font-weight: bold;
  color: #666;
}

.reply-section textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
}

.btn-send {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-send:hover {
  background: #45a049;
}

.btn-send:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.address-preview {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.preview-label {
  font-weight: bold;
}

.preview-content {
  margin-left: 12px;
}

/* 地址选择相关样式 */
.required {
  color: #f44336;
  font-weight: bold;
}

.address-tip {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #4CAF50;
}

.common-address-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.common-address-select {
  flex: 1;
}

.add-address-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}

.add-address-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.add-address-btn:active {
  transform: translateY(0);
}

.address-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.address-select-group,
.address-input-group {
  flex: 1;
  min-width: 150px;
}

.address-row select,
.address-row input {
  width: 100%;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  padding: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.address-row select:focus,
.address-row input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.address-row select {
  background: white;
  cursor: pointer;
}

.address-row input {
  min-width: 200px;
}

@media (max-width: 768px) {
  .address-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .address-select-group,
  .address-input-group {
    min-width: 100%;
  }
  
  .address-row input {
    min-width: 100%;
  }
}

.location-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}

.location-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
}

.location-btn:active {
  transform: translateY(0);
}
</style>