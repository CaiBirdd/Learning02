<script setup>
import { onMounted, ref,nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { Plus,InfoFilled,Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getAccompanyPhotosAPI,submitAccompanyDataAPI,getAccompanyDataListAPI,deleteAccompanyDataAPI } from '@/api'
import { useRoute } from 'vue-router'
//弹出层开关变量
const dialogVisible = ref(false)
//弹出层关闭操作
const handleClose = ()=> {
  dialogVisible.value = false
  //表单方法 重置该表单项
  formRef.value.resetFields()
}
//弹出层的form数据和校验
const form = ref({
  id:'',
  mobile:'',
  active: 1,
  age: 28,
  avatar: '',
  name:'',
  sex: ''
})
//弹出层打开操作 这里还是新增和编辑都复用这一个
const open = (rowData = {})=>{
  //点击后显示弹出层 
  dialogVisible.value = true
  nextTick(() => {
    // 如果有数据，那就是编辑，回显数据
    if(rowData) {
      Object.assign(form.value, rowData)
    }
  })
}


//账户也就是手机号的校验
const validateMobile = (rule, value, callback) => {
  // 不能为空
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else {
    const reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    reg.test(value) ? callback() : callback(new Error('手机号格式不对,请输入正确手机号'))
  }
}
const rules = ref({
  name: [{ required: true, trigger: 'blur', message: '请填写昵称' }],
  avatar:[{ required: true, message: '请选择头像'}],
  sex:[{ required: true, trigger: 'change', message: '请选择性别'}],
  mobile: [{ required: true, validator: validateMobile, trigger: 'blur' }]
})

//表单实例和校验
const formRef = ref()
//表单提交
const confirm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      //发送请求提交数据
      const res = await submitAccompanyDataAPI(form.value)
      if(res.data.code === 10000){
        ElMessage.success('陪护师添加成功！')
        handleClose() //关闭弹出层
        getAccompanyDataList() //刷新陪护师列表
      }
    } else {
      console.log('字段校验未通过，以下为未通过的信息字段', fields)
    }
  })
}


// 选择图片的弹窗
const dialogImgVisible = ref(false)
//图片弹出层关闭操作
const handleImgClose = ()=> {
  dialogImgVisible.value = false
}
//陪护师头像
const photosList  = ref([])
//获取陪护师头像
onMounted(async ()=>{
  const res = await getAccompanyPhotosAPI()
  photosList.value = res.data.data
  //陪护师列表函数调用
  getAccompanyDataList()
})
//点击选中的陪护师图片
const selectPhotoIndex = ref(0)
//图片选择完的提交操作 形成选完图片回显
//selectPhotoIndex在下面点击后被赋值，也就是图片下标，将其放在photosList，就能找到，最后.url拿到图片地址
const confirmImge = ()=>{
  form.value.avatar = photosList.value[selectPhotoIndex.value].url
  handleImgClose() //关闭选择头像弹窗
}


//陪护师列表的分页数据
const paginationData = ref({
  pageNum:1,
  pageSize:5
})
//陪护师列表的数据
const tableData = ref({
  list: [],
  total: 0
})
//渲染陪护师列表的函数封装 调用在onMounted
const getAccompanyDataList = async () => {
  const res = await getAccompanyDataListAPI(paginationData.value)   //又忘了.value
  console.log(res,'陪护师列表')
  tableData.value.list = res.data.data.list
  tableData.value.total = res.data.data.total
  //使用dayjs对账号创建时间进行一波处理 处理完再放入数组
  tableData.value.list.forEach((item) => {
    item.create_time = dayjs(item.create_time).format('YYYY-MM-DD')
  })
}
//改变当前页数
const handleCurrentChange = (data)=>{
  paginationData.value.pageNum = data
  getAccompanyDataList()
}
//改变每页显示条目个数
const handleSizeChange = (data)=>{
  paginationData.value.pageSize = data
  getAccompanyDataList()
}

//table选中数据和操作
const selectTableData = ref([])
const handleSelectionChange = (data)=>{
  //将选中的数据的id传入即可 因为后面发请求只需要id 这里和接口文档对不上 不用纠结
  selectTableData.value = data.map((item)=> ({id:item.id}))
  console.log(selectTableData.value)
  
}
//删除陪护师操作
const confirmDeleteEvent = async ()=>{
  if(!selectTableData.value.length){
    return ElMessage.warning('请至少勾选一项数据！')
  }
  const res = await deleteAccompanyDataAPI({id:selectTableData.value})
  if(res.data.code === 10000){
    ElMessage.success('陪护师删除成功！')
    handleClose() //关闭弹出层
    getAccompanyDataList() //刷新陪护师列表
  }
}

//通过动态路由渲染panelHead中的数据
const route = useRoute()
</script>
<template>
  <!-- 顶部面板 -->
  <panelHead :panelData = route.meta></panelHead>
  <!-- button配合下面的dialog弹出框一起用 -->
  <div class="btns">
    <el-button @click="open(null)" type="primary" size="default" :icon="Plus">
      新增
    </el-button>

    <!-- 删除操作按钮 -->
    <el-popconfirm
      confirm-button-text="是"
      cancel-button-text="否"
      :icon="InfoFilled"
      icon-color="#626AEF"
      title="是否确认删除？"
      @confirm="confirmDeleteEvent"
    >
      <template #reference>
        <el-button type="danger" size="default" :icon="Delete">删除</el-button>
      </template>
    </el-popconfirm>
  </div>

  

  <!-- 这里隔开 渲染陪护师列表 这里的prop内容均来自陪护师列表数据-->
  <el-table :data="tableData.list" stripe style="width: 100%" @selection-change="handleSelectionChange">
    <!-- 这里是最前面的勾选框 配合@selection-change="handleSelectionChange" -->
    <el-table-column type="selection" width="55" />
    <el-table-column label="id" prop="id" />
    <el-table-column label="昵称" prop="name" />
    <el-table-column label="头像">
      <template #default="scope"> 
        <el-image :src="scope.row.avatar"  style="width: 50px; height: 50px"/>
      </template>
    </el-table-column>
    <el-table-column label="性别">
      <template #default="scope">
        {{ scope.row.sex === '1' ? '男' : '女' }}
      </template>
    </el-table-column>
    <el-table-column label="手机号" prop="mobile" />
    <el-table-column label="状态" prop="active">
      <template #default="scope">
        <el-tag :type="scope.row.active ? 'success' : 'danger'">{{ scope.row.active ? '正常' : '失效' }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" prop="create_time">
      <template #default="scope">
        <div style="display: flex; align-items: center;">
          <el-icon><Clock /></el-icon>
          <span style="margin-left: 5px">{{ scope.row.create_time }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <!-- 通过插槽拿到当前行的数据 通过open方法传入当前行的数据-->
      <template #default="scope"> 
        <el-button type="primary" @click="open(scope.row)">编辑</el-button>
      </template>
    </el-table-column>

  </el-table>
  <!-- 这里是分页 -->
  <div class="pagination-info">
    <el-pagination
      v-model:current-page="paginationData.pageNum"
      v-model:page-size="paginationData.pageSize"
      :page-sizes="[5, 10, 15, 20]"
      :background="false"
      size="default"
      layout="sizes,total, prev, pager, next"
      :total="tableData.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>

  <!-- 以下是新增陪护师的弹出层 -->
  <el-dialog
    v-model="dialogVisible"
    title="陪护师添加"
    width="500"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"  
      label-width="100px"
      label-position="left"
      :model="form"
      :rules="rules"
    >
      <el-form-item v-show="false" prop="id">
        <el-input v-model="form.id" placeholder="请输入昵称"/>
      </el-form-item>
      <el-form-item label="昵称" prop="name">
        <el-input  v-model="form.name" placeholder="请输入昵称"/>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-button v-if="!form.avatar" type="primary" @click="dialogImgVisible=true">点击上传</el-button>
        <!-- 图片点击能编辑，所以加@click="dialogImgVisible=true" -->
        <el-image
          v-else
          style="width: 100px; height: 100px"
          :src="form.avatar"
          @click="dialogImgVisible=true"
        />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="form.sex" placeholder="请选择性别">
          <el-option label='男' value="1"></el-option>
          <el-option label='女' value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="18" :max="50" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="是否生效" prop="active">
        <el-radio-group v-model="form.active">
          <el-radio :value="0">失效</el-radio>
          <el-radio :value="1">生效</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <!-- 确认的时候传入整个表单数据验证-->
        <el-button type="primary" @click="confirm(formRef)">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 选择图片的弹窗dialog -->
  <el-dialog
    v-model="dialogImgVisible"
    title="图片选择"
    width="680"
    :before-close="handleImgClose"
  >
    <div class="image-list">
      <div v-for="(item, index) in photosList" :key="item.name" class="img-box" @click="selectPhotoIndex = index">
        <div v-if="selectPhotoIndex === index" class="select">
          <el-icon color="#fff"><Check /></el-icon>
        </div>
        <el-image style="width: 148px; height:148px" :src="item.url"
        />
      </div>
    </div>
    <!-- 选择图片的底部确认按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogImgVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImge">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="less">
.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
.image-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .img-box {
    position: relative;
    .select {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 24px;
      height: 24px;
      background-color: #67c23a;
      z-index: 999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .el-image {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
