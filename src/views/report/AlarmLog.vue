<!-- 统计报表下拉框的检测日志 -->
<template>
  <div class="log-page">
    <el-card class="left-card">
      <el-input placeholder="输入关键字进行过滤" v-model="filterText">
      </el-input>
      <el-tree
        class="filter-tree"
        :data="treeData"
        :props="defaultProps"
        :default-expand-all="false"
        :filter-node-method="filterNode"
        ref="tree"
        @node-click="handleNodeClick"
      ></el-tree>
    </el-card>
    <!-- 查询结果列表 -->
    <el-card>
      <el-table
        ref="multipleTable"
        :data="alarmDateList"
        border="true"
        tooltip-effect="dark"
        style="width: 100%"
      >
        <!-- 表头数据 alarmDateList是数据 columns是列名数组-->
        <el-table-column
          label="报警内容"
          prop="alarmContent"
          width="100"
          show-overflow-tooltip="true"
          fixed="left"
        >
        </el-table-column>
        <el-table-column
          label="检测类型"
          prop="alarmType"
          width="100"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column label="图片预览" width="120">
          <template slot-scope="scope">
            <img
              :src="scope.row.imageUrl"
              style="max-width: 100px; max-height: 80px; cursor: pointer"
              @click="handleImageClick(scope.row.imageUrl)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="图片上传时间"
          prop="uploadTime"
          width="160"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          label="车牌号码"
          prop="licenseNumber"
          width="120"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          label="所属公司"
          prop="subsidiaryName"
          width="160"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          label="检测来源"
          prop="alarmSource"
          width="100"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          label="检测时间"
          prop="alarmTime"
          width="160"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          label="检测位置"
          prop="alarmLocation"
          width="160"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          label="处理状态"
          prop="processStatus"
          width="120"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <template slot="empty">
          <div style="text-align: center">
            <span>暂无数据，请点击报警内容</span>
          </div>
        </template>
      </el-table>
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
    </el-card>
  </div>
</template>

<script>
import { getAlarmContent, getIncidentImag } from "@/api/alarm.js";
export default {
  data() {
    return {
      // 报警内容的数据
      treeData: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      incidentPhoto: "", // 一个变量用于保存图片链接
      filterText: "",

      // 表格列表
      alarmDateList: [],

      //列表数据总数
      total: 0,
      // 查询条件集合
      searchModel: {
        //页码
        pageNo: 1,
        //每页条数
        pageSize: 10,
      },
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  mounted() {
    this.get();
  },
  methods: {
    // 获取登录用户id
    get() {
      this.userId = localStorage.getItem("userId");
      this.roleId = localStorage.getItem("roleId");
      this.searchModel.userId = this.userId;
      this.getAlarmContent();
    },
    // 获取报警内容二级选择数据
    async getAlarmContent() {
      try {
        let res = await getAlarmContent();
        // 将接口返回的数据转换为 el-tree 所需的格式
        if (res.code === 20000) {
          const map = {};
          res.data.forEach((item) => {
            if (!map[item.alarmType]) {
              map[item.alarmType] = [];
            }
            map[item.alarmType].push({
              label: item.alarmContent,
              incidentId: item.incidentId,
            });
          });
          const formattedData = Object.keys(map).map((key) => ({
            label: key,
            children: map[key],
          }));
          this.treeData = formattedData;
        }
      } catch (error) {
        console.error(error);
      }
      console.log(this.treeData);
    },
    // 转换创建时间格式，显示在列表里
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
    // 节点请求
    async handleNodeClick(data) {
      console.log("请求数据", data);
      if (data.children && data.children.length > 0) {
        // 如果有子节点，则不发起请求
        return;
      }
      this.searchModel.incidentId = data.incidentId;
      this.searchModel.Content = data.label;
      this.searchModel.pageNo = 1;
      try {
        let res = await getIncidentImag(this.searchModel);
        if (res.code === 20000) {
          this.alarmDateList = res.data.records.map((item) => {
            // 转换时间格式
            item.alarmTime = item.alarmTime
              ? this.getTime(item.alarmTime)
              : null;
            item.uploadTime = item.uploadTime
              ? this.getTime(item.uploadTime)
              : null;

            // 处理 processStatus 数据
            if (item.processStatus === 1) {
              item.processStatus = "已处理";
            } else if (item.processStatus === 0) {
              item.processStatus = "未处理";
            }

            return item;
          });
          this.total = res.data.total;
        }
      } catch (error) {
        console.error(error);
      }
    },
    // 节点过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },

    // 在这里处理图片放大显示的逻辑，可以使用弹窗组件等
    // 例如，使用 element-ui 的 Dialog 组件来展示放大的图片
    handleImageClick(imageUrl) {
      this.$alert(
        `<img src="${imageUrl}" style="max-width: 100%; max-height: 100%;">`,
        "报警内容对应图",
        {
          dangerouslyUseHTMLString: true,
        }
      );
    },
  },

  //每页数据
  handleSizeChange(pageSize) {
    //每页的数据数
    this.searchModel.pageSize = pageSize;
    this.getIncidentImag();
  },
  //当前页
  handleCurrentChange(pageNo) {
    //当前页
    this.searchModel.pageNo = pageNo;
    this.getIncidentImag();
  },
};
</script>

<style scoped>
.log-page {
  display: flex;
  height: 100vh;
}

.left-card {
  margin-right: 10px;
}

.el-tree-node__content {
  height: 28px;
}

.pagination-container {
  text-align: center;
}
.pagination-right {
  display: inline-block;
}
</style>