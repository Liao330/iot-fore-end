<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 14px;margin-right: 5px">请选择摄像头: </span>
        <el-select
          v-model="checkvalue"
          placeholder="请选择摄像头"
          @change="changeVideo"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div style="display: flex">
        <WebRtc :checkurl="showVideo" :videourl="videoUrl" :alarmdata="alarmData" />
        <div class="map-container-wrapper" style="flex:1">
          <map-container ref="mapContainer" :showMap="showMap"></map-container>
        </div>
      </div>
      <el-card class="card-bottom">
        <el-table
          ref="multipleTable"
          :data="alarmData"
          border="true"
          tooltip-effect="dark"
          height="400"
          style="width: 100%"
        >
          <!-- 表头数据 alarmData是数据 columns是列名数组-->
          <!-- <el-table-column
            label="报警id"
            prop="alarmId"
            show-overflow-tooltip="true"
            fixed="left"
          > -->
          <!-- </el-table-column> -->
          <el-table-column
            label="报警类型"
            prop="alarmType"
            show-overflow-tooltip="true"
            fixed="left"
          >
          </el-table-column>
          <el-table-column
            label="报警状态"
            prop="alarmStatue"
            show-overflow-tooltip="true"
            fixed="left"
          >
          </el-table-column>
          <el-table-column
            label="摄像头类型"
            prop="capType"
            show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            label="摄像头id"
            prop="capId"
            show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column label="图片预览" width="120">
            <template slot-scope="scope">
              <!--              <img-->
              <!--                :src="scope.row.imagePath"-->
              <!--                style="max-width: 100px; max-height: 80px; cursor: pointer"-->
              <!--                @click="handleImageClick(scope.row.imagePath)"-->
              <!--              />-->
              <img
                :src="getDecodedImage(scope.row.imagePath)"
                style="max-width: 100px; max-height: 80px; cursor: pointer"
                @click="handleImageClick(getDecodedImage(scope.row.imagePath))"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="报警时间"
            prop="timestamp"
            width="160"
            show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            label="画面含有人数"
            prop="eventNum"
            width="120"
            show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            label="经度"
            prop="alarmLocationX"
            width="160"
            show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            label="纬度"
            prop="alarmLocationY"
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

      </el-card>
    </el-card>
    <div style="display: none">
    </div>
  </div>

</template>

<script>
import WebRtc from '@/views/real-time/components/WebRtc.vue'
import MapContainer from '@/components/Map/MapContainer.vue'
import { getAlarmData } from '@/api/alarm'
import { data } from 'autoprefixer'

export default {
  components: { WebRtc, MapContainer },
  provide() {
    return {
      changeOption: this.changeOption,
      getAlarmData: this.getAlarmData
    }
  },
  data() {
    return {
      showMap: false,
      options: [{
        value: '0',
        label: '摄像头1'
      }, {
        value: '1',
        label: '摄像头2（后续添加）'
      }, {
        value: '2',
        label: '摄像头3（后续添加）'
      }
      ],
      checkvalue: '',
      videoUrl: [
        'rtsp://admin:Admin707@192.168.1.64:554/Streaming/Channels/101/h264',
        'rtsp://admin:Admin707@192.168.1.65:554/Streaming/Channels/101/h264',
        'rtsp://admin:Admin707@192.168.1.64:554/Streaming/Channels/101/h264'
      ],
      showVideo: '',
      alarmData: []
    }
  },
  methods: {
    data,
    changeVideo(newValue) {
      this.showVideo = this.videoUrl[newValue]
    },
    changeOption(index) {
      this.checkvalue = this.options[index].value
      console.log('this.checkvalue:', this.checkvalue)
    },
    async getAlarmData() {
      this.alarmData = []
      try {
        const res = await getAlarmData()
        this.alarmData = res.data
        console.log('this.alarmData:', this.alarmData)
      } catch (error) {
        console.error('Error fetching alarm data:', error)
      }
      this.alarmData = this.alarmData.slice().reverse() // 逆序，时间最新的在最上面
    },
    getDecodedImage(base64String) {
      var binary = atob(base64String)
      var array = []
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }
      var blob = new Blob([new Uint8Array(array)], { type: 'image/png' })
      return URL.createObjectURL(blob)
    },
    // async getUnProcessAlarmData(){
    //   try {
    //     const res = await getUnProcessAlarmDate();
    //     this.unProcessAlarmData = res.data
    //     console.log('this.unProcessAlarmData:', this.unProcessAlarmData);
    //   } catch (error) {
    //     console.error('Error fetching unProcessAlarmData:', error);
    //   }
    // },
    // 在这里处理图片放大显示的逻辑，可以使用弹窗组件等
    // 例如，使用 element-ui 的 Dialog 组件来展示放大的图片
    handleImageClick(imageUrl) {
      console.log('Clicked image URL:', imageUrl)
      this.$alert(
        `<img src="${imageUrl}" style="width: 400px; height: 300px; object-fit: contain;">`,
        '报警内容对应图',
        {
          dangerouslyUseHTMLString: true,
          showConfirmButton: true,
          closeOnClickModal: true,
          closeOnPressEscape: true
        }
      )
    }
  },
  mounted() {
    this.checkvalue = '0' //默认值为摄像头1
    this.getAlarmData()
    // this.getUnProcessAlarmData()
  }
}
</script>

<style scoped>
.map-container-wrapper {
  margin: 0 20px;
  /* height: 400px; */
  /* 设置地图容器的高度 */
  width: 400px;
  /* 设置地图容器的宽度，这里假设为100%，可以根据实际情况调整 */
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  width: 100vw;
}

.card-bottom {
  flex-basis: 100%;
  /* el-table-column {

  } */
}

canvas {
  border: 1px solid #ccc;
}
</style>
