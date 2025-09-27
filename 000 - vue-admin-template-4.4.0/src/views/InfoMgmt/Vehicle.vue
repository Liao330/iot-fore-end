<!-- eslint-disable vue/valid-template-root -->
<!-- 资料管理下拉框的车辆管理 -->
<template>
  <div class="wrapper">
    <!-- 搜索栏 -->
    <el-card>
      <el-row class="search">
        <el-col :span="6">
          <div class="subsidiary">
            <span
              class="demonstration"
              style="white-space: nowrap"
            >所属公司</span>
            <el-cascader
              v-model="subsidiaryIds"
              :options="subsidiaries"
              :props="{
                multiple: true,
                value: 'value',
                label: 'label',
                children: 'children',
              }"
              collapse-tags
              clearable
              placeholder="请选择公司"
              class="full-width"
              @change="handleSubsidiaryChange"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="licenseNumber">
            <span
              class="demonstration"
              style="white-space: nowrap"
            >车牌号码</span>
            <el-input
              v-model="licenseNumber"
              placeholder:
              请输入车牌号码
              clearable
              class:
              full-width
            />
          </div>
        </el-col>
        <el-col
          :span="
            6"
        >
          <div
            class="
          role"
          >
            <span
              class="demonstration"
              style="white-space: nowrap"
            >设备编码</span>
            <el-input
              v-model="deviceCode"
              placeholder="请输入设备编码"
              clearable
              class="full-width"
            />
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
  <!-- </span>
  </div>
  </el-col> -->
  <el-col :span="6">
    <div class="state">
      <span
        class="demonstration"
        style="white-space: nowrap"
      >设备类型</span>
      <el-select
        v-model="deviceType"
        clearable
        placeholder="请选择"
        class="full-width"
      >
        <el-option
          v-for="item in Type"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </el-col>
  <!-- </el-row> -->
  <el-row>
    <el-col :span="12">
      <div class="time">
        <span class="demonstration">创建时间</span>
        <el-date-picker
          v-model="createTime"
          type="daterange"
          unlink-panels="true"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        />
      </div>
    </el-col>
    <el-col :span="12">
      <div class="button-wrapper">
        <el-button
          type="primary"
          round
          size="small"
          icon="el-icon-search"
          @click="query"
        >查询</el-button>
        <el-button
          type="primary"
          plain
          size="small"
          @click="openEditUI(null)"
        >添加</el-button>
        <el-button
          type="primary"
          plain
          size="small"
          @click="moreDelete()"
        >批量删除</el-button>
        <el-button
          type="primary"
          plain
          size="small"
          @click="exportData()"
        >查询导出</el-button>
      </div>
    </el-col>
  </el-row>
  <!-- </el-card> -->
  <!-- 查询结果列表 -->
  <el-card>
    <el-table
      ref="multipleTable"
      :data="vehicleList"
      border="true"
      tooltip-effect="dark"
      style="width: 100%"
      :row-key="getRowKeys"
      @selection-change="handleSelectionChange"
    >
      <!-- 表头数据 vehicleList是数据 columns是列名数组-->
      <el-table-column
        type="selection"
        width="50"
        :reserve-selection="true"
        fixed="left"
      />
      <el-table-column
        label="车牌号码"
        prop="licenseNumber"
        width="120"
        show-overflow-tooltip="true"
        fixed="left"
      />
      <el-table-column
        v-for="(col, index) in columns"
        :key="index"
        :label="col.label"
        :prop="col.prop"
        :width="col.width"
        show-overflow-tooltip="true"
      />
      <el-table-column label="操作" width="90" fixed="right">
        <template slot-scope="scope">
          <div class="button-container">
            <!-- 修改与删除 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              circle="true"
              @click="openEditUI(scope.row)"
            />
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              @click="handleDelete(scope.row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 点击修改按钮弹出的对话框，dialogVisible变量控制对话框是否显示 -->
    <!-- 添加车辆和修改车辆，使用同一个对话框 -->
    <el-dialog
      :title="title"
      :visible="dialogVisible"
      width="50%"
      center
      @close="dialogVisible = false"
    >
      <div class="form-box">
        <el-form
          ref="vehicleForm"
          :model="vehicleForm"
          :rules="rules"
          label-width="80px"
        >
          <el-row>
            <!-- 车牌号码 -->
            <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
              <el-form-item
                label="车牌号码"
                prop="licenseNumber"
                label-width="130px"
              >
                <el-input
                  v-model="vehicleForm.licenseNumber"
                  type="input"
                  class="full-width"
                  placeholder="请输入车牌号码"
                />
              </el-form-item>
            </el-col>
            <!-- 车辆颜色 -->
            <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
              <el-form-item
                label="车辆颜色"
                prop="vehicleColor"
                label-width="130px"
              >
                <el-input
                  v-model="vehicleForm.vehicleColor"
                  type="input"
                  class="full-width"
                  placeholder="请输入车辆颜色"
                />
              </el-form-item>
            </el-col>
            <!-- 所属公司 -->
            <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
              <el-form-item
                label="所属公司"
                prop="subsidiaryId"
                label-width="130px"
              >
                <el-cascader
                  v-model="vehicleForm.subsidiaryId"
                  :options="subsidiaries"
                  :show-all-levels="false"
                  clearable
                  placeholder="请选择公司"
                  class="full-width"
                  @change="handleSubsidiary"
                />
              </el-form-item>
            </el-col>
            <!-- 设备编号 -->
            <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
              <el-form-item
                label="设备编号"
                prop="deviceCode"
                label-width="130px"
              >
                <el-input
                  v-model="vehicleForm.deviceCode"
                  type="input"
                  class="full-width"
                  placeholder="请输入设备编号"
                />
              </el-form-item>
            </el-col>
            <!-- 设备类型 -->
            <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
              <el-form-item
                label="设备类型"
                prop="deviceType"
                label-width="130px"
              >
                <el-select
                  v-model="vehicleForm.deviceType"
                  clearable
                  placeholder="请选择"
                  class="full-width"
                >
                  <el-option
                    v-for="item in Type"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 流量卡号 -->
            <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
              <el-form-item
                label="流量卡号"
                prop="cardNumber"
                label-width="130px"
              >
                <el-input
                  v-model="vehicleForm.cardNumber"
                  type="input"
                  class="full-width"
                  placeholder="请输入流量卡号"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="btns clear-fix">
          <div>
            <el-button type="primary" @click="submitUser">确定</el-button>
            <el-button @click="cleanFrom">重置</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-card>
  <!-- 分页组件 -->
  <div class="pagination-container">
    <el-pagination
      class="pagination-right"
      :current-page="searchModel.pageNo"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
  <!-- </div> -->
</template>

<script>
import {
  getVehicleList,
  getVehicle,
  addVehicle,
  deleteVehicle,
  updateVehicle,
  updateVehicleData,
  moreDelete,
  exportVehicle
} from '@/api/vehicle.js'
import { getAllCompaniesWithSubsidiaries } from '@/api/company.js'
import { getVehicleData, getToken } from '@/apis/real-time.js'
import FileSaver from 'file-saver'
export default {
  data() {
    return {
      // 平台的token
      token: '',
      // 后端的车辆信息列表
      licenseNumbers: {},
      // 平台接入的实时数据去访问后端进行车辆表的修改，实现实时信息
      vehicleData: {},

      props: { multiple: true },
      // 所有公司及子公司子公司
      subsidiaries: [],
      // 查询选中的子公司
      subsidiaryIds: '',
      // 添加选中的子公司
      subsidiaryId: '',
      // 处理选中的公司id,获取子公司id
      selectedSubsidiaryIds: [],
      // 车牌号码licenseNumber
      licenseNumber: '',
      // 车辆的颜色
      vehicleColor: '',
      // 流量卡号
      cardNumber: '',
      // 设备编码deviceCode
      deviceCode: '',
      // 设备类型deviceType type
      deviceType: '',
      Type: [
        {
          value: '1',
          label: '有线'
        },
        {
          value: '0',
          label: '无线'
        }
      ],
      value: '',
      // 创建时间
      createTime: '',
      // 安装时间
      installTime: '',
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      value1: '',
      value2: '',
      // 表格列表
      vehicleList: [],
      // 表头数据
      columns: [
        // {
        //   label: "车牌号码",
        //   prop: "licenseNumber",
        //   width: "120",
        // },
        {
          label: '车辆颜色',
          prop: 'vehicleColor',
          width: '100'
        },
        {
          label: '所属公司',
          prop: 'subsidiaryName',
          width: '160'
        },
        {
          label: '设备编码',
          prop: 'deviceCode',
          width: '160'
        },
        {
          label: '流量卡号',
          prop: 'cardNumber',
          width: '160'
        },
        {
          label: '设备类型',
          prop: 'deviceType',
          width: '100'
        },
        {
          label: '创建时间',
          prop: 'newCreateTime',
          width: '160'
        },
        {
          label: '安装时间',
          prop: 'installTime',
          width: '160'
        }
      ],
      // 多选选中的数据
      multipleSelection: [],
      // 列表数据总数
      total: 0,
      // 查询条件集合
      searchModel: {
        // 页码
        pageNo: 1,
        // 每页条数
        pageSize: 10
      },
      // 对话框，修改，添加车辆
      // title: 对话框标题《添加车辆》或者是《车辆管理-修改》
      title: '',
      // 修改添加车辆对话框绑定数据
      vehicleForm: {
        vehicleId: '',
        licenseNumber: '',
        subsidiaryId: '',
        vehicleColor: '',
        deviceCode: '',
        deviceType: '',
        cardNumber: ''
      },
      // 对话框数据规则
      rules: {
        licenseNumber: [
          { required: true, message: '必须填写车牌号码', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        subsidiaryId: [
          { required: true, message: '必须选中公司', trigger: 'blur' }
        ],
        vehicleColor: [
          { required: true, message: '必须填写车辆颜色', trigger: 'blur' }
        ],
        deviceCode: [
          { required: false, message: '必须填写设备编码', trigger: 'blur' }
        ],
        deviceType: [
          { required: false, message: '必须选中设备类型', trigger: 'blur' }
        ],
        cardNumber: [
          { required: false, message: '必须填写流量卡号', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      dialogVisible: false // 是否显示对话框
    }
  },
  // 挂载函数，直接应用的
  mounted() {
    this.getToken()
    this.get()
  },
  methods: {
    // 获取平台的token
    async getToken() {
      const res = await getToken()
      if (res.code === 200) {
        this.token = res.data.token
      }
      this.VehicleOnline()
    },
    // 获取登录用户id
    get() {
      this.userId = localStorage.getItem('userId')
      this.roleId = localStorage.getItem('roleId')
      this.searchModel.userId = this.userId
      this.getAllCompaniesWithSubsidiaries()
      this.getVehicleList()
    },
    // 先获取车辆信息中的车牌号，去请求平台获取实时车辆的在线状态，项目再带着车辆状态和车牌号码去后端更改数据库表
    async VehicleOnline() {
      const res = await getVehicle()
      // 获取车牌号列表
      this.licenseNumbers = res.data.map((vehicle) => vehicle.licenseNumber)
      // 向参考平台请求车辆的实时数据
      const data = await getVehicleData(this.token, this.licenseNumbers)
      console.info('更新的数据数据11111', data.data.data)
      // 将车辆数据data的部分信息赋值给vehicleData，一起传递到后端更新车辆表和车辆实时数据表
      this.vehicleData = data.data.data.map((vehicle) => {
        return {
          licenseNumber: vehicle.vehicle_name,
          speed: vehicle.speed,
          direction: vehicle.dir_str,
          serviceTime: this.ChangeTime(vehicle.recvtime),
          deviceTime: this.ChangeTime(vehicle.gpstime),
          latitude: vehicle.lat,
          longitude: vehicle.lng,
          locationType: vehicle.location_mode_str,
          location: vehicle.adree,
          onlineStatus: vehicle.online ? 1 : 0
        }
      })
      console.info('更新的数据数据22222', this.vehicleData[1])
      for (let i = 0; i < this.vehicleData.length; i++) {
        await updateVehicleData(this.vehicleData[i]) // 逐个传递车辆信息给updateVehicleData函数，实时数据，修改车辆表和车辆数据表
      }
      console.info('更新的数据数据33333')
    },
    // 获取所有公司及其子公司信息
    async getAllCompaniesWithSubsidiaries() {
      const searchModel = {}
      searchModel.userId = this.userId
      const res = await getAllCompaniesWithSubsidiaries(searchModel)
      if (res.code === 20000) {
        this.subsidiaries = res.data.map((company) => {
          return {
            value: company.companyId,
            label: company.companyName,
            children: company.subsidiaries.map((subsidiary) => {
              return {
                value: subsidiary.subsidiaryId,
                label: subsidiary.subsidiaryName
              }
            })
          }
        })
      }
      // console.info("公司信息：{}", this.subsidiaries);
    },
    // 查询条件，所属公司
    handleSubsidiaryChange(value) {
      console.log('Selected Subsidiaries: ', value)
      // 根据选中的子公司加载对应的车牌号码选择数据
      if (value && value.length > 0) {
        this.selectedSubsidiaryIds = value.map((subsidiary) => subsidiary[1]) // 提取每个子公司的ID
        console.log('selectedSubsidiaryIds: ', this.selectedSubsidiaryIds)
        this.getLicenseNumbersBySubsidiary(this.selectedSubsidiaryIds)
      } else {
        this.licenseNumbers = []
        this.selectedSubsidiaryIds = []
      }
    },
    // 添加车辆的所属公司
    handleSubsidiary(value) {
      // console.log("Selected Subsidiaries: ", value);
      this.vehicleForm.subsidiaryId = value[value.length - 1] // 将添加按钮选中的子公司赋值给subsidiaryId
    },

    // 转换设备类型
    getDeviceType(str) {
      return str === 1 ? '有线' : '无线'
    },

    // 转换时间格式范围给后端
    ChangeCreatedAt(date) {
      const startDate = new Date(date[0])
      const endDate = new Date(date[1])

      // 获取起始时间的ISO格式字符串并添加本地时区偏移量
      const startISOString = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      ).toISOString()

      // 获取结束时间的ISO格式字符串并添加本地时区偏移量
      const endISOString = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000 + 86399999
      ).toISOString()

      return [startISOString, endISOString]
    },
    // 转换时间格式为LocalDateTime给后端
    ChangeTime(dateString) {
      // 将接收到的日期字符串转换为 Date 对象
      const dateObject = new Date(dateString)
      // 构建 LocalDateTime 对象，需确保格式符合 ISO 标准
      const localDateTime = new Date(
        dateObject.getTime() - dateObject.getTimezoneOffset() * 60000
      ).toISOString()
      return localDateTime
    },
    // 转换创建时间,安装时间，再显示在列表里
    getTime(date) {
      const dateNow = new Date(date)
      function convert(data) {
        return data < 10 ? '0' + data : data
      }
      const year = dateNow.getFullYear()
      const month = convert(dateNow.getMonth() + 1)
      const day = convert(dateNow.getDate())

      const hours = convert(dateNow.getHours())
      const minutes = convert(dateNow.getMinutes())
      const seconds = convert(dateNow.getSeconds())
      const dateStr =
        year +
        '-' +
        month +
        '-' +
        day +
        ' ' +
        hours +
        ':' +
        minutes +
        ':' +
        seconds
      return dateStr
    },
    // 模糊搜索按钮
    async query() {
      // this.searchModel.subsidiaryIds = this.subsidiaryIds;
      // this.searchModel.subsidiaryIds = this.subsidiaryIds
      //   ? this.subsidiaryIds
      //   : [];
      this.searchModel.subsidiaryId = this.selectedSubsidiaryIds
      this.searchModel.licenseNumber = this.licenseNumber
      this.searchModel.deviceCode = this.deviceCode
      this.searchModel.deviceType = this.deviceType
      this.searchModel.pageNo = 1
      if (!this.createTime) {
        this.searchModel.createTime = null
      } else {
        this.searchModel.createTime = this.ChangeCreatedAt(this.createTime)
      }
      await this.getVehicleList()
    },
    // 获取车俩列表数据
    async getVehicleList() {
      // console.log("能到");
      // console.log("选择的条件参数");
      // console.log(this.searchModel);
      const res = await getVehicleList(this.searchModel)

      // console.log("车辆条件查询响应过来的数据列表");
      // console.log(res.data);
      // 20000代表成功，rows是后端返回的总条数
      if (res.code === 20000) {
        // console.log("数据列表接收前");
        // console.log(this.vehicleList);
        this.vehicleList = res.data.records.map((item) => {
          if (item.deviceType === 1) {
            item.deviceType = '有线'
          } else if (item.deviceType === 0) {
            item.deviceType = '无线'
          }
          if (item.createTime != null) {
            // 在这里保存原始格式的createdAt当作请求参数，
            // 设置一个新变量newCreatedAt存储显示在列表上的时间格式，newCreatedAt当作显示数据
            item.newCreateTime = item.createTime
          }
          if (item.installTime != null) {
            item.installTime = this.getTime(item.installTime)
          }
          return item
        })
        // 转换vehicleList.newCreateTime格式
        this.vehicleList.forEach((item) => {
          if (item.newCreateTime != null) {
            item.newCreateTime = this.getTime(item.newCreateTime)
          }
        })
        // console.log("响应数据2");
        // console.log(res);
        // console.log("数据列表赋值后");
        // console.log(this.vehicleList);
        this.total = res.data.total
      }
    },
    // 检查是否除了页码和页数外还有其他条件
    checkIfHasOtherConditions() {
      // 判断是否有其他条件，例如输入框和选择框的条件
      const { keyword, type } = this.searchModel
      return keyword !== '' || type !== ''
    },

    // 点击添加,修改，打开对话框
    openEditUI(row) {
      if (row == null) {
        if (this.roleId === '4') {
          // 如果用户权限为4,运维员，显示警告提示并退出方法
          this.$message.warning('没有权限添加车辆')
          return
        } else {
          this.title = '添加车辆'
          this.cleanForm() // 清空表单数据
          this.dialogVisible = true
        }
      } else {
        this.title = '修改车辆'
        this.dialogVisible = true
        // console.log("修改", row);
        // console.log("表单数据", this.vehicleForm);
        // 数据回显
        this.$nextTick(() => {
          this.vehicleForm.vehicleId = row.vehicleId
          this.vehicleForm.licenseNumber = row.licenseNumber
          this.vehicleForm.subsidiaryId = row.subsidiaryId
          this.vehicleForm.vehicleColor = row.vehicleColor
          this.vehicleForm.deviceCode = row.deviceCode
          this.vehicleForm.deviceType = row.deviceType
          this.vehicleForm.cardNumber = row.cardNumber
        })
      }
    },
    // 重置对话框的表单数据
    cleanForm() {
      this.vehicleForm = {
        vehicleId: '',
        licenseNumber: '',
        subsidiaryId: '',
        vehicleColor: '',
        deviceCode: '',
        deviceType: '',
        cardNumber: ''
      }
    },
    // 修改与添加车辆，，对话框的提交内容方法
    async submitUser() {
      // 触发表单验证
      this.$refs.vehicleForm.validate(async(valid) => {
        if (valid) {
          // 提交请求给后台
          try {
            let res
            // console.info("看有没有id数据");
            // console.info(this.vehicleForm);
            if (this.vehicleForm.vehicleId) {
              // 如果存在id，说明是修改操作
              // 将deviceType字段转换
              if (this.vehicleForm.deviceType === '有线') {
                this.vehicleForm.deviceType = 1
              } else if (this.vehicleForm.deviceType === '无线') {
                this.vehicleForm.deviceType = 0
              }
              // console.info(
              //   "修改的请求数据设备类型：",
              //   this.vehicleForm.deviceType
              // );
              res = await updateVehicle(this.vehicleForm)
              if (res.code === 20000) {
                // 清空表单
                this.cleanFrom()
                // 关闭对话框
                this.dialogVisible = false
                // 刷新用户列表
                this.getVehicleList()
                // 显示成功消息提示
                this.$message({
                  message: '修改成功',
                  type: 'success', // 这里是消息提示的类型，success 表示操作成功
                  duration: 2000 // 显示时间毫秒数，默认3000
                })
              } else {
                // 如果有错误，也可以用 message 弹出来提示错误
                this.$message({
                  message: res.message || '修改失败，请稍后重试', // 使用接口返回的错误信息或默认错误信息
                  type: 'error', // 错误类型
                  duration: 2000
                })
              }
            } else {
              // 否则是添加用户操作
              res = await addVehicle(this.vehicleForm)
              if (res.code === 20000) {
                // 清空表单
                this.cleanFrom()
                // 关闭对话框
                this.dialogVisible = false
                // 刷新用户列表
                this.getVehicleList()
                // 显示成功消息提示
                this.$message({
                  message: '添加成功',
                  type: 'success', // 这里是消息提示的类型，success 表示操作成功
                  duration: 2000 // 显示时间毫秒数，默认3000
                })
              } else {
                // 如果有错误，也可以用 message 弹出来提示错误
                this.$message({
                  message: res.message || '添加失败，请稍后重试', // 使用接口返回的错误信息或默认错误信息
                  type: 'error', // 错误类型
                  duration: 2000
                })
              }
            }
          } catch (error) {
            // console.error(error);
            this.$message.error('请求错误，请稍后重试')
          }
        } else {
          // console.log("error submit!!");
          return false
        }
      })
    },
    // 修改对话框的重置内容方法
    cleanFrom() {
      this.$refs['vehicleForm'].resetFields()
    },
    // 单个车辆删除按钮
    async handleDelete(row) {
      // 删除操作
      // console.log("删除", row);
      // 注意用反引号`您确定删除车辆 ${row.licenseNumber} ?`
      this.$confirm(`您确定删除车辆：${row.licenseNumber} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteVehicle(row.vehicleId).then((response) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 2000
            })
            this.getVehicleList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
            duration: 2000
          })
        })
    },
    // 多选处理，val：当前选中的行
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.multipleSelection.forEach((item) => {
        if (item.deviceType === '有线') {
          item.deviceType = 1
        } else if (item.deviceType === '无线') {
          item.deviceType = 0
        }
        item.installTime = ''
      })
    },
    // 批量删除
    async moreDelete() {
      // console.log("批量删除");
      if (this.multipleSelection.length === 0) {
        this.$message({
          type: 'warning',
          message: '请选择要删除的车辆',
          duration: 2000
        })
        return
      }
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          moreDelete(this.multipleSelection).then((response) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 2000
            })
            // 从用户列表中移除已删除的用户
            for (let i = 0; i < this.vehicleList.length; i++) {
              for (let j = 0; j < this.multipleSelection.length; j++) {
                if (this.vehicleList[i].id === this.multipleSelection[j].id) {
                  this.vehicleList.splice(i, 1)
                  i--
                  break
                }
              }
            }
            // 重置多选框和已选用户列表
            this.multipleSelection = []
            // 重新获取用户列表数据
            this.getVehicleList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
            duration: 2000
          })
        })
    },
    // 查询导出
    async exportData() {
      const result = await exportVehicle(this.searchModel) // 导出所有的员工接口
      // console.info("导出", result);
      if (result) {
        FileSaver.saveAs(result, '车辆管理.xlsx') // 下载文件
      }
    },

    // 每页数据
    handleSizeChange(pageSize) {
      // 每页的数据数
      this.searchModel.pageSize = pageSize
      this.getVehicleList()
    },
    // 当前页
    handleCurrentChange(pageNo) {
      // 当前页
      this.searchModel.pageNo = pageNo
      this.getVehicleList()
    },
    // 多选，记录选中的行id，跨页选中的行
    getRowKeys(row) {
      return row.vehicleId
    }
  }
}
</script>

<style>
.wrapper {
  width: 100%;
}
.search {
  background-color: #fff;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  /* justify-content: space-between; 将子元素水平分布到两端 */
}

.demonstration {
  margin-right: 10px;
}
.subsidiary,
.licenseNumber,
.role,
.state {
  display: flex;
  align-items: center;
  flex-flow: 1;
  margin-right: 20px;
}

.button-wrapper {
  flex-flow: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;
}
.button-container {
  display: flex;
  align-items: center;
}
.el-button {
  width: 80px;
}
.el-card {
  margin-bottom: 10px;
}
.el-pagination {
  margin-top: 10px;
}
.el-card__body {
  padding: 10px !important;
}

.pagination-container {
  text-align: center;
}

.pagination-right {
  display: inline-block;
}

/* 修改对话框中的样式 */
.btns {
  text-align: center;
}
</style>
