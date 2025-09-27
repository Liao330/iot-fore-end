import request from '@/utils/request'
import { int } from 'mockjs/src/mock/random/basic'
import he from 'element-ui/src/locale/lang/he'

//获取报警内容表的信息
export function getAlarmContent() {
  return request({
    url: '/alarm/content',
    method: 'get'
  })
}

//获取报警次数多的车俩排名信息
export function getRanking(userId) {
  return request({
    url: '/alarm/rank?userId='+userId,
    method: 'get'
  })
}

//获取报警内容的图片信息
export function getIncidentImag(searchModel) {
  return request({
    url: '/alarm/imag',
    method: 'post',
    data: searchModel
  })
}

//统计报表
//条件查询
//用post,请求参数是data，是请求体，是json格式
export const getAlarmList = (searchModel) => {
  return request({
      url: '/alarm/search',
      method: 'post',
      data: searchModel
  })
}

// 普通报警报表，更改报警处理状态
export const updateProcessStatus = (alarmId) => {
  return request({
    url: `/alarm/process/${alarmId}`,
    method: 'put'
  })
}
// 批量处理报警状态
export const submitMoreProcess = (selectedAlarmIds) => {
  return request({
    url: '/alarm/processMore',
    method: 'put',
    data: selectedAlarmIds
  })
}

//查询导出
export function exportAlarm(searchModel) {
  return request({
    url: '/alarm/export',
    data: searchModel,
    method: 'post',
    // 改变接收数据的类型
    responseType: 'blob' // 使用blob接收二进制文件流
  })
}

// 获取已处理图片的报警信息所有内容
export function getAlarmData(){
  return request({
    url: '/show/alarm',
    method: 'get',
  })
}

// 获取没处理图片的报警信息id和时间戳
export function getUnProcessAlarmDate(){
  return request({
    url: '/show/screenshot',
    method: 'get',
  })
}

// 发送原始图片给后端
export function sendImages(alarmId , imagePath, token){
  const data = {
    alarmId,
    imagePath
  };
    // 设置请求头，包含 token
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${token}`
  };
  return request({
    url: '/addImage',
    method: 'post',
    data: data,
    headers: headers
  })
}

// 上传图片请求，检测图片
// export function getIncidentImag(searchModel) {
//   return request({
//     url: '/api/ai/detectImage',
//     method: 'post',
//     headers: {
//       "Content-Type": "multipart/form-data"
//     },
//     data: searchModel
//   });
// }

