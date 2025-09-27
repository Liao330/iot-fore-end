<template>
  <!-- 今日车辆车辆数排行榜 -->
  <div class="echart" id="mychart" :style="myChartStyle"></div>
</template>

<script>
import * as echarts from "echarts";
import { getCompanyRank } from "@/api/company.js";

export default {
  data() {
    return {
      userId: "",

      ranksData: [],
      xData: [], // 横坐标
      yVehicleData: [], // 车辆数数据
      yAlarmData: [], // 报警次数数据
      myChartStyle: {
        float: "left",
        width: "95%",
        height: "400px",
      }, // 图表样式
    };
  },
  mounted() {
    this.get();
  },
  methods: {
    // 获取用户id
    get() {
      this.userId = localStorage.getItem("userId");
      this.getCompanyRank();
    },
    async getCompanyRank() {
      let companyName = [];
      let vehicleNumber = [];
      let alarmNumber = [];
      const mychart = echarts.init(document.getElementById("mychart")); // 图表初始化

      let res = await getCompanyRank(this.userId);
      console.log(res.data);
      if (res.code === 20000) {
        this.ranksData = res.data;
        for (let i = 0; i < this.ranksData.length; i++) {
          this.xData[i] = this.ranksData[i].companyName;
          this.yVehicleData[i] = this.ranksData[i].vehicleNumber;
          this.yAlarmData[i] = this.ranksData[i].alarmNumber;
        }
        companyName = this.xData;
        vehicleNumber = this.yVehicleData;
        alarmNumber = this.yAlarmData;
        mychart.setOption({
          title: {
            text: "子公司车辆统计top4",
          },
          tooltip: {
            position: 'top',
          },
          legend: {
            data: ["车辆数", "报警次数"],
            right: "5%", // 调整图例位置靠右
          },
          xAxis: {
            name: "公司",
            data: companyName,
            axisLabel: {
              formatter: function (value) {
                // 在适当的位置插入换行符，例如每5个字符换行
                var formattedValue = "";
                for (var i = 0; i < value.length; i++) {
                  formattedValue += value[i];
                  if ((i + 1) % 5 === 0 && i !== value.length - 1) {
                    formattedValue += "\n";
                  }
                }
                return formattedValue;
              },
              fontSize: 12, // 调整字体大小
            },
          },
          yAxis: [
            {
              name: "车辆数",
              type: "value",
              interval: 10, // 设置刻度间隔为1
              min: 0, // 设置 y 轴的最小值
              max: 200, // 设置 y 轴的最大值
            },
            {
              name: "报警次数",
              type: "value", // 新增y轴类型为value
              interval: 5, // 设置刻度间隔为1
              min: 0, // 设置 y 轴的最小值
              max: 50, // 设置 y 轴的最大值
            },
          ],
          series: [
            {
              name: "车辆数",
              type: "bar", // 类型为柱状图
              data: vehicleNumber,
              yAxisIndex: 0, // 与第一个y轴对应
              barWidth: "20%", // 柱条宽度，每个柱条的宽度就是类目宽度的 20%
              // 柱子的样式
              itemStyle: {
                color: "#5574c2",
              },
            },
            {
              name: "报警次数", // 新增报警次数的柱状图
              type: "bar", // 类型为柱状图
              data: alarmNumber, // 使用报警次数数据
              yAxisIndex: 1, // 与第二个y轴对应
              barWidth: "20%", // 柱条宽度，每个柱条的宽度就是类目宽度的 20%
              // 柱子的样式
              itemStyle: {
                color: "#ff7f50",
              },
            },
          ],
        });
      } else {
        this.$message.error(res.msg);
      }
      // 随着屏幕大小调节图表
      window.addEventListener("resize", () => {
        mychart.resize();
      });
    },
  },
};
</script>

<style>
</style>