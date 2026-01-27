import { defineStore } from 'pinia'

/**
 * 菜单状态管理 Store (从 Vuex 重构为 Pinia)
 *
 * 原 Vuex 模块: store/menu.js
 * 重构说明:
 * - state 保持不变，改为函数返回对象
 * - mutations 改为 actions (Pinia 中没有 mutations 概念)
 * - 使用 this 直接修改 state，无需传入 state 参数
 */

export const useMenuStore = defineStore('menu', {
  // ==================== State ====================
  // 这里是状态定义，与原 Vuex state 相同
  state: () => ({
    isCollapse: false, // 侧边菜单栏的展开收齐状态
    selectMenu: [], // 点击左侧菜单栏 Header部分显示的tab标签
    // 最后在navHeader组件部分显示
    // 这里面存的是item.meta中的数据
    // 每个item.meta是一个对象 这个是数组包对象
    routerList: [], // 动态路由
    menuActive: '1-1', // 菜单高亮
  }),

  // ==================== Actions ====================
  // 原 Vuex mutations 改为 actions
  // Pinia 中不区分 mutations 和 actions，统一使用 actions
  // 在 actions 中使用 this 访问和修改 state
  actions: {
    /**
     * 控制侧边菜单栏的展开收齐
     * 原 mutation: collapseMenu
     */
    collapseMenu() {
      this.isCollapse = !this.isCollapse
    },

    /**
     * 控制点击左侧菜单，header部分tab显示
     * 原 mutation: addMenu
     * @param {Object} data - 传入的点击的菜单信息 (item.meta)
     */
    addMenu(data) {
      // findIndex方法去重，没找到的情况下，将内容添加到tab
      if (this.selectMenu.findIndex((item) => item.path === data.path) === -1) {
        this.selectMenu.push(data)
      }
    },

    /**
     * 关闭按钮实现关闭tab操作
     * 原 mutation: closeMenu
     * @param {Object} data - 传递过来的菜单对象
     */
    closeMenu(data) {
      // 遍历数组包对象中的每一个对象
      const index = this.selectMenu.findIndex((item) => item.name === data.name)
      this.selectMenu.splice(index, 1)
    },

    /**
     * 动态菜单渲染
     * 原 mutation: DynamicMenuRender
     *
     * 这段代码的主要目的是将从后端获取的动态菜单数据（data）
     * 转换成 Vue Router 能够识别和使用的路由配置对象数组，
     * 并存储到 Pinia 的 state.routerList 中
     *
     * vite得到的数据解析如下：
     * Key (键)：是组件文件的相对路径
     * Value (值)：是一个异步导入函数（一个返回 Promise 的箭头函数）
     * 例如 () => import('/src/views/auth/admin/index.vue')
     *
     * @param {Array} data - 从后端获取的动态菜单数据
     */
    dynamicMenuRender(backendMenuList) {
      console.log(backendMenuList, '传入Pinia的动态菜单数据')

      // vite的方法 通过glob批量导入文件
      const modules = import.meta.glob('../views/**/**/*.vue')
      console.log(modules, 'vite的方法 通过glob批量导入文件')

      // 接下来是对路径进行拼接
      // 拼接动态菜单数据，和vite方法得到的数据进行匹配
      const routerSet = (menuList) => {
        menuList.forEach((item) => {
          // 判断没有子菜单，拼接路由数据
          if (!item.children) {
            // 1. 构造组件路径
            const url = `../views${item.meta.path}/index.vue`
            // 2. 匹配并赋值
            // 使用构造出的 url 作为键，从 modules 对象中取出对应的异步导入函数
            // 将这个导入函数赋值给当前路由项的 component 属性 这种赋值方式 component: () => import(...)实现了路由懒加载
            // 只有当用户访问该路由时，对应的组件文件才会被下载和加载 从而优化应用的启动速度
            item.component = modules[url]
          } else {
            // 3. 递归处理子菜单
            routerSet(item.children)
          }
        })
      }

      // 上面只是写了函数体 没调用 在这调用
      routerSet(backendMenuList)

      // 最终，经过 routerSet 函数处理的 backendMenuList 数组
      // （现在每个叶子节点都有了正确的 component 属性）
      // 被赋值给 Pinia 的 state.routerList
      this.routerList = backendMenuList
      console.log(this.routerList, 'pinia中处理过添加了component的路由数据')
    },

    /**
     * 更新菜单高亮状态
     * 原 mutation: updateMenuActive
     * @param {string} data - 菜单高亮标识
     */
    updateMenuActive(data) {
      this.menuActive = data
    },
  },

  // ==================== 持久化配置 ====================
  // 替代原 vuex-persistedstate 插件
  persist: {
    key: 'pinia_menu', // 存储 key (原 Vuex_data)
    storage: localStorage, // 存储位置
    // 如果只想持久化部分 state，可以配置 paths
    // paths: ['routerList', 'selectMenu', 'menuActive', 'isCollapse']
  },
})
