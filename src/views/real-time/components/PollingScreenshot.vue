<template>
  <div>
    <div class="img_video">
      <el-image
        v-for="(item, index) in imageArray"
        :key="index"
        style="width: 15vw; height: 100px"
        :src="item"
        fit="scale-down"
        @click="handleImageClick(imageArray[index], index)"
      />
    </div>
  </div>
</template>

<script>
export default {
  inject: ['changeVideo', 'updateData'],
  data() {
    return {
      webRtcServers: [],
      imageArray: [
        'https://origin-iot.oss-cn-beijing.aliyuncs.com/摄像头1.jpg',
        'https://origin-iot.oss-cn-beijing.aliyuncs.com/摄像头2.jpg',
        'https://origin-iot.oss-cn-beijing.aliyuncs.com/摄像头3.jpg'
      ],
      videoElements: []
    }
  },
  mounted() {
    this.setupVideoStream(0, 'rtsp://admin:Admin707@192.168.1.64:554/Streaming/Channels/101/h264');
    this.setupVideoStream(1, 'rtsp://admin:Admin707@192.168.1.64:554/Streaming/Channels/101/h264');
    this.setupVideoStream(2, 'rtsp://admin:Admin707@192.168.1.64:554/Streaming/Channels/101/h264');
    setInterval(() => {
      this.videoElements.forEach((video, index) => {
        if (video.readyState >= 2) {
          // console.log('Screenshotting video:', index)
          this.screenShot(video, index);
        } else {
          // console.log('Video not ready:', index)
          // this.screenShot(video, index);
        }
      })
      this.updateData()
    }, 10000);
  },
  beforeDestroy() {
    this.webRtcServers.forEach(server => server.disconnect());
  },
  methods: {
    handleImageClick(url, index) {
      this.changeVideo(url, index)
    },
    setupVideoStream(index, rtspUrl) {
      const video = document.createElement('video');
      video.style.display = 'none';
      video.autoplay = true;
      video.muted = true;
      document.body.appendChild(video);

      const webRtcServer = new WebRtcStreamer(video, location.protocol + '//127.0.0.1:8000');
      webRtcServer.connect(rtspUrl);

      this.videoElements[index] = video;
      this.webRtcServers[index] = webRtcServer;
    },
    screenShot(video, index) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const screenshotUrl = canvas.toDataURL('image/png');
      this.uploadOSS(screenshotUrl, index);
    },
    uploadOSS(imgUrl, index) {
      const base64String = imgUrl;
      const base64WithoutPrefix = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64WithoutPrefix, 'base64');
      const OSS = require('ali-oss');
      const client = new OSS({
        region: 'oss-cn-beijing',
        accessKeyId: 'LTAI5tCGEmshovxuCo6cqDvw',
        accessKeySecret: 'odb8UDZVLmuKs6SDTOTua7iwlSTah1',
        bucket: 'origin-iot'
      });
      // const fileName = `screenshot-${index}-${Date.now()}.jpg`;
      const fileName = `摄像头${index + 1}.jpg`;
      // console.log('摄像头:',fileName);

      client.put(fileName, buffer)
        .then(res => {
          const url = `https://origin-iot.oss-cn-beijing.aliyuncs.com/${fileName}`;
          this.$set(this.imageArray, index, url) // 使用 $set 确保响应式更新
          // this.$set(this.imageArray, index, 'https://origin-iot.oss-cn-beijing.aliyuncs.com/136.jpg') // 使用 $set 确保响应式更新
          console.log('更新图片:', this.imageArray)
        })
        .catch(err => {
          console.error('Upload error:', err);
        });
    }
  }
}
</script>

<style scoped>
.img_video {
  display: flex;
  gap: 10px;
}
</style>
