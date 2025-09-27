import axios from 'axios'
import { MessageBox, Message } from 'element-ui'

// 创建 axios 实例
const request = axios.create({
    baseURL: 'http://220.203.0.15:8083', // 设置基础请求地址
    timeout: 5000 // 请求超时时间
  });

//请求拦截器
// request interceptor
request.interceptors.request.use(config=>{
  //console.log('Request URL:', config.url);
    return config
})

//响应拦截器
// response interceptor
request.interceptors.response.use(
  response => {
    const res = response.data
    if (response.data instanceof Blob) return response.data // 返回了Blob对象
    // if the custom code is not 200, it is judged as an error.
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 2 * 1000
      })
      // 请求失败
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 2 * 1000
    })
    return Promise.reject(error)
  }
)

export default request
