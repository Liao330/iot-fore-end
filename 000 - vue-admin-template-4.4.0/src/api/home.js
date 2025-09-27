import request from '@/utils/request'

// 查询子公司总数
export function getSubsidiaryCount(userId) {
  return request({
    url: '/subsidiaryCompany?userId='+userId,
    method: 'get'
  })
}

/*查询车俩车俩总数*/
export function getVehicleCount(userId) {
  return request({
    url: '/vehicle?userId='+userId,
    method: 'get'
  })
}

/*查询车俩在线数*/
export function getOnlineCount(userId) {
  return request({
    url: '/vehicle/online?userId='+userId,
    method: 'get'
  })
}

/*视频车辆数*/
export function getVedioCount(userId) {
  return request({
    url: '/vehicle/vedio?userId='+userId,
    method: 'get'
  })
}

/*查询今日报警数*/
export function getTodayAlarm(userId) {
  return request({
    url: '/alarm/todayalarm?userId='+userId,
    method: 'get'
  })
}
/*查询报警数*/
export function getAlarm(userId) {
  return request({
    url: '/alarm/alarmCount?userId='+userId,
    method: 'get'
  })
}
