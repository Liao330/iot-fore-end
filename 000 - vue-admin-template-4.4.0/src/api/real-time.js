import request from '@/utils/request'

// 列表监控查询列表
export const getvehicleDateList = (VehicleQueryDTO) => {
  return request({
    url: '/vehicleData/search',
    method: 'post',
    data: VehicleQueryDTO
  })
}

// 查询导出
export function exportReal(searchModel) {
  return request({
    url: '/vehicleData/export',
    data: searchModel,
    method: 'post',
    // 改变接收数据的类型
    responseType: 'blob' // 使用blob接收二进制文件流
  })
}

