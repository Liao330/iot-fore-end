<!-- 实时状态下拉框的历史视频 -->
<template>
  <div class="wrapper">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="历史视频" name="first">
          <el-row class="search">
            <el-col :span="8">
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
                  size="mini"
                  placeholder="请选择公司"
                  @change="handleSubsidiaryChange"
                  class="full-width"
                ></el-cascader>
              </div>
            </el-col>
            <!-- 车牌号码 -->
            <el-col :span="8">
              <div class="licenseNumber">
                <span class="demonstration" style="white-space: nowrap"
                  >车牌号码</span
                >
                <el-select
                  v-model="licenseNumber"
                  placeholder="请选择车牌号码"
                  clearable
                  size="mini"
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
            <!-- 查询 -->
            <el-col :span="8">
              <div class="button-wrapper">
                <el-button
                  type="primary"
                  round
                  @click="query"
                  size="mini"
                  icon="el-icon-search"
                  >查询</el-button
                >
              </div>
            </el-col>
          </el-row>
          <div class="historyVideo">
            <iframe :src="videoUrl" frameborder="0"></iframe>
          </div>
        </el-tab-pane>
        <el-tab-pane label="图片中心" name="second">
          <div class="image-gallery">
            <div
              v-for="(imageUrl, index) in imageUrls"
              :key="index"
              class="image-wrapper"
            >
              <img :src="imageUrl" alt="image" class="image-item" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
  
<script>
import {
  getLicenseNumbersBySubsidiary,
  getVehicleColor,
  getVehicleImages,
} from "@/api/vehicle.js";
import { getAllCompaniesWithSubsidiaries } from "@/api/company.js";
import { getToken } from "@/apis/real-time.js";
export default {
  data() {
    return {
      userId: "",
      roleId: "",
      activeName: "first",
      token: "",
      videoUrl: "",
      vehiclename: "",
      vehicleColor: "",
      vehicleColor2: "",

      imageUrls: [], // 存储从后端获取的图片链接数组

      // 所有总公司及子公司，选择框数据
      subsidiaries: [],
      // 查询选中绑定的子公司，查询请求参数
      subsidiaryIds: "",
      // 绑定数据车牌号码licenseNumber，查询请求参数
      licenseNumber: "",
      // 存储车牌号码选择框数据
      licenseNumbers: [],
    };
  },
  mounted() {
    this.getToken();
    this.get();
  },
  methods: {
    // 获取平台的token
    async getToken() {
      let res = await getToken();
      if (res.code === 200) {
        this.token = res.data.token;
      }
      this.videoUrl = `http://220.203.0.15:8083/alone_hisvideo?token=${this.token}`;
    },
    // 获取登录用户id
    get() {
      this.userId = localStorage.getItem("userId");
      this.roleId = localStorage.getItem("roleId");
      this.getAllCompaniesWithSubsidiaries();
      this.getVehicleImages();
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    // async query2() {
    //   let response = await getVehicleImages(); // 调用后端接口获取图片链接
    //   console.info("有有有有有有",response);
    // },
    // 获取历史图片
    async getVehicleImages() {
      try {
        let response = await getVehicleImages(this.userId); // 调用后端接口获取图片链接
        this.imageUrls = response.data; // 将获取到的图片链接数组赋值给 imageUrls
        console.info("有有有有有有", this.imageUrls);
      } catch (error) {
        console.error("获取图片链接失败：", error);
        this.$message.error("获取图片链接失败");
      }
    },

    // 获取所有公司及其子公司信息
    async getAllCompaniesWithSubsidiaries() {
      const searchModel = {};
      searchModel.userId = this.userId;
      let res = await getAllCompaniesWithSubsidiaries(searchModel);
      console.info("有有有有有有有",res)
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
    // 查询
    async query() {
      if (this.licenseNumber.length === 0) {
        this.$message({
          type: "warning",
          message: "请选择车辆",
          duration: 2000,
        });
        return;
      }
      this.vehiclename = this.licenseNumber;
      // 根据车牌号，查询颜色
      let res = await getVehicleColor(this.vehiclename);
      if (res.msg === "蓝色") {
        this.vehicleColor = "1";
      } else if (res.msg === "黄色") {
        this.vehicleColor = "2";
      } else if (res.msg === "黑色") {
        this.vehicleColor = "3";
      } else if (res.msg === "白色") {
        this.vehicleColor = "4";
      } else if (res.msg === "绿色") {
        this.vehicleColor = "5";
      } else if (res.msg === "黄绿色") {
        this.vehicleColor = "6";
      } else if (res.msg === "蓝底白字") {
        this.vehicleColor2 = "1";
      } else if (res.msg === "绿底白字") {
        this.vehicleColor2 = "2";
      } else if (res.msg === "绿色渐变") {
        this.vehicleColor2 = "3";
      } else if (res.msg === "绿底黑字") {
        this.vehicleColor2 = "4";
      } else if (res.msg === "黄绿双拼") {
        this.vehicleColor2 = "5";
      } else if (res.msg === "黄底黑字") {
        this.vehicleColor2 = "6";
      } else if (res.msg === "黑底白字") {
        this.vehicleColor2 = "7";
      } else if (res.msg === "白底黑字") {
        this.vehicleColor2 = "8";
      } else if (res.msg === "农黄") {
        this.vehicleColor2 = "9";
      } else if (res.msg === "农绿") {
        this.vehicleColor2 = "10";
      }
      let apiUrl = `http://220.203.0.15:8083/alone_hisvideo?token=${this.token}&vehiclename=${this.vehiclename}`;
      console.info("车车车11111", this.vehicleColor);
      console.info("车车车22222", this.vehicleColor2);
      if (this.vehicleColor !== null) {
        apiUrl += `&vehicleColor=${this.vehicleColor}`;
      }
      if (this.vehicleColor2 !== null) {
        apiUrl += `&vehicleColor2=${this.vehicleColor2}`;
      }

      console.info("车车车", apiUrl);
      this.videoUrl = apiUrl; // 更新对应的视频链接
      this.vehicleColor = "";
      this.vehicleColor2 = "";
    },
  },
};
</script>
  
<style>
.wrapper {
  /* display: flex; */
  flex-wrap: wrap;
  justify-content: space-between;
  height: 100vh;
}
.el-card {
  height: 100%; /* 让 el-card 元素填充其父元素的高度 */
}
.historyVideo {
  width: 100%;
  height: 550px;
}

.historyVideo iframe {
  width: 100%;
  height: 500px;
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
  margin-left: 15px;
  margin-right: 20px;
  font-size: 12px;
}
.subsidiary,
.licenseNumber {
  display: flex;
  align-items: center;
  flex-flow: 1;
  margin-right: 30px;
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

.search {
  height: 40px;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  height: 490px;
}

.image-wrapper {
  flex: 0 0 32%; /* 每个图片 wrapper 占据 25% 的宽度，即一行放四张图片 */
  margin: 5px;
  border: 1px solid #ebebeb; /* 添加边框样式 */
  border-radius: 5px; /* 可选，添加边框圆角 */
  overflow: hidden; /* 可选，超出部分隐藏 */
}

.image-item {
  width: 100%; /* 图片占据整个 wrapper 的宽度 */
  height: auto; /* 高度自适应 */
  object-fit: cover; /* 图片填充方式，可根据需要调整 */
}

/* 隐藏滚动条，但保留滑动功能 */
::-webkit-scrollbar {
  width: 0; /* 隐藏滚动条的宽度 */
}
</style>
  
  