<template>
  <div id="container"></div>
</template>
   
<script>
import AMapLoader from "@amap/amap-jsapi-loader";
window._AMapSecurityConfig = {
  securityJsCode: "88a90296d3dd335debd65c09d93f98d6",
};
export default {
  data() {
    return {
      map: null,
      markers: [], // 存储标记
    };
  },
  methods: {
    initMap() {
      AMapLoader.load({
        key: "f32f10bac2a41ec8eb25b32866c13a04", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.DistrictSearch"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等，AMap.DistrictSearch加载高德地图的行政区域插件。
      })
        .then((AMap) => {
          const bounds = new AMap.Bounds([73.33, 18.15], [134.77, 53.56]); // 设置中国的经纬度范围
          this.map = new AMap.Map("container", {
            // 设置地图容器id
            viewMode: "3D", // 是否为3D地图模式
            zoom: 4, // 初始化地图级别,1表示全球范围（最大），20表示最详细的街道级别（最小）。
            // center: [121.473667, 31.230525] // 初始化地图中心点位置
            center: [116.397428, 39.90923], // 设置地图中心点为中国的中心位置
            limitBounds: bounds, // 设置地图显示范围为中国范围
          });
          this.map.addControl(new AMap.Scale()); // 定位相关代码
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // 根据经纬度在地图上显示标记
    showSelectedVehicles(vehicles) {
      // 清除之前的标记
      this.clearMarkers();

      vehicles.forEach((vehicle) => {
        if (vehicle.latitude && vehicle.longitude) {
          let iconPath = "";
          if (vehicle.onlineStatus === 0) {
            iconPath = require("@/assets/vehicle-offline.png");
          } else if (vehicle.onlineStatus === 1) {
            iconPath = require("@/assets/vehicle-online.png");
          }
          const iconSize = new AMap.Size(32, 32); // 图标尺寸
          const icon = new AMap.Icon({
            size: iconSize,
            image: iconPath,
            imageSize: iconSize,
          });
          const marker = new AMap.Marker({
            position: [vehicle.longitude, vehicle.latitude],
            icon: icon,
            // offset: new AMap.Pixel(-13, -30),
            offset: new AMap.Pixel(
              -iconSize.getWidth() / 2,
              -iconSize.getHeight()
            ), // 调整图标位置
          });

          // 添加事件监听器
          marker.on("mouseover", () => {
            const infoWindow = new AMap.InfoWindow({
              content: vehicle.label, // 悬浮内容
              offset: new AMap.Pixel(0, -20), // 悬浮框偏移量
            });
            infoWindow.open(this.map, marker.getPosition());
          });

          marker.setMap(this.map);
          this.markers.push(marker);
        }
      });

      // 放大地图以查看所有标记
      this.map.setFitView();
    },
    // 清除所有标记
    clearMarkers() {
      this.markers.forEach((marker) => {
        marker.setMap(null);
      });
      this.markers = [];
    },
  },
  mounted() {
    // DOM初始化完成进行地图初始化
    this.initMap();
  },
};
</script>
   
<style lang="less">
#container {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 100%;
}
</style>
  
