import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
// 首页
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'home' , affix: true, requireAuth: true}
    }]
  },
  // 实时状态
  {
    path: '/real',
    component: Layout,
    redirect: '/real/monitor',
    name: 'real',
    meta: { title: '车辆状态', icon: 'time', requireAuth: true },
    children: [
      {
        path: 'monitor',
        name: 'monitor',
        component: () => import('@/views/real-time/Monitor.vue'),
        meta: { title: '实时监控', requireAuth: true }
      },
      {
        path: 'list',
        name: 'list',
        component: () => import('@/views/real-time/List.vue'),
        meta: { title: '列表监控', requireAuth: true }
      },
      {
        path: 'video',
        name: 'video',
        component: () => import('@/views/real-time/Video.vue'),
        meta: { title: '视频监控', requireAuth: true }
      },
      {
        path: 'history',
        name: 'historyVideo',
        component: () => import('@/views/real-time/HistoryVideo.vue'),
        meta: { title: '历史视频', requireAuth: true }
      },
      {
        path: 'VehicleVideo',
        name: 'VehicleVideo',
        component: () => import('@/views/real-time/VehicleVideo.vue'),
        meta: { title: '车辆监控', requireAuth: true },
      },
      // {
      //   path: 'otherVideo',
      //   name: 'otherVideo',
      //   component: () => import('@/views/real-time/otherVideo.vue'),
      //   meta: { title: '其他监控', requireAuth: true }
      // },
      // {
      //   path: 'testimg',
      //   name: 'testimg',
      //   component: () => import('@/views/real-time/components/ImageMarker.vue'),
      //   meta: { title: '图片标注测试页面', requireAuth: true }
      // }
    ]
  },
  // AI检测
  // {
  //   path: '/intelligent',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'intelligent',
  //       name: 'intelligent',
  //       component: () => import('@/views/intelligent/Intelligent'),
  //       meta: { title: 'AI检测' , icon: 'ai', requireAuth: true }
  //     }
  //   ]
  // },
  // 统计报表
  {
    path: '/electric',
    component: Layout,
    redirect: '/real/monitor',
    name: 'real',
    meta: { title: '充电桩现场', icon: 'time', requireAuth: true },
    children: [
      {
        path: 'otherVideo',
        name: 'otherVideo',
        component: () => import('@/views/real-time/otherVideo.vue'),
        meta: { title: '充电桩现场', requireAuth: true }
      },
      // {
      //   path: 'testimg',
      //   name: 'testimg',
      //   component: () => import('@/views/real-time/components/ImageMarker.vue'),
      //   meta: { title: '图片标注测试页面', requireAuth: true }
      // }
    ]
  },
  {
    path: '/test',
    component: Layout,
    redirect: '/real/monitor',
    name: 'real',
    meta: { title: '实验室现场', icon: 'time', requireAuth: true },
    children: [
      {
        path: 'otherVideo',
        name: 'otherVideo',
        component: () => import('@/views/real-time/otherVideo.vue'),
        meta: { title: '实验室现场', requireAuth: true }
      },
      // {
      //   path: 'testimg',
      //   name: 'testimg',
      //   component: () => import('@/views/real-time/components/ImageMarker.vue'),
      //   meta: { title: '图片标注测试页面', requireAuth: true }
      // }
    ]
  },
  {
    path: '/report',
    component: Layout,
    redirect: '/report/alarm',
    name: 'report',
    meta: { title: '统计报表' , icon: 'chart'},
    children: [
      {
        path: 'alarm',
        name: 'alarm',
        component: () => import('@/views/report/Alarm.vue'),
        meta: { title: '路况统计报表', requireAuth: true }
      },
        // 报警日志页面
      {
            path: 'alarmlog',
            name: 'alarmlog',
            component: () => import('@/views/report/AlarmLog'),
            meta: { title: '报警日志', requireAuth: true }
      },
    ]
  },
  // 资料管理
  {
    path: '/info',
    component: Layout,
    redirect: '/info/vehicle',
    name: 'info',
    meta: { title: '资料管理', icon: 'data' },
    children: [
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/InfoMgmt/User.vue'),
        meta: { title: '用户管理', requireAuth: true, hidden: false }
      },
      {
        path: 'vehicle',
        name: 'vehicle',
        component: () => import('@/views/InfoMgmt/Vehicle.vue'),
        meta: { title: '车辆管理', requireAuth: true, hidden: false }
      },
    ]
  },
  //流程管理
  // {
  //   path: '/pro',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'process',
  //       name: 'process',
  //       component: () => import('@/views/process/Process'),
  //       meta: { title: '流程管理' , icon: 'order', requireAuth: true }
  //     }
  //   ]
  // },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
