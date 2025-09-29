import axios from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import router from '@/router'
const http = axios.create({
  // 通用请求的地址前缀
  baseURL: 'https://v3pz.itndedu.com/v3pz',
  timeout: 10000, // 超时时间
})

// 添加请求拦截器
http.interceptors.request.use(function (config) {
  // 不需要添加token的api白名单
  const whiteUrl = ['/login','/get/code','/user/authentication']
  //从本地拿token
  const token = localStorage.getItem('pz_token')
  if (token && !whiteUrl.includes(config.url)) {
    config.headers['X-token'] = token
    // 临时
    // config.headers['auth'] = '13797053405'
  }
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 添加响应拦截器
http.interceptors.response.use(function (response) {
  // 对于接口返回异常的数据，给用户提示
  if (response.data.code === -1) {
    ElMessage.warning(response.data.message)
  }
  //如果token过期显示-2 清除用户信息跳转登录页面
  if (response.data.code === -2) {
    localStorage.removeItem('pz_token')
    localStorage.removeItem('pz_userInfo')
    localStorage.removeItem('Vuex_data')
    router.push('/login')

  }
  return response
}, function (error) {
  // 对响应错误做点什么
  ElMessage.error('网络异常，请检查！')
  return Promise.reject(error)
})

export default http