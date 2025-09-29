//这里是先取一波本地数据
const loaclData = localStorage.getItem('Vuex_data')
//这里进行一波判断 如果本地数据有 就用，没有就用空的
const state = loaclData ? loaclData.menu : {
  isCollapse: false, //侧边菜单栏的展开收齐状态
  selectMenu: [],  //点击左侧菜单栏 Header部分显示的tab标签 最后在navHeader组件部分显示 这里面存的是item.meta中的数据 每个item.meta是一个对象 这个是数组包对象
  routerList:[],    //动态路由
  menuActive:'1-1'    //菜单高亮
}
const mutations = {
  //控制侧边菜单栏的展开收齐
  collapseMenu(state) {
    state.isCollapse = !state.isCollapse
  },
  //控制点击左侧菜单，header部分tab显示
  //state默认传入 data是传入的点击的菜单信息
  addMenu(state, data) {
    //findIndex方法去重，没找到的情况下，将内容添加到tab
    if (state.selectMenu.findIndex(item => item.path === data.path) === -1) {
      state.selectMenu.push(data)
    }
  },
  //关闭按钮实现关闭tab操作 遍历数组包对象中的每一个对象 data是传递过来的 对象
  closeMenu(state, data) {
    const index = state.selectMenu.findIndex(item => item.name === data.name)
    state.selectMenu.splice(index, 1)
  },
  //动态菜单渲染
  //这段代码的主要目的是将从后端获取的动态菜单数据（data）转换成 Vue Router 能够识别和使用的路由配置对象数组，并存储到 Vuex 的 state.routerList 中
  //vie得到的数据解析如下：
  //Key (键)：是组件文件的相对路径
  //Value (值)：是一个异步导入函数（一个返回 Promise 的箭头函数），例如 () => import('/src/views/auth/admin/index.vue')。
  DynamicMenuRender(state,data){
    console.log(data,'传入vuex的动态菜单数据')
    //vite的方法 通过glob批量导入文件
    const modules = import.meta.glob('../views/**/**/*.vue')
    console.log(modules,'vite的方法 通过glob批量导入文件')
    //接下来是对路径进行拼接 拼接动态菜单数据，和vite方法得到的数据进行匹配
    function routerSet(data) {
      data.forEach(item => {
        // 判断没有子菜单，拼接路由数据
        if (!item.children) {
          const url = `../views${item.meta.path}/index.vue` // 1. 构造组件路径
          item.component = modules[url]                    // 2. 匹配并赋值 使用构造出的 url 作为键，从 modules 对象中取出对应的异步导入函数。 将这个导入函数赋值给当前路由项的 component 属性 ***重要性： 这种赋值方式（component: () => import(...)）实现了 路由懒加载（Lazy Loading）。只有当用户访问该路由时，对应的组件文件才会被下载和加载，从而优化应用的启动速度。
        } else {
          routerSet(item.children)                         // 3. 递归处理子菜单
        }
      })
    }
    routerSet(data) //上面只是写了函数体 没调用 在这调用
    state.routerList = data      //最终，经过 routerSet 函数处理的 data 数组（现在每个叶子节点都有了正确的 component 属性）被赋值给 Vuex 的 state.routerList。
    
  },
  updateMenuActive(state, data) {
    state.menuActive = data
  },
}

export default {
  state,
  mutations,
}