<!-- 实时状态下拉框的实时监控 -->
<template>
  <div class="wrapper">
    <!-- 顶部 -->
    <el-row class="dingbu">
      <el-col :span="8">
        <el-card class="card-left" shadow="never">
          <el-row :gutter="20" class="shange">
            <el-col :span="6"
              ><div
                class="grid-content bg-purple"
                :style="{ backgroundColor: allBgColor, color: allTextColor }"
                @click="handleAll"
              >
                全部<br />{{ vehicleCount }}
              </div></el-col
            >
            <el-col :span="6"
              ><div
                class="grid-content bg-purple"
                :style="{
                  backgroundColor: onlineBgColor,
                  color: onlineTextColor,
                }"
                @click="handleOnline"
              >
                在线<br />{{ vehicleOnline }}
              </div></el-col
            >
            <el-col :span="6"
              ><div
                class="grid-content bg-purple"
                :style="{
                  backgroundColor: offlineBgColor,
                  color: offlineTextColor,
                }"
                @click="handleOffline"
              >
                离线<br />{{ vehicleOffline }}
              </div></el-col
            >
            <el-col :span="6"
              ><div
                class="grid-content bg-purple"
                :style="{
                  backgroundColor: alarmBgColor,
                  color: alarmTextColor,
                }"
                @click="handleAlarm"
              >
                报警<br />{{ vehicleAlarm }}
              </div></el-col
            >
          </el-row>

          <el-input placeholder="输入关键字进行过滤" v-model="filterText">
          </el-input>
          <!-- 多选show-checkbox启用多选模式 node-key标识每个节点的唯一键 -->
          <!-- handleCheckChange 方法来处理多选框变化事件 -->
          <el-tree
            class="filter-tree"
            :data="treeData"
            :props="defaultProps"
            :default-expand-all="false"
            :filter-node-method="filterNode"
            show-checkbox
            node-key="label"
            @check-change="handleCheckChange"
            ref="tree"
            style="max-height: 250px; overflow: auto"
          >
            <!-- 自定义节点内容 -->
            <template #default="{ node, data }">
              <span class="svg-container">
                <svg-icon :icon-class="data.icon" />
                {{ node.label }}
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="16">
        <!-- 引入地图 -->
        <div class="map-container-wrapper">
          <map-container ref="mapContainer"></map-container>
        </div>
      </el-col>
    </el-row>
    <!-- 底部 -->
    <el-row>
      <el-col :span="24">
        <el-card class="card-bottom">
          <el-table
            ref="multipleTable"
            :data="vehicleDateList"
            border="true"
            tooltip-effect="dark"
            style="width: 100%"
            :row-key="getRowKeys"
          >
            <!-- 表头数据 vehicleDateList是数据 columns是列名数组-->
            <el-table-column type="index" label="序号" width="50" fixed="left">
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getAllCompaniesWithSubsidiaries } from "@/api/company.js";
import { getvehicleDateList } from "@/api/real-time.js";
import MapContainer from "@/components/Map/MapContainer";
import { getVehicleData, getToken } from "@/apis/real-time.js";
import { updateVehicleData, getVehicle } from "@/api/vehicle.js";
export default {
  components: {
    MapContainer,
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  data() {
    return {
      // 平台实时数据的更新，需求token，licenseNumbers，vehicleData
      token: "",
      // 后端的车辆信息列表
      licenseNumbers: {},
      // 平台接入的实时数据去访问后端进行车辆表的修改，实现实时信息
      vehicleData: {},

      //背景颜色，文字颜色
      allBgColor: "#ecf2f6",
      allTextColor: "black",
      onlineBgColor: "#ecf2f6",
      onlineTextColor: "#66b73e",
      offlineBgColor: "#ecf2f6",
      offlineTextColor: "#6f7787",
      alarmBgColor: "#ecf2f6",
      alarmTextColor: "black",
      //过滤
      filterText: "",
      // 表格列表
      vehicleDateList: [],
      // 树形选择的数据
      treeData: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 查询总公司子公司车辆方法的请求条件
      companySearchModel: {},
      // 筛选条件集合
      searchModel: {
        //页码
        pageNo: 1,
        //每页条数
        pageSize: 10,
      },
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
          label: "服务器时间",
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
          label: "报警处理状态",
          prop: "processStatus",
          width: "120",
        },
        {
          label: "位置",
          prop: "location",
          width: "160",
        },
      ],
      //多选选中的数据
      multipleSelection: [],
      //全部车辆数
      vehicleCount: "",
      //在线车辆数
      vehicleOnline: "",
      //离线车辆数
      vehicleOffline: "",
      //报警车辆数
      vehicleAlarm: "",
      //存储选中的车辆信息
      selectedVehicles: {},
      //  <!-- 默认选中的节点 -->
      defaultCheckedKeys: [],
    };
  },
  mounted() {
    this.get();
    // 在页面加载完成后执行刷新操作
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
      this.companySearchModel.userId = this.userId;
      this.getVehicleNum();
    },
    // 先获取车辆信息中的车牌号，去请求平台获取实时车辆的在线状态，项目再带着车辆状态和车牌号码去后端更改数据库表
    async VehicleData() {
      let res = await getVehicle();
      // 获取车牌号列表
      this.licenseNumbers = res.data.map((vehicle) => vehicle.licenseNumber);
      // 向参考平台请求车辆的实时数据
      let data = await getVehicleData(this.token, this.licenseNumbers);
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

    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 获取公司及其车俩的三级选择数据，且统计数量
    async getVehicleNum() {
      try {
        let res = await getAllCompaniesWithSubsidiaries(
          this.companySearchModel
        ); // 假设这里调用后端接口获取数据
        if (res.code === 20000) {
          const formattedData = res.data.map((company) => ({
            label: company.companyName,
            checked: false,
            level: 1,
            icon: "company",
            children: company.subsidiaries.map((subsidiary) => ({
              label: subsidiary.subsidiaryName,
              checked: false,
              level: 2,
              icon: "subsidiary",
              children: subsidiary.vehicles.map((vehicle) => ({
                label: vehicle.licenseNumber,
                checked: false,
                level: 3,
                vehicleId: vehicle.vehicleId,
                onlineStatus: vehicle.onlineStatus,
                icon:
                  vehicle.onlineStatus === 1
                    ? "vehicle-online"
                    : "vehicle-offline", // 添加图标属性
                latitude: vehicle.latitude, // 添加经度信息
                longitude: vehicle.longitude, // 添加纬度信息
              })),
            })),
          }));
          this.treeData = formattedData;

          // 统计车辆数
          this.vehicleCount = this.countTotalVehicles(formattedData);
          this.vehicleOnline = this.countOnlineVehicles(formattedData);
          this.vehicleOffline = this.countOfflineVehicles(formattedData);
          this.vehicleAlarm = res.data[0].alarmNum;
        }
      } catch (error) {
        console.error(error);
      }
      console.log("this.treeData先查询", this.treeData);
    },
    // 获取公司及其车俩的三级选择数据，用于不更新统计
    async getVehicle() {
      try {
        let res = await getAllCompaniesWithSubsidiaries(
          this.companySearchModel
        ); // 假设这里调用后端接口获取数据
        if (res.code === 20000) {
          const formattedData = res.data.map((company) => ({
            label: company.companyName,
            checked: false,
            level: 1,
            icon: "company",
            children: company.subsidiaries.map((subsidiary) => ({
              label: subsidiary.subsidiaryName,
              checked: false,
              level: 2,
              icon: "subsidiary",
              children: subsidiary.vehicles.map((vehicle) => ({
                label: vehicle.licenseNumber,
                checked: false,
                level: 3,
                vehicleId: vehicle.vehicleId,
                onlineStatus: vehicle.onlineStatus,
                icon:
                  vehicle.onlineStatus === 1
                    ? "vehicle-online"
                    : "vehicle-offline", // 添加图标属性
                latitude: vehicle.latitude, // 添加经度信息
                longitude: vehicle.longitude, // 添加纬度信息
              })),
            })),
          }));
          this.treeData = formattedData;
        }
      } catch (error) {
        console.error(error);
      }
      console.log("this.treeData先查询", this.treeData);
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
    countTotalVehicles(data) {
      return data.reduce(
        (acc, company) =>
          acc +
          company.children.reduce(
            (a, subsidiary) => a + subsidiary.children.length,
            0
          ),
        0
      );
    },
    countOnlineVehicles(data) {
      return data.reduce(
        (acc, company) =>
          acc +
          company.children.reduce(
            (a, subsidiary) =>
              a +
              subsidiary.children.filter(
                (vehicle) => vehicle.icon === "vehicle-online"
              ).length,
            0
          ),
        0
      );
    },
    countOfflineVehicles(data) {
      return data.reduce(
        (acc, company) =>
          acc +
          company.children.reduce(
            (a, subsidiary) =>
              a +
              subsidiary.children.filter(
                (vehicle) => vehicle.icon === "vehicle-offline"
              ).length,
            0
          ),
        0
      );
    },
    // 栅格点击事件调用这个函数去改变样式
    handleGridClick(index) {
      this.resetGridStyles();

      switch (index) {
        case 1:
          this.allBgColor = "#409eff";
          this.allTextColor = "white";
          break;
        case 2:
          this.onlineBgColor = "#409eff";
          this.onlineTextColor = "white";
          break;
        case 3:
          this.offlineBgColor = "#409eff";
          this.offlineTextColor = "white";
          break;
        case 4:
          this.alarmBgColor = "#409eff";
          this.alarmTextColor = "white";
          break;
        default:
          break;
      }
    },
    // 重置栅格样式
    resetGridStyles() {
      this.allBgColor = "#ecf2f6";
      this.allTextColor = "black";
      this.onlineBgColor = "#ecf2f6";
      this.onlineTextColor = "#66b73e";
      this.offlineBgColor = "#ecf2f6";
      this.offlineTextColor = "#6f7787";
      this.alarmBgColor = "#ecf2f6";
      this.alarmTextColor = "black";
    },
    // 筛选全部车辆
    handleAll() {
      // 显示全部选择
      this.handleGridClick(1);
      this.companySearchModel = {
        userId : this.userId
      };
      this.getVehicle(true);
    },
    // 筛选在线车辆
    handleOnline() {
      // 只显示在线车辆
      this.handleGridClick(2);
      this.companySearchModel.onlineStatus = 1;
      this.getVehicle(true);
      this.companySearchModel = {
        userId : this.userId
      };
      console.info("在线", this.treeData);
    },
    // 筛选离线车辆
    handleOffline() {
      this.handleGridClick(3);
      console.info("离线");
      // 只显示离线车辆
      this.companySearchModel.onlineStatus = 0;
      this.getVehicle(true);
      this.companySearchModel = {
        userId : this.userId
      };
      console.info("离线", this.treeData);
    },
    // 筛选报警车辆
    handleAlarm() {
      this.handleGridClick(4);
      this.companySearchModel.processStatus = 0;
      console.info("报警", this.treeData);
      this.getVehicle(true);
      this.searchModel = {
        userId: this.userId
      };
      console.info("报警", this.treeData);
    },
    // 树形控件选择请求
    handleCheckChange(data, checked, indeterminate) {
      console.log("1,data,checked,indeterminate", data, checked, indeterminate);
      console.log("data.level", data.level);
      if (data.level === 1) {
        // 第一级节点，即总公司
        data.children.forEach((subsidiary) => {
          subsidiary.children.forEach((vehicle) => {
            if (checked) {
              this.$set(this.selectedVehicles, vehicle.vehicleId, vehicle);
            } else {
              this.$delete(this.selectedVehicles, vehicle.vehicleId);
            }
          });
        });
      } else if (data.level === 2) {
        // 第二级节点，即子公司
        data.children.forEach((vehicle) => {
          if (checked) {
            this.$set(this.selectedVehicles, vehicle.vehicleId, vehicle);
          } else {
            this.$delete(this.selectedVehicles, vehicle.vehicleId);
          }
        });
      } else if (data.level === 3) {
        // 第三级节点，即车辆信息
        if (checked) {
          this.$set(this.selectedVehicles, data.vehicleId, data);
        } else {
          this.$delete(this.selectedVehicles, data.vehicleId);
        }
      }
      console.log("this.selectedVehicles", this.selectedVehicles);
      // 调用地图组件的showSelectedVehicles方法展示选中车辆的位置
      this.$refs.mapContainer.showSelectedVehicles(
        Object.values(this.selectedVehicles)
      );
      // 调用getvehicleDateList方法重新获取车辆信息列表
      this.getvehicleDateList();
    },
    //获取列表数据
    async getvehicleDateList() {
      this.searchModel.licenseNumbers = Object.values(
        this.selectedVehicles
      ).map((vehicle) => vehicle.label);
      if (this.searchModel.licenseNumbers.length > 0) {
        let res = await getvehicleDateList(this.searchModel);
        //20000代表成功，rows是后端返回的总条数
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
            if (item.processStatus === 1) {
              item.processStatus = "已处理";
            } else if (item.processStatus === 0) {
              item.processStatus = "未处理";
            }
            console.info("this.vehicleDateList", this.vehicleDateList);
            return item;
          });
          this.total = res.data.total;
        }
      } else {
        // 如果没有选中的车辆，则清空车辆信息列表
        this.vehicleDateList = [];
      }
    },

    //每页数据
    handleSizeChange(pageSize) {
      //每页的数据数
      this.searchModel.pageSize = pageSize;
      this.getvehicleDateList();
    },
    //当前页
    handleCurrentChange(pageNo) {
      //当前页
      this.searchModel.pageNo = pageNo;
      this.getvehicleDateList();
    },
    //多选，记录选中的行id，跨页选中的行
    getRowKeys(row) {
      return row.vehicleId;
    },
  },
};
</script>

<style>
.wrapper {
  /* display: flex; */
  flex-wrap: wrap;
  justify-content: space-between;
}
.dingbu {
  height: 400px;
}
.card-left {
  height: 400px;
  margin-right: 10px;
}
.card-bottom {
  flex-basis: 100%;
  margin-top: 10px;
}

.shange {
  margin-bottom: 10px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}
.grid-content {
  border-radius: 4px;
  min-height: 60px;
  display: flex; /* 使用 flex 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
.map-container-wrapper {
  height: 400px; /* 设置地图容器的高度 */
  width: 100%; /* 设置地图容器的宽度，这里假设为100%，可以根据实际情况调整 */
}

.pagination-right {
  display: inline-block;
}
</style>
