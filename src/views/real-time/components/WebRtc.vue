<template>
  <div>
    <!-- <button @click="alarmWarning_one()">test1</button>
    <button @click="alarmWarning_many()">test1111</button> -->
    <div>
      <!-- 如果要添加多个视频监控，需要在这里添加多个video标签 -->
      <video id="video" ref="video" autoplay height="300" style="width: 45vw;" />
    </div>
    <PollingScreenshot :videourl="videourl" />
    <div style="display: none;">
      <button ref="begin" @click="handleStartRecording">开始录制</button>
      <button ref="end" @click="stopRecording">停止录制并保存</button>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/apis/real-time.js'
import { sendImages } from '@/api/alarm'
import { getUnProcessAlarmDate } from '@/api/alarm'
import PollingScreenshot from '@/views/real-time/components/PollingScreenshot.vue'

export default {
  name: 'ShowVideo',
  components: {
    PollingScreenshot
  },
  props: ['checkurl', 'videourl', 'alarmdata'],
  data() {
    return {
      token: '',
      webRtcServer1: null,
      mediaRecorder: null,
      chunks: [],
      videoStartTime: null,
      extractedData: [],
      currentRecordingTimestamps: [],
      onShot: false,
      unProcessAlarmData: [],
      isneddLabel: false,
      flag: 0
    }
  },
  provide() {
    return {
      changeVideo: this.changeVideo,
      // getAlarmData: this.getAlarmData
      updateData: this.updateData

    }
  },
  inject: ['changeOption', 'getAlarmData'],
  watch: {
    checkurl: {
      handler(newValue) {
        this.changeVideo(this.checkurl)
      },
      deep: true
    }
  },
  mounted() {
    this.webRtcServer1 = new WebRtcStreamer('video', location.protocol + '//127.0.0.1:8000')
    this.webRtcServer1.connect('rtsp://admin:Admin707@192.168.1.64:554/Streaming/Channels/101/h264')
    this.getToken()
    this.updateData()
    this.circulateData()
    const videoElement = this.$refs.video
    videoElement.addEventListener('loadeddata', () => {
      console.log('11111111111111111111')
      // this.processExtractedData_label() // 需要发送给后端打标
      // this.processExtractedData_unlabel() // 不需要发送给后端打标
    })
  },
  beforeDestroy() {
    this.webRtcServer1.disconnect()
    this.webRtcServer1 = null
  },
  methods: {
    changeVideo(url, index) {
      console.log('点击了图片')
      this.webRtcServer1.connect(url)
      this.changeOption(index)
    },
    // handleImageClick(url) {
    //   console.log('点击了图片', url)
    //   this.changeVideo(url)
    // },
    async getToken() {
      const res = await getToken()
      if (res.code === 200) {
        this.token = res.data.token
      }
    },
    async updateData() {
      // console.log('asdasda');
      await this.getUnProcessAlarmData()
      this.extractedData = this.initAlarmData() // 将unProcessAlarmData中需要的数据拿出来
    },
    // 每10s更新一次新的报警数据
    //  circulateData() {
    //     setInterval(() => {
    //     this.updateData()
    //   }, 10000)
    //  },
    initAlarmData() {
      // console.log(this.unProcessAlarmData,'asdadasdas');
      return this.unProcessAlarmData.map(item => {
        return {
          alarmId: item.alarmId,
          timestamp: item.timestamp,
          url: '',
          upload: false
        }
      })
    },
    async getUnProcessAlarmData() {
      try {
        const res = await getUnProcessAlarmDate()
        this.unProcessAlarmData = res.data
        if (this.unProcessAlarmData.length === 1) {
          this.alarmWarning_one()
        } else if (this.unProcessAlarmData.length > 1) {
          this.alarmWarning_many()
        }
        this.unProcessAlarmData = this.unProcessAlarmData.slice().reverse()
        // 不刷新页面的前提下，将新获取的数据增加到alarmdata最前面，并且渲染表格
        // this.alarmdata.unshift(...this.unProcessAlarmData)
        // this.$set(this.alarmdata, this.alarmdata)

        console.log('this.alarmdatassss:', this.alarmdata)
        console.log('this.unProcessAlarmData:', this.unProcessAlarmData)
      } catch (error) {
        console.error('Error fetching unProcessAlarmData:', error)
      }
    },
    getNowTime() {
      return new Date(Date.now() + 28800000).toISOString()
    },
    // 判断范围内的图片是否全部成功上传至oss服务器
    // ifUpload() {
    //   for (let i = 0; i < this.currentRecordingTimestamps.length; i++) {
    //     if (this.currentRecordingTimestamps[i].upload === false) return false
    //   }
    //   return true
    // },
    async processExtractedData_label() {
      this.isneddLabel = true
      // console.log('jinru',this.extractedData);
      while (this.extractedData.length > 0) {
        let nowTime = this.getNowTime()
        this.$nextTick(() => {
          console.log('开始录制，时间：', nowTime)
          this.$refs.begin.click() // 确保按钮被渲染
        })
        await this.sleep(35000) // 录制1分钟=给50s上传图片(40s后刷新新范围内数据)+10s睡眠
        this.updateData()
        await this.sleep(5000)
        this.currentRecordingTimestamps = this.getCurrentRecordingTimestamps() // 将范围内的数据拿出来
        console.log('在范围内的_label：', this.currentRecordingTimestamps)
        await this.sleep(10000) // 录制1分钟=给50s上传图片(40s后刷新新范围内数据)+10s睡眠
        if (this.onShot === true) {
          console.log('全部上传oss了')
          await this.onDestroyMediaRecorder() // 清空存储的东西
        }
        await this.getAlarmData()
        await this.sleep(10000) // 等待10秒以确保被清空
        nowTime = this.getNowTime()
        console.log('停止录制，时间：', nowTime)
        this.$refs.end.click()
        await this.sleep(1000) // 等待1秒以确保录制完全停止
        if (this.onShot === false) {
          await this.processCurrentRecordingTimestamps()
          this.mediaRecorder = null // 销毁 MediaRecorder 实例
          console.log('MediaRecorder 已销毁', this.getNowTime())
        }
      }
    },
    // 不用标注，直接截图展示。录制10s为一周期
    async processExtractedData_unlabel() {
      this.isneddLabel = false
      console.log('jinru', this.extractedData)
      let count = 1
      // while (1) {
      //   // 获取需要标注的数据 如果有 break
      //   this.updateData()
      //   // 在此处将范围内的数据拿出来
      //   this.currentRecordingTimestamps = this.getCurrentRecordingTimestamps() // 将范围内的数据拿出来
      // }
      while (1) {
        // console.log(this.extractedData.length);
        while (this.extractedData.length > 0) {
          if (count == 2) {
            await this.onDestroyMediaRecorder() // 清空存储的东西
          }
          let nowTime = this.getNowTime()
          this.$nextTick(() => {
            console.log('开始录制，时间：', nowTime)
            this.$refs.begin.click() // 确保按钮被渲染
          })
          await this.sleep(10000) // 不用打标注，录制10s差不多了
          // this.updateData() // 刷新需要截图的数据
          // if (count != 1 ) {
          //   this.currentRecordingTimestamps = this.getCurrentRecordingTimestamps() // 将范围内的数据拿出来
          //   console.log('在',nowTime,'范围内的_unlabel1：', this.currentRecordingTimestamps)
          // }
          if (this.onShot === true && count != 1) {
            // await this.processCurrentRecordingTimestamps()
            console.log('全部上传oss了111')
            await this.onDestroyMediaRecorder() // 清空存储的东西
          }
          if (count != 1) {
            this.currentRecordingTimestamps = this.getCurrentRecordingTimestamps() // 将范围内的数据拿出来
            console.log('在', nowTime, '范围内的_unlabel1：', this.currentRecordingTimestamps)
          }
          console.log('在范围内的_unlabel2：', this.currentRecordingTimestamps)
          // this.getAlarmData() // 上传到oss后，刷新新的报警数据
          nowTime = this.getNowTime()
          console.log('停止录制，时间：', nowTime)
          this.$refs.end.click()
          const blob = new Blob(this.chunks, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)
          this.videoBlobUrl = url
          console.log('录制完成，录制内容的 URL：', url)
          // await this.sleep(1000) // 等待1秒以确保录制完全停止
          if (this.onShot === false) {
            // console.log('在范围内的：', this.currentRecordingTimestamps)
            await this.processCurrentRecordingTimestamps()
            this.mediaRecorder = null // 销毁 MediaRecorder 实例
            console.log('MediaRecorder 已销毁', this.getNowTime())
            // this.updateData()
            // this.getAlarmData()
            count++
            console.log('extractedData', this.extractedData)
          }
          this.updateData()
        }
        // 加if 如果 ==0  跳转processExtractedData_unlabel
        // if (this.extractedData.length == 0)
      }
    },
    getCurrentRecordingTimestamps() {
      let addTime = 60
      if (this.isneddLabel == false) {
        addTime = 10
      }
      const currentTime = Date.now() / 1000 - 5
      const endTime = currentTime + addTime // 1分钟/10s 后
      return this.extractedData.filter(item => {
        const timestamp = new Date(this.getLocaldate(item.timestamp)).getTime() / 1000
        return timestamp >= currentTime && timestamp <= endTime
      })
    },
    async processCurrentRecordingTimestamps() {
      // console.log(this.currentRecordingTimestamps.length);
      for (let i = 0; i < this.currentRecordingTimestamps.length; i++) {
        const item = this.currentRecordingTimestamps[i]
        // await onStopRecording()
        item.url = this.videoBlobUrl
        console.log(this.videoBlobUrl)
        item.upload = true
        console.log(item)
        await this.getMyphoto(item.url, item.alarmId, item.timestamp, i)
      }
      // this.currentRecordingTimestamps = [];
      // let nowTime = this.getNowTime()
      // console.log('全部上传至oss了', nowTime)
      // console.log('看下范围内的数组被清空了吗', this.currentRecordingTimestamps)
    },
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    handleStartRecording() {
      this.onShot = true
      // console.log('我在录制了', this.onShot)
      this.videoStartTime = Date.now() / 1000
      // console.log('看下精度如何？', this.videoStartTime)
      const nowTime = this.getNowTime()
      if (this.mediaRecorder) {
        console.log('已经在录制中', nowTime)
      } else {
        // console.log('开始录制了')
      }
      // this.videoStartTime = Date.now() / 1000;
      const videoElement = this.$refs.video
      if (videoElement.srcObject) {
        this.mediaRecorder = new MediaRecorder(videoElement.srcObject)
        this.mediaRecorder.start()
        this.mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            this.chunks.push(event.data)
          }
        }
        // this.mediaRecorder.onstop = () => {
        //   // this.onStopRecording()
        // }
      } else {
        console.error('没有视频源可以录制')
      }
    },
    stopRecording() {
      this.onShot = false
      // console.log('我停止录制了', this.onShot)
      return new Promise(resolve => {
        if (this.mediaRecorder) {
          this.mediaRecorder.stop()
          resolve()
        }
      })
    },
    onStopRecording() {
      const blob = new Blob(this.chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      this.videoBlobUrl = url
      console.log('录制完成，录制内容的 URL：', url)
    },
    async onDestroyMediaRecorder() {
      // await this.sleep(10000); // 给10秒上传到oss
      if (this.videoBlobUrl) {
        URL.revokeObjectURL(this.videoBlobUrl) // 释放 URL
        this.videoBlobUrl = null
        // this.mediaRecorder = null // 销毁 MediaRecorder 实例
        this.chunks = [] // 清理存储的数据块
        // console.log('MediaRecorder 已销毁',this.getNowTime())
        this.currentRecordingTimestamps = []
        // console.log('看下范围内的数组被清空了吗', this.currentRecordingTimestamps)
      }

      // this.mediaRecorder = null // 销毁 MediaRecorder 实例
      // this.chunks = [] // 清理存储的数据块
      // console.log('MediaRecorder 已销毁')
    },
    timeToISO(originalTimestamp) {
      originalTimestamp = String(originalTimestamp)
      const year = originalTimestamp.substring(0, 4)
      const month = originalTimestamp.substring(4, 6)
      const day = originalTimestamp.substring(6, 8)
      const hour = originalTimestamp.substring(8, 10)
      const minute = originalTimestamp.substring(10, 12)
      const second = originalTimestamp.substring(12, 18)
      const isoFormattedTime = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
      // 下面两个是测试用的
      // const isoFormattedTime = `${year}-${month}-05T23:${minute}:${second}Z`
      // const isoFormattedTime = `2024-08-05T22:36:${second}Z`
      // console.log(isoFormattedTime)
      return isoFormattedTime
    },
    getLocaldate(timestamp) {
      const isoFormattedTime = this.timeToISO(timestamp)
      const specifiedDate = new Date(isoFormattedTime)
      const localOffset = specifiedDate.getTimezoneOffset() * 60000
      const localDate = new Date(specifiedDate.getTime() + localOffset)
      // console.log('localdate', localDate
      return localDate
    },
    async getMyphoto(url, alarmId, timestamp, index) {
      const timeDifference = this.getLocaldate(timestamp).getTime() / 1000 - this.videoStartTime
      // console.log('时间差', timeDifference)
      console.log(url)
      const videoElement = document.createElement('video')
      videoElement.controls = true
      videoElement.src = url
      videoElement.addEventListener('loadedmetadata', () => {
        this.takeScreenshotAtSpecifiedTime(videoElement, timeDifference).then(async screenshotDataUrl => {
          console.log('准备上传到oss')
          // 先将screenshotDataUrl保存下来，防止被清空
          this.uploadOSS(screenshotDataUrl, alarmId, index)
          URL.revokeObjectURL(url)
        }).catch(error => {
          console.error('Failed to take screenshot:', error)
        })
      })
    },
    takeScreenshotAtSpecifiedTime(videoElement, timeDifference) {
      return new Promise((resolve, reject) => {
        if (isNaN(timeDifference)) {
          reject('提供的当前时间不是数字，NaN')
          return
        }
        videoElement.currentTime = timeDifference
        const canvas = document.createElement('canvas')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        const ctx = canvas.getContext('2d')
        const precision = 3
        const currentTime = Math.round(videoElement.currentTime * 10 ** precision) / 10 ** precision
        const aimTime = Math.round(timeDifference * 10 ** precision) / 10 ** precision
        videoElement.addEventListener('seeked', () => {
          if (currentTime !== aimTime) {
            console.error('视频无法跳转到指定时间。')
            return
          }
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
          const screenshotDataUrl = canvas.toDataURL('image/png')
          resolve(screenshotDataUrl)
        })
      })
    },
    uploadOSS(imgUrl, alarmId, i) {
      const base64String = imgUrl
      const base64WithoutPrefix = base64String.replace(/^data:image\/[a-z]+;base64,/, '')
      const buffer = Buffer.from(base64WithoutPrefix, 'base64')
      const OSS = require('ali-oss')
      const client = new OSS({
        region: 'oss-cn-beijing',
        accessKeyId: 'LTAI5tCGEmshovxuCo6cqDvw',
        accessKeySecret: 'odb8UDZVLmuKs6SDTOTua7iwlSTah1',
        bucket: 'origin-iot'
      })
      const fileName = alarmId + '.jpg'
      const objectName = `${fileName}`
      client.put(objectName, buffer)
        .then(res => {
          // console.log('Upload success', res);
          const url = `https://origin-iot.oss-cn-beijing.aliyuncs.com/${objectName}`
          console.log('File URL:', url)
          // if (this.isneddLabel) {//this.isneddLabel
          //   console.log('addURL');
          //   this.sendImages(alarmId, url)
          // }
          this.sendImages(alarmId, url)
        })
        .catch(err => {
          console.error('Upload error:', err)
        })
    },
    // 将oss的截图图片传给后端
    async sendImages(alarmId, url) {
      try {
        await sendImages(alarmId, url, this.token)
      } catch (error) {
        console.error('Error sendImages:', error)
      }
    },
    alarmWarning_one() {
      this.$notify({
        title: '警告',
        message: '<strong>您有一条新的报警信息，报警信息为：</strong><br>报警类型：' +
          this.unProcessAlarmData[0].alarmType + '<br>报警时间：' + this.unProcessAlarmData[0].timestamp +
          '<br>摄像头id：' + this.unProcessAlarmData[0].capId + '<br>摄像头类型：' + this.unProcessAlarmData[0].capType +
          '<br>经度：' + this.unProcessAlarmData[0].alarmLocationX + '<br>纬度：' + this.unProcessAlarmData[0].alarmLocationY,
        type: 'warning',
        dangerouslyUseHTMLString: true,
        duration: 5000 // 显示时间
      })
    },
    alarmWarning_many() {
      this.$notify({
        title: '警告',
        message: '<strong>您有多条新的报警信息，请刷新查看</strong>',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        duration: 5000 // 显示时间
      })
    }
  }
}
</script>

<style scoped>
/* .img_video {
  img {
    margin: 5px 10px;
  }
} */
</style>
