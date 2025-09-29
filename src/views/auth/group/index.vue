<script setup>
import { onMounted, ref,nextTick } from 'vue'
import { getMenuPermissionsData,changeMenuPermissionsData,getMenuPermissionsListAPI } from '@/api'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { Plus } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
//弹出层开关变量
const dialogVisible = ref(false)
//弹出层关闭操作
const handleClose = ()=> {
  dialogVisible.value = false
  //下面这两个操作是为了避开点了编辑再点新增会有回显的数据
  //表单方法 重置该表单项
  formRef.value.resetFields()
  //树形方法 重置选择 重置成只选权限管理下的账号管理和菜单管理
  treeRef.value.setCheckedKeys(defaultKeys)
}
//弹出层的名称和权限数据
const form = ref({
  id: '',
  name: '',
  permissions:''
})
//弹出层编辑 这里让新增按钮和编辑按钮都是open操作 默认形参空对象,对应新增按钮
//nextTick 是 Vue 3 中的一个函数，它用于等待 DOM 更新完成后再执行回调函数。
const open = (rowData = {})=>{
  //点击后显示弹出层
  dialogVisible.value = true
  //nextTick 的作用：排队等候 DOM 更新***确保操作组件实例（如调用 treeRef.value.setCheckedKeys）的代码运行在 DOM 更新之后
  //告诉 Vue：等 DOM 渲染完，再执行我的回显逻辑
  nextTick(() => {
    // 编辑操作
    if(rowData) {
      // 1. 回显基础表单数据
      // Object.assign 是一个 JavaScript 方法，用于将第二个参数（源对象）的属性复制到第一个参数（目标对象）上。
      // 它的作用是将传入的行数据中的 id 和 name 赋值给表单数据 form.value，从而让用户在弹窗中看到当前权限角色的名称。
      Object.assign(form.value, { id: rowData.id, name: rowData.name })
      // 2. 回显权限树选中状态
      // setCheckedKeys(keys) 是 el-tree 组件提供的一个方法，用于设置当前需要被选中的节点。传入rowData.permission后 el-tree 就会根据这些 ID 自动选中对应的权限菜单节点。
      treeRef.value.setCheckedKeys(rowData.permission)
    }
  })
}

//树形结构数据实例
const treeRef = ref()
//权限树形结构数据声明和操作
const treePermission = ref([])
onMounted(async ()=>{
  //返回的数据直接符合tree的要求
  const res = await getMenuPermissionsData()
  console.log(res,'权限树形结构数据')
  treePermission.value = res.data.data
  //菜单权限列表获取
  getMenuPermissionsList()
  
})
//树形结构的默认选中权限 权限管理下的账号管理和菜单管理
const defaultKeys = [4,5]



//菜单权限列表的分页数据
const paginationData = ref({
  pageNum:1,
  pageSize:10
})
//渲染权限列表的数据
const tableData = ref({
  list: [],
  total: 0
})
//渲染权限列表的函数封装 调用在onMounted
const getMenuPermissionsList = async () => {
  const res = await getMenuPermissionsListAPI(paginationData.value)   //又忘了.value
  console.log(res,'菜单权限列表')
  tableData.value.list = res.data.data.list
  tableData.value.total = res.data.data.total
}


//表单实例和校验
const formRef = ref()
const rules = ref({
  name: [{ required: true, trigger: 'blur', message: '请输入权限名称' }],
})
//表单提交
const confirm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      //获取tree中的选中信息 getCheckedKeys()是tree的方法，得到一个数组。由于后端要求string 所以需要转一下
      //数据全了之后发送请求修改权限
      const permissions = JSON.stringify(treeRef.value.getCheckedKeys())
      const res = await changeMenuPermissionsData({name:form.value.name,id:form.value.id,permissions})
      console.log(res)
      if(res.data.code === 10000){
        ElMessage.success('权限添加成功！')
        handleClose() //关闭弹出层
        getMenuPermissionsList() //刷新渲染权限列表
      }
     
    } else {
      console.log('字段校验未通过，以下为未通过的信息字段', fields)
    }
  })
}
//改变当前页数
const handleCurrentChange = (data)=>{
  paginationData.value.pageNum = data
  getMenuPermissionsList()
}
//改变每页显示条目个数
const handleSizeChange = (data)=>{
  paginationData.value.pageSize = data
  getMenuPermissionsList()
}

//通过动态路由渲染panelHead中的数据
const route = useRoute()
console.log(route,'路由route中的数据')
</script>

<template>
  <panelHead :panelData = route.meta></panelHead>
  <!-- button配合下面的dialog弹出框一起用 -->
  <div class="btns">
    <el-button @click="open(null)" type="primary" size="default" :icon="Plus">
      新增
    </el-button>
  </div>
  <!-- 这里隔开 渲染权限列表 这里的prop内容均来自权限列表数据-->
  <el-table :data="tableData.list" stripe style="width: 100%" >
    <el-table-column label="id" prop="id" />
    <el-table-column label="昵称" prop="name" />
    <el-table-column label="菜单权限" prop="permissionName" width="500px"  />
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
  <!-- 以下是弹出层 -->
  <el-dialog
    v-model="dialogVisible"
    title="添加权限"
    width="500"
    :before-close="handleClose"
  >
    <!--配合elform表单  -->
    <el-form
      ref="formRef"  
      label-width="100px"
      label-position="left"
      :model="form"
      :rules="rules"
    >
      <el-form-item v-show="false" prop="id">
        <el-input v-model="form.id" placeholder="请输入id"/>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请填写权限名称" />
      </el-form-item>
      <el-tree 
        ref="treeRef"
        :data = "treePermission"
        style="max-width: 600px"
        node-key="id"
        show-checkbox
        :default-checked-keys="defaultKeys"
        :default-expanded-keys="[2]"
      >
      </el-tree>
    </el-form>
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

<style scoped lang="less">
.btns {
  padding: 10px 0 10px 10px;
  background-color: #fff;
}
</style>
