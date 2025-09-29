import request from '@/utils/request'
//登录页面
//发送验证码
export const getCode = (data)=> request.post('/get/code',data)

//通过验证码注册用户
export const userRegister = (data)=> request.post('/user/authentication',data)

//登录
export const userLogin = ({userName,passWord})=> request.post('/login',{userName,passWord})

//菜单权限页面
//菜单权限数据
export const getMenuPermissionsData = ()=> request.get('/user/getmenu')

//菜单权限数据修改
export const changeMenuPermissionsData = (data)=> request.post('/user/setmenu',data)

//获取菜单权限列表 修改后可用来查看
export const getMenuPermissionsListAPI = (params)=> request.get('/menu/list',{params})


//账号管理页面
//账号管理数据
export const getAccountDataAPI = (params)=> request.get('/auth/admin',{params})

//账号管理页下拉数据
export const getAccountSelectListAPI = ()=> request.get('/menu/selectlist')

//账号管理页下拉数据修改操作
export const changeAccountSelectListAPI = (data)=> request.post('/update/user',data)



//账号菜单权限数据
export const getAccountMenuPermissionAPI = ()=> request.get('/menu/permissions')


//陪护师头像
export const getAccompanyPhotosAPI = ()=> request.get('/photo/list')
//提交陪护师数据
export const submitAccompanyDataAPI = (data)=> request.post('/companion',data)
//获取陪护师数据列表
export const getAccompanyDataListAPI = (params)=> request.get('/companion/list',{params})
//删除陪护师操作
export const deleteAccompanyDataAPI = (data)=> request.post('/delete/companion',data)