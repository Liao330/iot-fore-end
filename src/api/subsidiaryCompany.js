import request from '@/utils/request'

//请求所有子公司信息
export function getSubCompany() {
    return request({
      url: '/subsidiaryCompany/getSubCompany',
      method: 'get',
    })
  }