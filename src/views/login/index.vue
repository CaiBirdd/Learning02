<script setup>
import { ref,computed,toRaw } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { UserFilled, Lock } from '@element-plus/icons-vue' //引用图标
import { getCode,userRegister,userLogin,getAccountMenuPermissionAPI } from '@/api'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
const router  = useRouter()
const imgUrl = new URL('../../../public/login-head.png', import.meta.url).href
// 切换表单 0是登录页 1是注册页
const formType = ref(0)
const handleChange = () => {
  formType.value = formType.value ? 0 : 1
}
//登录和注册信息
const loginForm = ref({
  userName: '',
  passWord: '',
  validCode: ''
})
//点击获取验证码操作
const countdown = ref({
  validText:'获取验证码',
  time:60
})
const flag = ref(false)
const countdownChange = async ()=> {
  // 手机号正则校验
  const phoneReg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
  // 判断手机号是否正确 不正确 return阻止获取验证码了
  if (!loginForm.value.userName || !phoneReg.test(loginForm.value.userName)) {
    return ElMessage({
      message: '请检查手机号是否正确',
      type: 'warning',
    })

  }
  //防止重复点击 防抖/节流锁 一开始是false 不退出啊！！
  if(flag.value) return 
  //倒计时 
  // 新增**手动执行第一次更新，立即改变状态
  countdown.value.time -= 1 // 立即减 1 (变成 59)
  countdown.value.validText = `剩余${countdown.value.time}s` // 立即显示 “剩余59s” 计时器接下来再接管
  let timer = setInterval(()=>{
    if(countdown.value.time <= 0){
      //倒计时到头了 重置倒计时
      countdown.value.validText = '获取验证码'
      countdown.value.time = 60
      flag.value = false //释放锁定，允许再次点击
      clearInterval(timer)
    }else{
      countdown.value.time--
      countdown.value.validText = `剩余${countdown.value.time}s`
    }
  },1000)
  flag.value = true
  //获取验证码操作
  const res = await getCode({tel:loginForm.value.userName})
  console.log(res)
  if(res.data.code === 10000){
    ElMessage.success('发送成功')
  }
}

//表单提交时的校验规则 注意函数要先声明再调用
//账户也就是手机号的校验
const validateUser = (rule, value, callback) => {
  // 不能为空
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else {
    const reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    reg.test(value) ? callback() : callback(new Error('手机号格式不对,请输入正确手机号'))
  }
}
// 密码校验规则
const validatePass = (rule, value, callback) => {
  // 不能为空
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    const reg = /^[a-zA-Z0-9_-]{4,16}$/
    reg.test(value) ? callback() : callback(new Error('密码格式不对,需要4到16位字母/数字/下划线/减号'))
  }
}
const rules = ref({
  userName: [{ validator: validateUser, trigger: 'blur' }],
  passWord: [{ validator: validatePass, trigger: 'blur' }],
})

//登录和注册操作
const store = useStore()
const loginFormRef = ref()
//首先进行表单校验 这块主体都是取自elementplus
//传入的 formEl 就是 loginFormRef.value，也就是整个 <el-form> 组件实例
//valid	校验结果，布尔值     fields是未通过的字段信息
const submitForm = async(formEl)=>{
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('字段校验通过')
      if(formType.value){
        const res = await userRegister(loginForm.value)     //注意这里别忘了加value 
        console.log(res)
        if(res.data.code === 10000){
          ElMessage.success('注册成功，请登录！')
          formType.value = 0  //跳转登录页
        }
      }else{
        const res  = await userLogin(loginForm.value)       //注意这里别忘了加value 
        console.log(res)
        if(res.data.code === 10000){
          ElMessage.success('登录成功！')
          // 登陆成功后将token放入本地缓存 
          // 用户信息是对象 转成字符串存入
          localStorage.setItem('pz_token', res.data.data.token)
          localStorage.setItem('pz_userInfo', JSON.stringify(res.data.data.userInfo))
          //获取当前登录账户的菜单权限信息
          const res2 = await getAccountMenuPermissionAPI()
          console.log(res2,'当前登录账户的菜单权限信息')
          store.commit('DynamicMenuRender',res2.data.data)
          console.log(routerList.value,'处理好后的动态路由信息')
          //处理好的动态路由信息正式添加到 Vue Router 实例中
          //toRaw响应式数据转化为原始对象 遍历，通过router自带的addRoute方法，这是 Vue Router 4 的核心方法之一，用于在应用运行时动态添加一条新路由。
          toRaw(routerList.value).forEach(item => {
            router.addRoute('main', item)         //'main': 这是 addRoute 方法的第一个参数，表示新路由的父路由的名称。
          })
          //做完以上 调到首页
          router.push('/')
        }
      }
    } else {
      console.log('字段校验未通过，以下为未通过的信息字段', fields)
    }
  })
}
//处理好后的动态路由信息
const routerList = computed(() => store.state.menu.routerList)


</script>

<template>
  <!-- 外层用的elementplus的row布局 属于layout -->
  <el-row class="login-container" justify="center" :align="'middle'">
    <el-card style="max-width: 480px">
      <template #header>
        <div class="card-header">
          <img :src="imgUrl"/>
        </div>
      </template>

      <!-- 登录和注册的切换 -->
      <div class="jump-link">
        <el-link @click="handleChange" type="primary" underline>{{formType ? '返回登录' : '注册账号'}}</el-link>
      </div>
      <!-- 登录和注册栏 ref拿到整个表单组件进行校验-->
      <el-form 
        :model="loginForm" 
        label-width="auto" 
        style="max-width: 600px" 
        :rules="rules"
        ref="loginFormRef"
      >
        <el-form-item prop="userName">
          <el-input v-model="loginForm.userName" :prefix-icon="UserFilled" placeholder="手机号" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="passWord">
          <el-input v-model="loginForm.passWord" :prefix-icon="Lock" type="passWord" placeholder="密码" autocomplete="off" />
        </el-form-item>
        <!-- 验证码 v-if 只有注册时才显示 通过elementplus复合型输入框插槽实现验证码点击模块-->
        <el-form-item v-if="formType" prop="validCode">
          <el-input v-model="loginForm.validCode" :prefix-icon="Lock" placeholder="验证码" autocomplete="off">
            <template #append>
              <span @click="countdownChange">{{ countdown.validText }}</span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button :style="{width: '100%'}" type="primary" @click="submitForm(loginFormRef)">
            {{formType ? '注册账号' : '登录'}}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-row>

</template>

<style lang="less" scoped>
// 这行代码使用了:deep() (Vue SFC 样式穿透语法) 来移除 Element Plus 卡片头部默认的内边距。这是为了让图片能够紧贴卡片边缘。
:deep(.el-card__header) {
    padding: 0
  }
  .login-container {
    height: 100%;
    .card-header{
      background-color: #899fe1;
      img {
        width: 430px;
      }
    }
    .jump-link {
      text-align: right;
      margin-bottom: 10px;
    }
  }
  
</style>

