import request from '@/utils/request'
//请求所有公司信息
export function getRole() {
    return request({
      url: '/role',
      method: 'get',
    })
  }
