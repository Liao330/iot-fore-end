import request from '@/utils/request'
//获取地图需要的位置信息
export function getLocation(userId) {
  return request({
    url: '/vehicle/location?userId='+userId,
    method: 'GET'
  })
}

//车辆管理
//条件查询
//用post,请求参数是data，是请求体，是json格式
export const getVehicleList = (VehicleQueryDTO) => {
  return request({
      url: '/vehicle/search',
      method: 'post',
      data: VehicleQueryDTO
  })
}

//添加车辆
export const addVehicle = (vehicle) => {
  return request({
      url: '/vehicle/add',
      method: 'post',
      data: vehicle
  })
}

//列表数据的修改接口,车辆修改
export const updateVehicle = (vehicle) => {
  return request({
      url: '/vehicle/update',
      method: 'put',
      data: vehicle
  })
}

//列表单行删除接口
export const deleteVehicle = (id) => {
  return request({
      url: '/vehicle/delete/'+id,
      method: 'delete',
  })
}
//批量删除
export const moreDelete = (multipleSelection) => {
  return request({
      url: '/vehicle/delMore',
      method: 'put',
      data: multipleSelection
  })
}

// 获取选中子公司下的车牌号码数据
export function getLicenseNumbersBySubsidiary(subsidiaryIds) {
  return request({
    url: `/vehicle/numbers/${subsidiaryIds}`,
    method: 'get'
  })
}

//查询导出
export function exportVehicle(searchModel) {
  return request({
    url: '/vehicle/export',
    data: searchModel,
    method: 'post',
    // 改变接收数据的类型
    responseType: 'blob' // 使用blob接收二进制文件流
  })
}

// 获取所有车辆信息
export function getVehicle() {
  return request({
    url: '/vehicle/get-data',
    method: 'get'
  })
}

//列表数据的修改接口,车辆修改
export const updateVehicleData = (vehicleData) => {
  return request({
      url: '/vehicle/update_data',
      method: 'put',
      data: vehicleData
  })
}
// 根据车牌号，查询颜色
export function getVehicleColor(licenseNumber) {
  return request({
    url: '/vehicle/color?licenseNumber='+licenseNumber,
    method: 'GET'
  })
}

// 获取车辆历史图片
export function getVehicleImages(userId) {
  return request({
    url: '/vehicle/images?userId='+userId,
    method: 'get'
  })
}