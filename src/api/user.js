import request from '@/utils/request'


// 登录接口 返回后端传回的数据
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

// 退出登录
export function logout(userInfo) {
  return request({
    url: `/user/logout/${userInfo.username}`,
    method: 'post'
  })
}

//用户管理
//条件查询
//用post,请求参数是data，是请求体，是json格式
export const getUserList = (UserQueryDTO) => {
  return request({
      url: '/user/search',
      method: 'post',
      data: UserQueryDTO
  })
}

//列表数据的编辑接口,用户修改
export const updateUser = (userDTO) => {
  return request({
      url: '/user/update',
      method: 'put',
      data: userDTO
  })
}

//列表单行删除接口
export const deleteUser = (id) => {
  return request({
      url: '/user/delete/'+id,
      method: 'delete',
  })
}
//批量删除
export const moreDelete = (multipleSelection) => {
  return request({
      url: '/user/delMore',
      method: 'put',
      data: multipleSelection
  })
}

//添加用户
export const addUser = (userDTO) => {
  return request({
      url: '/user/add',
      method: 'post',
      data: userDTO
  })
}

//查询导出
export function exportUser(searchModel) {
  return request({
    url: '/user/export',
    data: searchModel,
    method: 'post',
    // 改变接收数据的类型
    responseType: 'blob' // 使用blob接收二进制文件流
  })
}

