<script setup>
import { getOrderListAPI,orderServiceStatusChangeAPI } from '@/api'
import { ref,onMounted } from 'vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import panelHead from '@/components/panelHead.vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
//通过动态路由渲染panelHead中的数据
const route = useRoute()
//console.log(route.meta)


//订单列表的分页数据
const paginationData = ref({
  pageNum:1,
  pageSize:10
})
//改变当前页数
const handleCurrentChange = (data)=>{
  paginationData.value.pageNum = data
  getOrderList()
}
//改变每页显示条目个数
const handleSizeChange = (data)=>{
  paginationData.value.pageSize = data
  getOrderList()
}

//订单列表的数据
const tableData = ref({
  list: [],
  total: 0
})
//渲染订单列表的函数封装 调用在onMounted
//这里搜索和获取整个订单列表同一个接口 搜索就是多了个params参数 用...拼一块儿了
const getOrderList = async (params = {}) => {
  const res = await getOrderListAPI({...paginationData.value,...params})   //又忘了.value
  console.log(res,'订单列表')
  tableData.value.list = res.data.data.list
  tableData.value.total = res.data.data.total
  //使用dayjs对账号创建时间进行一波处理 处理完再放入数组
  tableData.value.list.forEach((item) => {
    item.order_start_time = dayjs(item.order_start_time).format('YYYY-MM-DD')
  })
}
//获取订单列表
onMounted(async ()=>{
  getOrderList()
})

//订单状态处理 根据对象键名 返回对应的键值
const statusSet = (key) => {
  const orderStatus = {
    '已取消': 'info',
    '待支付': 'warning',
    '已完成': 'success'
  }
  return orderStatus[key]
}
//完成服务操作
const confirmCompleteOrderService = async (id)=>{
  const res = await orderServiceStatusChangeAPI({id})
  if(res.data.code === 10000){
    ElMessage.success('服务状态修改成功！')
    getOrderList() //刷新订单列表
  }
 
}
//订单搜索操作
const searchForm = ref({
  out_trade_no:''
})
const searchOrder = ()=>{
  //这里和渲染整个列表式同一个接口
  getOrderList(searchForm.value) 
}
</script>

<template>
  <!-- 顶部面板 -->
  <panelHead :panelData = route.meta></panelHead>

  <!-- 列表右侧搜索 -->
  <div class="form">
    <el-form
      :model="searchForm" 
      :inline="true"
    >
      <el-form-item prop="out_trade_no">
        <el-input v-model="searchForm.out_trade_no" placeholder="订单号" autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchOrder">查询</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 列表渲染 -->
  <el-table :data="tableData.list" stripe style="width: 100%" >
    <el-table-column  label="订单号" prop="out_trade_no" width="150" fixed="left"/>
    <el-table-column label="就诊医院" prop="hospital_name" />
    <el-table-column label="陪诊服务" prop="service_name" />
    <el-table-column label="陪护师">
      <template #default="scope">
        <el-avatar :src="scope.row.companion?.avatar"/>
      </template>
    </el-table-column>
    <el-table-column label="陪护师手机号" width="120" >
      <template #default="scope">
        {{ scope.row.companion?.mobile }}
      </template>
    </el-table-column>
    <el-table-column label="总价" prop="price" />
    <el-table-column label="已付" prop="paidPrice" />
    <el-table-column label="下单时间" prop="order_start_time" width="120"/>
    <el-table-column label="订单状态">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-tag :type="statusSet(scope.row.trade_state)">{{ scope.row.trade_state }}</el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="接单状态" prop="service_state" />
    <el-table-column label="联系人手机号" prop="tel" width="120"/>
    <el-table-column label="操作" width="120" fixed="right">
      <template #default="scope">
        <!-- 改变服务操作弹窗 -->
        <el-popconfirm
          v-if="scope.row.trade_state === '待服务'"
          confirm-button-text="是"
          cancel-button-text="否"
          :icon="InfoFilled"
          icon-color="#626AEF"
          title="确认完成服务？"
          @confirm="confirmCompleteOrderService(scope.row.out_trade_no)"
        >
          <template #reference>
            <el-button type="primary" link>完成服务</el-button>
          </template>
        </el-popconfirm>
        <el-button v-else type="primary" link disabled>暂无服务</el-button>
      </template>
    </el-table-column>
  </el-table> 
  <!-- 分页操作 -->
  <div class="pagination-info">
    <el-pagination
      v-model:current-page="paginationData.pageNum"
      v-model:page-size="paginationData.pageSize"
      :page-sizes="[10, 15, 20, 25]"
      :background="false"
      size="default"
      layout="sizes,total, prev, pager, next"
      :total="tableData.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>
<style scoped lang="less">
.form {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0 10px 10px;
  background-color: #fff;
}
</style>
