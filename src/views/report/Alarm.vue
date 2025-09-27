<!-- 统计报表下拉框的普通检测报表 -->
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
        <!-- 处理状态 -->
        <el-col :span="6">
          <div class="state">
            <span class="demonstration" style="white-space: nowrap"
              >处理状态</span
            >
            <el-select
              v-model="processStatus"
              clearable
              placeholder="请选择"
              class="full-width"
            >
              <el-option
                v-for="item in processType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
        <!-- 检测类型 -->
        <el-col :span="6">
          <!-- 检测类型，大类和小类的级联选择器 -->
          <div class="subsidiary">
            <span class="demonstration" style="white-space: nowrap"
              >检测类型</span
            >
            <el-cascader
              v-model="alarmContent"
              :options="alarm"
              :props="{
                multiple: true,
                value: 'value',
                label: 'label',
                children: 'children',
              }"
              collapse-tags
              clearable
              placeholder="请选择检测类型"
              @change="handleAlarmChange"
              class="full-width"
            ></el-cascader>
          </div>
        </el-col>
      </el-row>
      <!-- 第二行，检测发生时间,设备编码 -->
      <el-row>
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
        <!-- 检测时间 -->
        <el-col :span="12">
          <div class="time">
            <span class="demonstration">检测时间</span>
            <el-date-picker
              v-model="alarmTime"
              type="daterange"
              unlink-panels="true"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </div>
        </el-col>
        <!-- 操作按钮 -->
        <el-col :span="6">
          <div class="button-wrapper">
            <el-button
              type="primary"
              round
              @click="query"
              size="small"
              icon="el-icon-search"
              >查询</el-button
            >
            <el-button type="primary" plain @click="openEditUI()" size="small"
              >批量处理</el-button
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
        :data="alarmList"
        border="true"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="getRowKeys"
      >
        <!-- 表头数据 alarmList是数据 columns是列名数组-->
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
        <el-table-column
          label="处理状态"
          prop="processStatus"
          width="100"
          show-overflow-tooltip="true"
          fixed="right"
        >
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template slot-scope="scope">
            <div class="button-container">
              <!-- 处理 -->
              <el-button type="text" @click="openEditUI(scope.row)"
                >处理</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 点击批量处理按钮弹出的对话框，dialogVisible变量控制对话框是否显示 -->
      <!-- 批量处理和处理，使用同一个对话框 -->
      <el-dialog :title="'检测处理'" :visible.sync="dialogVisible" width="30%">
        <div class="form-box">
          <div>
            解除报警：
            <el-switch v-model="process" disabled></el-switch>
          </div>
          <div class="btns clear-fix">
            <div>
              <el-button type="primary" @click="submitProcess">确定</el-button>
              <el-button @click="dialogVisible = false">取消</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
      <el-dialog
        :title="'批量检测处理'"
        :visible.sync="processDialogVisible"
        width="30%"
      >
        <div class="form-box">
          <div>
            批量解除报警：
            <el-switch v-model="process" disabled></el-switch>
          </div>
          <div class="btns">
            <div>
              <el-button type="primary" @click="submitMoreProcess"
                >确定</el-button
              >
              <el-button @click="processDialogVisible = false">取消</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
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
import { getLicenseNumbersBySubsidiary } from "@/api/vehicle.js";
import { getAllCompaniesWithSubsidiaries } from "@/api/company.js";
import {
  getAlarmContent,
  getAlarmList,
  updateProcessStatus,
  submitMoreProcess,
  exportAlarm,
} from "@/api/alarm";
import FileSaver from "file-saver";
export default {
  data() {
    return {
      props: { multiple: true },
      // 所有总公司及子公司，选择框数据
      subsidiaries: [],
      // 查询选中绑定的子公司，查询请求参数
      subsidiaryIds: "",
      // 处理选中的公司id,获取子公司id
      selectedSubsidiaryIds: [],
      //绑定数据车牌号码licenseNumber，查询请求参数
      licenseNumber: "",
      // 存储车牌号码选择框数据
      licenseNumbers: [],
      //车辆的颜色
      // vehicleColor: '',
      //设备编码deviceCode，查询请求参数
      deviceCode: "",
      //处理状态绑定的数据，查询请求参数
      processStatus: "",
      //处理状态选择框的数据
      processType: [
        {
          value: "",
          label: "全部",
        },
        {
          value: "1",
          label: "已处理",
        },
        {
          value: "0",
          label: "未处理",
        },
      ],
      value: "",
      //设备类型deviceType type
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
      //检测类型绑定的数据
      alarmContent: "",
      // 处理选中的报警内容，赋值给请求参数
      selectedAlarmContent: [],
      //检测类型选择框的数据
      alarm: [],
      //检测发生时间
      alarmTime: "",
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      value1: "",
      value2: "",
      // 表格列表
      alarmList: [],
      // 表头数据
      columns: [
        {
          label: "车辆颜色",
          prop: "vehicleColor",
          width: "100",
        },
        {
          label: "所属公司",
          prop: "subsidiaryName",
          width: "160",
        },
        {
          label: "驾驶员姓名",
          prop: "username",
          width: "100",
        },
        {
          label: "联系电话",
          prop: "phoneNumber",
          width: "120",
        },
        {
          label: "报警内容",
          prop: "alarmContent",
          width: "120",
        },
        {
          label: "检测来源",
          prop: "alarmSource",
          width: "100",
        },
        {
          label: "设备编码",
          prop: "deviceCode",
          width: "120",
        },
        {
          label: "设备类型",
          prop: "deviceType",
          width: "100",
        },
        {
          label: "检测发生时间",
          prop: "newalarmTime",
          width: "160",
        },
        {
          label: "车辆状态",
          prop: "onlineStatus",
          width: "100",
        },
        {
          label: "检测位置",
          prop: "alarmLocation",
          width: "160",
        },
      ],
      //多选选中的数据
      multipleSelection: [],
      //列表数据总数
      total: 0,
      // 查询条件集合
      searchModel: {
        //页码
        pageNo: 1,
        //每页条数
        pageSize: 10,
      },
      //对话框
      dialogVisible: false, //是否显示处理对话框
      processDialogVisible: false, //是否显示批量处理对话框
      alarmItem: null, // 当前选择的检测项
      process: true,
    };
  },
  methods: {
    // 获取登录用户id
    get() {
      this.userId = localStorage.getItem("userId");
      this.roleId = localStorage.getItem("roleId");
      this.searchModel.userId = this.userId;
      this.getAlarmList();
      this.getAllCompaniesWithSubsidiaries();
      this.fetchAlarmContent();
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
    // 检测类型，查询条件，获取所有检测类型
    async fetchAlarmContent() {
      const res = await getAlarmContent();
      if (res && res.code === 20000) {
        // 将响应数据中的 alarmType 和 alarmContent 转换为级联选择器的格式
        const alarm = [];
        res.data.forEach((item) => {
          const alarmTypeIndex = alarm.findIndex(
            (a) => a.label === item.alarmType
          );
          if (alarmTypeIndex === -1) {
            alarm.push({
              value: item.alarmType,
              label: item.alarmType,
              children: [
                {
                  value: item.alarmContent,
                  label: item.alarmContent,
                },
              ],
            });
          } else {
            alarm[alarmTypeIndex].children.push({
              value: item.alarmContent,
              label: item.alarmContent,
            });
          }
        });
        this.alarm = alarm;
      }
    },
    //检测类型，查询条件选中，处理选中的请求数据
    handleAlarmChange(value) {
      console.log("Selected AlarmContent: ", value);
      // 根据选中的子公司加载对应的车牌号码选择数据
      if (value && value.length > 0) {
        this.selectedAlarmContent = value.map((alarm) => alarm[1]); // 提取报警内容
        console.log("selectedAlarmContent: ", this.selectedAlarmContent);
      } else {
        this.selectedAlarmContent = [];
      }
    },

    // 转换时间格式给后端
    ChangeCreatedAt(date) {
      const startDate = new Date(date[0]);
      const endDate = new Date(date[1]);

      // 获取起始时间的ISO格式字符串并添加本地时区偏移量
      const startISOString = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      ).toISOString();

      // 获取结束时间的ISO格式字符串并添加本地时区偏移量
      const endISOString = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000 + 86399999
      ).toISOString();

      return [startISOString, endISOString];
    },
    // 转换检测发生时间，再显示在列表里
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
      this.searchModel.subsidiaryIds = this.selectedSubsidiaryIds;
      this.searchModel.licenseNumber = this.licenseNumber;
      this.searchModel.processStatus = this.processStatus;
      this.searchModel.alarmContent = this.selectedAlarmContent;
      this.searchModel.deviceCode = this.deviceCode;
      this.searchModel.deviceType = this.deviceType;
      this.searchModel.pageNo = 1;
      if (!this.alarmTime) {
        this.searchModel.alarmTime = null;
      } else {
        this.searchModel.alarmTime = this.ChangeCreatedAt(this.alarmTime);
      }
      await this.getAlarmList();
    },
    //获取检测列表数据
    async getAlarmList() {
      let res = await getAlarmList(this.searchModel);
      //20000代表成功，rows是后端返回的总条数
      if (res.code === 20000) {
        this.alarmList = res.data.records.map((item) => {
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
          if (item.processStatus === 1) {
            item.processStatus = "已处理";
          } else if (item.processStatus === 0) {
            item.processStatus = "未处理";
          }
          if (item.alarmTime != null) {
            // 在这里保存原始格式的当作请求参数，
            // 设置一个新变量存储显示在列表上的时间格式，当作显示数据
            item.newalarmTime = item.alarmTime;
          }
          return item;
        });
        // 转换alarmList.newalarmTime格式
        this.alarmList.forEach((item) => {
          if (item.newalarmTime != null) {
            item.newalarmTime = this.getTime(item.newalarmTime);
          }
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

    //点击单行处理，打开对话框
    openEditUI(row) {
      if (row == null) {
        // 批量处理
        this.processDialogVisible = true;
      } else {
        // 单行处理
        this.alarmItem = row;
        this.dialogVisible = true;
      }
    },
    //处理对话框的提交内容方法
    async submitProcess() {
      //触发表单验证
      if (this.alarmItem && this.alarmItem.processStatus === "未处理") {
        // 请求参数，用this.alarmItem.alarmId去查询processStatus，为0就改为1
        try {
          let res = await updateProcessStatus(this.alarmItem.alarmId); // 假定这是调用API接口的方法
          if (res.code === 20000) {
            this.$message.success("状态更新成功");
            this.dialogVisible = false;
            this.getAlarmList(); // 重新获取检测列表
          } else {
            this.$message.error("状态更新失败");
          }
        } catch (error) {
          console.error("更新处理状态失败", error);
          this.$message.error("更新出错");
        }
      } else {
        this.$message("已处理过");
        this.dialogVisible = false;
      }
    },
    //批量处理对话框的提交内容方法
    async submitMoreProcess() {
      //触发表单验证
      if (this.multipleSelection.length === 0) {
        this.$message({
          type: "warning",
          message: "请选择要解除报警的车辆",
          duration: 2000,
        });
        this.processDialogVisible = false;
        return;
      }
      // 获取多选中的alarmId
      let selectedAlarmIds = this.multipleSelection.map((item) => item.alarmId);
      try {
        console.info(selectedAlarmIds);
        await submitMoreProcess(selectedAlarmIds);
        this.$message({
          type: "success",
          message: "处理成功",
          duration: 2000,
        });
        this.processDialogVisible = false;
        // 重置多选框和已选列表
        this.multipleSelection = [];
        // 重新获取列表数据
        this.getAlarmList();
      } catch (error) {
        // 处理错误情况，比如显示错误信息
        this.$message({
          type: "error",
          message: "处理失败，请重试",
          duration: 2000,
        });
      }
    },

    //多选处理，val：当前选中的行
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.multipleSelection.forEach((item) => {
        item.installTime = "";
      });
    },
    //查询导出
    async exportData() {
      const result = await exportAlarm(this.searchModel);
      if (result) {
        FileSaver.saveAs(result, "路况统计报表.xlsx"); // 下载文件
      }
    },

    //每页数据
    handleSizeChange(pageSize) {
      //每页的数据数
      this.searchModel.pageSize = pageSize;
      this.getAlarmList();
    },
    //当前页
    handleCurrentChange(pageNo) {
      //当前页
      this.searchModel.pageNo = pageNo;
      this.getAlarmList();
    },
    //多选，记录选中的行id，跨页选中的行
    getRowKeys(row) {
      return row.vehicleId;
    },
  },

  //挂载函数，直接应用的
  mounted() {
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
  /* align-items: center; */
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
  margin-top: 20px;
  text-align: center;
}

</style>
