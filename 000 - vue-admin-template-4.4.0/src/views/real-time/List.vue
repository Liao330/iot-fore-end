<!-- 实时状态下的列表监控 -->
<template>
  <div class="wrapper">
    <!-- 搜索栏 -->
    <el-card>
      <el-row class="search">
        <el-col :span="6">
          <!-- 所属公司，总公司和子公司的级联选择器 -->
          <div class="subsidiary">
            <span class="demonstration" style="white-space: nowrap"
              >所属公司</span
            >
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
              @change="handleSubsidiaryChange"
              class="full-width"
            ></el-cascader>
          </div>
        </el-col>
        <!-- 车牌号码 -->
        <el-col :span="6">
          <div class="licenseNumber">
            <span class="demonstration" style="white-space: nowrap"
              >车牌号码</span
            >
            <el-select
              v-model="licenseNumber"
              multiple
              placeholder="请选择车牌号码"
              clearable
              class="full-width"
            >
              <el-option
                v-for="number in licenseNumbers"
                :key="number"
                :label="number"
                :value="number"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
        <!-- 设备编码 -->
        <el-col :span="6">
          <div class="role">
            <span class="demonstration" style="white-space: nowrap"
              >设备编码</span
            >
            <el-input
              v-model="deviceCode"
              placeholder="请输入设备编码"
              clearable
              class="full-width"
            ></el-input>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="state">
            <span class="demonstration" style="white-space: nowrap"
              >设备类型</span
            >
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
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <!-- 第二行，流量卡号 -->
      <el-row>
        <!-- 流量卡号 -->
        <el-col :span="6">
          <div class="role">
            <span class="demonstration" style="white-space: nowrap"
              >流量卡号</span
            >
            <el-input
              v-model="cardNumber"
              placeholder="请输入流量卡号"
              clearable
              class="full-width"
            ></el-input>
          </div>
        </el-col>
        <!-- 操作按钮 -->
        <el-col :span="18">
          <div class="button-wrapper">
            <el-button
              type="primary"
              round
              @click="query"
              size="small"
              icon="el-icon-search"
              >查询</el-button
            >
            <el-button type="primary" plain @click="exportData()" size="small"
              >查询导出</el-button
            >
          </div>
        </el-col>
      </el-row>
    </el-card>
    <!-- 查询结果列表 -->
    <el-card>
      <el-table
        ref="multipleTable"
        :data="vehicleDateList"
        border="true"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="getRowKeys"
      >
        <!-- 表头数据 vehicleDateList是数据 columns是列名数组-->
        <el-table-column
          type="selection"
          width="50"
          :reserve-selection="true"
          fixed="left"
        >
        </el-table-column>
        <el-table-column
          label="车牌号码"
          prop="licenseNumber"
          width="120"
          show-overflow-tooltip="true"
          fixed="left"
        >
        </el-table-column>
        <el-table-column
          v-for="(col, index) in columns"
          :key="index"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
          show-overflow-tooltip="true"
        >
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        class="pagination-right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import {
  getLicenseNumbersBySubsidiary,
  updateVehicleData,
  getVehicle,
} from "@/api/vehicle.js";
import { getAllCompaniesWithSubsidiaries } from "@/api/company.js";
import { getvehicleDateList, exportReal } from "@/api/real-time.js";
import FileSaver from "file-saver";
import { getVehicleData, getToken } from "@/apis/real-time.js";
export default {
  data() {
    return {
      // 平台实时数据的更新，需求token，licenseNumbers，vehicleData
      token: "",
      // 后端的车辆信息列表
      licenseNumbers2: {},
      // 平台接入的实时数据去访问后端进行车辆表的修改，实现实时信息
      vehicleData: {},

      props: { multiple: true },
      // 所有总公司及子公司，选择框数据
      subsidiaries: [],
      // 查询选中绑定的子公司，查询请求参数
      subsidiaryIds: "",
      // 处理选中的公司id,获取子公司id
      selectedSubsidiaryIds: [],
      // 绑定数据车牌号码licenseNumber，查询请求参数
      licenseNumber: "",
      // 存储车牌号码选择框数据
      licenseNumbers: [],
      // 设备编码deviceCode，查询请求参数
      deviceCode: "",
      // 设备类型deviceType type
      deviceType: "",
      Type: [
        {
          value: "1",
          label: "有线",
        },
        {
          value: "0",
          label: "无线",
        },
      ],
      value: "",
      // 流量卡号，绑定数据
      cardNumber: "",
      // 表格列表
      vehicleDateList: [],
      // 表头数据
      columns: [
        {
          label: "车俩状态",
          prop: "onlineStatus",
          width: "100",
        },
        {
          label: "所属公司",
          prop: "subsidiaryName",
          width: "160",
        },
        {
          label: "服务时间",
          prop: "serviceTime",
          width: "160",
        },
        {
          label: "设备时间",
          prop: "deviceTime",
          width: "160",
        },
        {
          label: "设备编码",
          prop: "deviceCode",
          width: "120",
        },
        {
          label: "流量卡号",
          prop: "cardNumber",
          width: "120",
        },
        {
          label: "速度",
          prop: "speed",
          width: "100",
        },
        {
          label: "方向",
          prop: "direction",
          width: "100",
        },
        {
          label: "定位类型",
          prop: "locationType",
          width: "100",
        },
        {
          label: "经度",
          prop: "longitude",
          width: "100",
        },
        {
          label: "维度",
          prop: "latitude",
          width: "100",
        },
        {
          label: "报警内容",
          prop: "alarmContent",
          width: "120",
        },
        {
          label: "位置",
          prop: "location",
          width: "160",
        },
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
        pageSize: 10,
      },
    };
  },
  methods: {
    // 平台实时数据的更新
    // 获取平台的token
    async getToken() {
      let res = await getToken();
      if (res.code === 200) {
        this.token = res.data.token;
      }
      this.VehicleData();
    },
    // 获取登录用户id
    get() {
      this.userId = localStorage.getItem("userId");
      this.roleId = localStorage.getItem("roleId");
      this.searchModel.userId = this.userId;
      this.getvehicleDateList();
      this.getAllCompaniesWithSubsidiaries();
    },
    // 先获取车辆信息中的车牌号，去请求平台获取实时车辆的在线状态，项目再带着车辆状态和车牌号码去后端更改数据库表
    async VehicleData() {
      let res = await getVehicle();
      // 获取车牌号列表
      this.licenseNumbers2 = res.data.map((vehicle) => vehicle.licenseNumber);
      // 向参考平台请求车辆的实时数据
      let data = await getVehicleData(this.token, this.licenseNumbers2);
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
          onlineStatus: vehicle.online ? 1 : 0,
        };
      });
      for (let i = 0; i < this.vehicleData.length; i++) {
        console.info("更新更新更新更新");
        await updateVehicleData(this.vehicleData[i]); // 逐个传递车辆信息给updateVehicleData函数，实时数据，修改车辆表和车辆数据表
      }
    },
    // 转换时间格式为给后端
    ChangeTime(dateString) {
      // 将接收到的日期字符串转换为 Date 对象
      const dateObject = new Date(dateString);
      // 构建 LocalDateTime 对象，需确保格式符合 ISO 标准
      const localDateTime = new Date(
        dateObject.getTime() - dateObject.getTimezoneOffset() * 60000
      ).toISOString();
      return localDateTime;
    },

    // 获取所有公司及其子公司信息
    async getAllCompaniesWithSubsidiaries() {
      const searchModel = {};
      searchModel.userId = this.userId;
      let res = await getAllCompaniesWithSubsidiaries(searchModel);
      if (res.code === 20000) {
        this.subsidiaries = res.data.map((company) => {
          return {
            value: company.companyId,
            label: company.companyName,
            children: company.subsidiaries.map((subsidiary) => {
              return {
                value: subsidiary.subsidiaryId,
                label: subsidiary.subsidiaryName,
              };
            }),
          };
        });
      }
      console.info("公司信息：{}", this.subsidiaries);
    },
    // 查询条件，处理绑定选择的所属公司数据
    handleSubsidiaryChange(value) {
      console.log("Selected Subsidiaries: ", value);
      // 根据选中的子公司加载对应的车牌号码选择数据
      if (value && value.length > 0) {
        this.selectedSubsidiaryIds = value.map((subsidiary) => subsidiary[1]); // 提取每个子公司的ID
        console.log("selectedSubsidiaryIds: ", this.selectedSubsidiaryIds);
        this.getLicenseNumbersBySubsidiary(this.selectedSubsidiaryIds);
      } else {
        this.licenseNumbers = [];
        this.selectedSubsidiaryIds = [];
      }
    },
    // 调用接口获取选中子公司下的车牌号码数据
    async getLicenseNumbersBySubsidiary(subsidiaryIds) {
      try {
        // 调用接口获取选中子公司下的车牌号码数据
        const res = await getLicenseNumbersBySubsidiary(subsidiaryIds);
        if (res.code === 20000) {
          this.licenseNumbers = res.data; // 设置车牌号码选择数据
        } else {
          this.licenseNumbers = []; // 清空车牌号码选择数据
          // 处理错误情况，例如提示用户或其他操作
          console.error("获取车牌号码数据失败：", res.message);
          this.$message.error("获取车牌号码数据失败");
        }
      } catch (error) {
        console.error(error);
        this.licenseNumbers = []; // 清空车牌号码选择数据
        // 处理异常情况，例如提示用户或其他操作
        this.$message.error("获取车牌号码数据异常");
      }
    },
    // 转换时间，显示在结果列表里
    getTime(date) {
      let dateNow = new Date(date);
      function convert(data) {
        return data < 10 ? "0" + data : data;
      }
      let year = dateNow.getFullYear();
      let month = convert(dateNow.getMonth() + 1);
      let day = convert(dateNow.getDate());

      let hours = convert(dateNow.getHours());
      let minutes = convert(dateNow.getMinutes());
      let seconds = convert(dateNow.getSeconds());
      let dateStr =
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds;
      return dateStr;
    },

    // 模糊搜索按钮
    async query() {
      this.searchModel.subsidiaryId = this.selectedSubsidiaryIds;
      this.searchModel.licenseNumbers = this.licenseNumber;
      this.searchModel.deviceCode = this.deviceCode;
      this.searchModel.deviceType = this.deviceType;
      this.searchModel.cardNumber = this.cardNumber;
      this.searchModel.pageNo = 1;
      await this.getvehicleDateList();
    },
    // 获取列表数据
    async getvehicleDateList() {
      let res = await getvehicleDateList(this.searchModel);
      // 20000代表成功，rows是后端返回的总条数
      if (res.code === 20000) {
        this.vehicleDateList = res.data.records.map((item) => {
          if (item.deviceType === 1) {
            item.deviceType = "有线";
          } else if (item.deviceType === 0) {
            item.deviceType = "无线";
          }
          if (item.onlineStatus === 1) {
            item.onlineStatus = "在线";
          } else if (item.onlineStatus === 0) {
            item.onlineStatus = "离线";
          }
          if (item.serviceTime != null) {
            item.serviceTime = this.getTime(item.serviceTime);
          }
          if (item.deviceTime != null) {
            item.deviceTime = this.getTime(item.deviceTime);
          }
          return item;
        });
        this.total = res.data.total;
      }
    },
    // 检查是否除了页码和页数外还有其他条件
    checkIfHasOtherConditions() {
      // 判断是否有其他条件，例如输入框和选择框的条件
      const { keyword, type } = this.searchModel;
      return keyword !== "" || type !== "";
    },

    // 多选处理，val：当前选中的行
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    // 查询导出
    async exportData() {
      const result = await exportReal(this.searchModel); // 导出所有的员工接口
      console.info("导出", result);
      if (result) {
        FileSaver.saveAs(result, "列表监控.xlsx"); // 下载文件
      }
    },

    // 每页数据
    handleSizeChange(pageSize) {
      // 每页的数据数
      this.searchModel.pageSize = pageSize;
      this.getvehicleDateList();
    },
    // 当前页
    handleCurrentChange(pageNo) {
      // 当前页
      this.searchModel.pageNo = pageNo;
      this.getvehicleDateList();
    },
    // 多选，记录选中的行id，跨页选中的行
    getRowKeys(row) {
      return row.vehicleId;
    },
  },
  // 挂载函数，直接应用的
  mounted() {
    this.getToken();
    this.get();
  },
};
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
  justify-content: space-between; /* 将子元素水平分布到两端 */
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
</style>
