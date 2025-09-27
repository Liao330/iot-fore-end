<template>
  <div id="test-map" />
</template>
  
<script>
import { lazyAMapApiLoaderInstance } from "vue-amap";
import { getLocation } from "@/api/vehicle";
export default {
  data() {
    return {
      userId: "",
      map: "", // 地图
      district: null, // 区
      mapData: [], // 地图点的数据
    };
  },
  methods: {
    // 初始化地图相关实例
    initMap() {
      const that = this;
      lazyAMapApiLoaderInstance.load().then(() => {
        that.map = new AMap.Map("test-map", {
          zooms: [1, 18], // 地图缩放范围
          center: new AMap.LngLat(116.397428, 39.90923),
          zoom: 6, // 设置地图的默认级别
        });
        this.getLocation();
        // 区划聚合组件
        AMapUI.load(
          ["ui/geo/DistrictCluster", "lib/utils"],
          function (DistrictCluster, utils) {
            // 定义行政区划聚合实例
            that.district = new DistrictCluster({
              map: that.map, // 所属的地图实例
              // 返回数据项中的经纬度位置
              getPosition: function (item) {
                if (!item) {
                  return null;
                }
                var parts = item.split(",");
                // 返回经纬度 [lng, lat]
                return [parseFloat(parts[0]), parseFloat(parts[1])];
              },
            });
            that.setMapData();
          }
        );
      });
    },

    setMapData() {
      // 地图点的数据
      if (this.district) {
        this.district.setData(this.mapData);
      }
    },
    // 获取地图点车辆位置经纬度
    async getLocation() {
      this.userId = localStorage.getItem("userId");

      let res = await getLocation(this.userId);
      console.log(res.data);
      if (res.code === 20000) {
        let data = res.data;
        this.mapData = data.map((item) => `${item.longitude},${item.latitude}`);
        this.setMapData();
        console.log(this.mapData);
      } else {
        // 请求失败
        this.$message.error(res.msg);
      }
    },
  },
  mounted() {
    this.initMap();
  },
};
</script>
  
  <style scoped>
#test-map {
  height: 100%;
}
</style>  