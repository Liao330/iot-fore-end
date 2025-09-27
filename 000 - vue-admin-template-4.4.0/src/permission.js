/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar 进度条插件
import 'nprogress/nprogress.css' // progress bar style 进度条样式
import { getToken } from '@/utils/auth' // get token from cookie 从cookie中获取token
import getPageTitle from '@/utils/get-page-title' // 获取页面标题

NProgress.configure({ showSpinner: false }) // 配置NProgress进度条，隐藏旋转图标

let userRole = '' // 全局变量存储用户角色信息

const whiteList = ['/login'] // 设置白名单，不需要重定向的页面路径

const refreshPage = to => {
  if (to.meta && to.meta.refresh) {
    window.location.reload(true)
  }
}

router.beforeEach(async(to, from, next) => {
  // 开始进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 刷新页面
  refreshPage(to)

  // 判断用户是否已登录
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // 如果已经登录，访问登录页面将自动跳转到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // next()
      // 根据用户角色和路由meta信息判断是否有权限访问该页面
      // const roleName = store.getters.roleName;// 获取用户角色信息
      const roleName = localStorage.getItem('roleName')
      console.info('角色名111')
      console.info(roleName)
      // 判断当前路由是否需要权限控制
      // 根据用户角色进行页面访问权限控制
      if (roleName === '普通用户' && to.path.startsWith('/real') && to.path.startsWith('/info')) {
        // 如果是普通用户且尝试访问实时状态相关页面，则重定向到首页或其他页面
        next('/404') // 重定向到404
      } else if (roleName === '监控员' && to.path.startsWith('/info')) {
        next('/404') // 重定向到404
      } else if (roleName === '运维员' && to.path.startsWith('/info/user')) {
        next('/404') // 重定向到404
      } else {
        // 其他角色或无特殊限制的情况下直接放行
        next()
      }
    }
  } else {
    /* has no token */
    if (whiteList.indexOf(to.path) !== -1) {
      // 在白名单中的路径可以匿名访问
      next()
    } else {
      // 其他页面必须登录后才能访问
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
  // if (hasToken) {
  //   if (to.path === '/login') {
  //     // 已登录且要跳转到登录页，则直接重定向到首页
  //     next({ path: '/' })
  //     NProgress.done()
  //   } else {
  //     const hasGetUserInfo = store.getters.name
  //     if (hasGetUserInfo) {
  //       // 已获取用户信息，直接放行
  //       next()
  //     } else {
  //       try {
  //          // 获取用户信息
  //         // await store.dispatch('user/getInfo') // 原本的，不知源错误
  //         store.dispatch('user/getInfo').then(() => next())

  //         next()
  //       } catch (error) {
  //         // 出错时移除token并跳转到登录页重新登录
  //         await store.dispatch('user/resetToken')
  //         Message.error(error || 'Has Error')
  //         next(`/login?redirect=${to.path}`)
  //         NProgress.done()
  //       }
  //     }
  //   }
  // } else {
  //    /* 没有token */

  //   if (whiteList.indexOf(to.path) !== -1) {
  //     // 在免登录白名单中，直接放行
  //   } else {
  //     // 其他没有访问权限的页面将重定向到登录页
  //     next(`/login?redirect=${to.path}`)
  //     NProgress.done()
  //   }
  // }
})

router.afterEach(() => {
  // 结束进度条
  NProgress.done()
})
