import request from '@/utils/request'
// 请求所有总公司信息
export function getCompany(userId) {
  return request({
    url: '/company?userId=' + userId,
    method: 'get',
  })
}

// 获取所有公司及其子公司信息
export function getAllCompaniesWithSubsidiaries(searchModel) {
  return request({
    url: '/company/companies',
    method: 'post',
    data: searchModel
  })
}

// 公司的车辆数排行
export function getCompanyRank(userId) {
  return request({
    url: '/company/rank?userId=' + userId,
    method: 'get',
  })
}
// 公司的报警数排行
export function getCompanyRank2(userId) {
  return request({
    url: '/company/rank2?userId=' + userId,
    method: 'get',
  })
}