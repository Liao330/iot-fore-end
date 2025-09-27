import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// vue中导出excel表格模板
// import FileSaver from 'file-saver'
// import XLSX from 'xlsx'

// Vue.prototype.$FileSaver = FileSaver; // 设置全局
// Vue.prototype.$XLSX = XLSX; // 设置全局


// 地图
import VueAMap from 'vue-amap';

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI);
Vue.use(VueAMap);

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

VueAMap.initAMapApiLoader({
  key: 'f32f10bac2a41ec8eb25b32866c13a04',  // 高德key,可以在官网申请
  plugin: ['AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType'], // 插件，按需引入
  v: '1.4.15', // 不知道为什么要写这个，不写项目会报错，随便写的，跟下载的版本对应不了
  uiVersion: '1.0.11' // ui版本号1.0.11，也是需要写
});