import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../views/main.vue'
import Login from '../views/login/index.vue'
// import Admin from '../views/auth/admin/index.vue'
// import Group from '../views/auth/group/index.vue'
// import Order from '../views/vppz/order/index.vue'
// import Dashboard from '../views/dashboard/index.vue'
// import Staff from '../views/vppz/staff/index.vue'


//关于重定向
//这段代码是在VueRouter 实例化时，对根路径 /进行的动态重定向处理。
//它的目的，是确保用户访问应用首页时，能够根据他们拥有的第一个动态菜单权限，自动跳转到对应的页面。
//如果用户已登录状态信息（动态路由）存在： 应用会根据权限列表，自动导航到用户有权访问的第一个页面（如果有二级菜单，就跳到第一个二级菜单；如果没有，就跳到一级菜单）。
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/',
      component: Layout,
      name: 'main',
      redirect: to => {
        const loaclData = localStorage.getItem('Vuex_data')
        
        if (loaclData) {
          //如果 loaclData 存在，代码会解析数据并尝试找到用户应该看到的第一个菜单项的路径。
          const child = JSON.parse(loaclData).menu.routerList[0].children
          // 判断是否有二级菜单（子路由）
          if (child) { 
            return child[0].meta.path   //跳转逻辑： 如果第一个根菜单项下有子菜单，则重定向到第一个子菜单的路径。
          } else {                      //没有二级菜单 (else 成立)
            return JSON.parse(loaclData).menu.routerList[0].meta.path //跳转逻辑： 如果第一个根菜单项没有子菜单，则直接重定向到该根菜单项本身的路径。
          }
        } else {
          return '/login'
        }
      },
      children: [
        // {
        //   path: 'dashboard',
        //   meta: { id: '1', name: '控制台', icon: 'Platform', path: '/dashboard', describe: '用于展示当前系统中的统计数据、统计报表及重要实时数据' },
        //   component: Dashboard
        // },
        // {
        //   path: 'auth',
        //   meta: { id: '2' ,name: '权限管理', icon: 'Grid' },
        //   children: [
        //     {
        //       path: '',
        //       alias: ['admin'],
        //       meta: { id: '1', name: '账号管理', icon: 'Avatar', path: '/auth/admin', describe: '管理员可以进行编辑，权限修改后需要登出才会生效' },
        //       component: Admin
        //     },
        //     {
        //       path: 'group',
        //       meta: { id: '2', name: '菜单管理', icon: 'Menu', path: '/auth/group', describe: '菜单规则通常对应一个控制器的方法,同时菜单栏数据也从规则中获取' },
        //       component: Group
        //     }
        //   ]
        // },
        // {
        //   path: 'vppz',
        //   meta: { id: '3', name: 'DIDI陪诊', icon: 'BellFilled' },
        //   children: [
        //     {
        //       path: '',
        //       alias: ['staff'],
        //       meta: { id: '1', name: '陪护管理', icon: 'Checked', path: '/vppz/staff', describe: '陪护师可以进行创建和修改，设置对应生效状态控制C端选择' },
        //       component: Staff
        //     },
        //     {
        //       path: 'order',
        //       meta: { id: '2', name: '订单管理', icon: 'List', path: '/vppz/order', describe: 'C端下单后可以查看所有订单状态，已支付的订单可以完成陪护状态修改' },
        //       component: Order
        //     }
        //   ]
        // }
      ]
    },
    {
      path: '/login',
      component: Login
    },
  ],
})

export default router
