<template>
  <div class="dashboard-container">
    <el-row gutter="10">
      <el-col :span="4" v-for="(item, index) in list" :key="index">
        <div
          class="dashboard-item"
          :style="{
            background: item.title === '今日检测数' ? (item.val > 0 ? 'red' : 'orange') : (item.title === '报警日志' ? (item.val > 0 ? 'red' : 'orange') : '#67C23A'),
            cursor: index === list.length - 1 ? 'pointer' : 'auto',
          }"
          @click="index === list.length - 1 ? goToAlarmLogPage() : null"
        >
          <p>
            <svg-icon :icon-class="item.icon" />
            {{ item.title }}
          </p>
          <p>{{ item.val }}</p>
        </div>
      </el-col>
    </el-row>
    <div class="map-rank">
      <div class="map-warp">
        <!-- <map-container :map-style="mapStyle"></map-container> -->
        <!-- <map-container></map-container> -->
        <division></division>
      </div>
      <el-card>
          <ranking></ranking>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  getSubsidiaryCount,
  getVehicleCount,
  getOnlineCount,
  getVedioCount,
  getTodayAlarm,
  getAlarm,
} from "@/api/home";
// import MapContainer from "@/components/Map/MapContainer";
import ranking from "@/components/Ranking/ranking.vue";
// import division from "@/components/Map/division"
import Division from "@/components/Map/division.vue";
export default {
  components: {
    // MapContainer,
    ranking,
    Division,
  },
  data() {
    return {
      list: [
        { val: null, title: "子公司数", color: "#fff", icon: "subsidiary" },
        { val: null, title: "总车辆", color: "#fff", icon: "vehicle" },
        {
          val: null,
          title: "在线车辆",
          color: "#fff",
          icon: "vehicle-offlineNum",
        },
        { val: null, title: "视频车辆", color: "#fff", val: 0, icon: "vedio" },
        { val: null, title: "今日检测数", color: "#fff", icon: "alarm" },
        {
          val: null,
          title: "报警日志",
          color: "#fff",
          val: 0,
          icon: "alarmLog",
        },
      ],
      // 设置地图样式
      // mapStyle: [
      //   {
      //     featureType: 'land',
      //     elementType: 'geometry',
      //     stylers: {
      //       color: '#f3f3f3', // 设置背景颜色
      //     },
      //   },
      // ],
      userId: "",
      roleId: "",
    };
  },

  mounted() {
    this.get();
  },
  methods: {
    // 获取用户id，角色id
    get(){
      this.userId = localStorage.getItem("userId");
      this.roleId = localStorage.getItem("roleId");
      this.getSubsidiaryCount();
      this.getVehicleCount();
      this.getOnlineCount();
      this.getVedioCount();
      this.getTodayAlarm();
      this.getAlarm();
    },
    // 子公司数
    async getSubsidiaryCount() {
      let res = await getSubsidiaryCount(this.userId);
      console.log(res.data);
      this.list[0].val = res.data;
    },
    // 子公司的车辆数
    async getVehicleCount() {
      let res = await getVehicleCount(this.userId);
      console.log(res.data);
      this.list[1].val = res.data;
    },
    // 车辆的在线数
    async getOnlineCount() {
      let res = await getOnlineCount(this.userId);
      console.log(res.data);
      this.list[2].val = res.data;
    },
    // 视频车辆数
    async getVedioCount() {
      let res = await getVedioCount(this.userId);
      console.log(res.data);
      this.list[3].val = res.data;
    },
    // 子公司车辆的今日检测数
    async getTodayAlarm() {
      let res = await getTodayAlarm(this.userId);
      console.log(res.data);
      this.list[4].val = res.data;
    },
    // 报警日志，统计检测数量
    async getAlarm() {
      let res = await getAlarm(this.userId);
      console.log(res.data);
      this.list[5].val = res.data;
    },
    // 报警日志跳转
    goToAlarmLogPage() {
      this.$router.push("/report/alarmlog");
    },
    // 获取用户名和角色名
  },
};
</script>

<style lang="scss" scoped>
.el-row {
  // margin-top: 10px;
  // padding-left: 10px;
  // padding-right: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
  text-align: center;
}

.dashboard-item {
  border-radius: 4px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.map-rank {
  display: flex;
  align-items: stretch;
}
.map-warp {
  height: 500px;
  width: 60%;
  margin: 10px 10px 0 0;
  border: 1px solid #eee;
}
.el-card {
  height: 500px;
  width: 40%;
  margin-top: 10px;
}
</style>
