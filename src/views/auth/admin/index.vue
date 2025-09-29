<script setup>
import { getAccountDataAPI, getAccountSelectListAPI, changeAccountSelectListAPI } from '@/api'
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { useRoute } from 'vue-router'
//账号列表的分页数据 其实就一个 
const paginationData = ref({
  pageNum: 1,
  pageSize: 5
})
//渲染账号列表的数据
const tableData = ref({
  list: [],
  total: 0
})
//获取账号列表的数据 这里写了回调 执行在onMounted
const getAccountDataList = async () => {
  //拿到该页面下的账户数据 其实就是注册的那一个
  const res = await getAccountDataAPI(paginationData.value)
  console.log(res, '账户页面账号数据')
  tableData.value.list = res.data.data.list
  tableData.value.total = res.data.data.total
  //使用dayjs对账号创建时间进行一波处理 处理完再放入数组
  tableData.value.list.forEach((item) => {
    item.create_time = dayjs(item.create_time).format('YYYY-MM-DD')
  })
}


//下拉菜单数据
const seletList = ref([])
//根据当前账号权限id匹配权限名称 id为0就是超级管理员
const permissionsName = (id) => {
  const data = seletList.value.find(item => item.id === id)
  return data ? data.name : '超级管理员'
}
onMounted(async () => {
  //获取账号列表的数据
  getAccountDataList()
  //获取下拉菜单数据
  const res2 = await getAccountSelectListAPI()
  console.log(res2, '下拉菜单数据')
  seletList.value = res2.data.data
})

//分页相关
//改变当前页数
const handleCurrentChange = (data) => {
  paginationData.value.pageNum = data
  getAccountDataList()
}
//改变每页显示条目个数
const handleSizeChange = (data) => {
  paginationData.value.pageSize = data
  getAccountDataList()
}

//编辑操作
const open = (rowData) => {
  //点击后显示弹出层
  dialogVisible.value = true
  //将table中一行的数据进行合并 它会返回修改后的目标对象 回显+修改
  Object.assign(form.value, { mobile: rowData.mobile, name: rowData.name, permissions_id: rowData.permissions_id })
}
//表单实例和校验
const formRef = ref()
const rules = ref({
  name: [{ required: true, trigger: 'blur', message: '请填写昵称' }],
  permissions_id: [{ required: true, trigger: 'blur', message: '请选择菜单权限' }]
})
//表单提交
const confirm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const res = await changeAccountSelectListAPI(form.value)
      if (res.data.code === 10000) {
        ElMessage.success('修改成功！')
        handleClose() //关闭弹出层
        getAccountDataList() //刷新账号列表
      }
    } else {
      console.log('字段校验未通过，以下为未通过的信息字段', fields)
    }
  })
}

//弹出层相关
//弹出层开关变量
const dialogVisible = ref(false)
//弹出层关闭操作
const handleClose = () => {
  dialogVisible.value = false
}
//弹出层中的form表单数据
const form = ref({
  name: '',
  permissions_id: ''
})

//通过动态路由渲染panelHead中的数据
const route = useRoute()
console.log(route,'路由route中的数据')


</script>

<template>
  <panelHead :panelData = route.meta></panelHead>
  <!-- 这里隔开 渲染账号数据列表 这里的prop内容均来自账号数据-->
  <el-table :data="tableData.list" stripe style="width: 100%">
    <el-table-column label="id" prop="id" />
    <el-table-column label="昵称" prop="name" />
    <el-table-column label="所属组别" prop="permissions_id">
      <template #default="scope">
        {{ permissionsName(scope.row.permissions_id) }}
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
          <el-icon>
            <Clock />
          </el-icon>
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
    <el-pagination v-model:current-page="paginationData.pageNum" v-model:page-size="paginationData.pageSize"
                   :page-sizes="[5, 10, 15, 20]" :background="false" size="default" layout="sizes,total, prev, pager, next"
                   :total="tableData.total" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
  </div>

  <!-- 点击编辑的弹出层 -->
  <el-dialog v-model="dialogVisible" title="编辑用户" width="500" :before-close="handleClose">
    <!--配合elform表单  -->
    <el-form ref="formRef" label-width="100px" label-position="left" :model="form" :rules="rules">
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="form.mobile" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="菜单权限" prop="permissions_id">
        <!-- label显示*告诉用户“这是什么？”  value存储*告诉程序“你选中了哪个ID/数据？” -->
        <el-select v-model="form.permissions_id" placeholder="请选择菜单权限" style="width: 240px">
          <el-option v-for="item in seletList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

    </el-form>

    <!-- 弹出层底部确认和取消 -->
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
</template>

<style scoped></style>
