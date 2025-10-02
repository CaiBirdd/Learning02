<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useRoute } from 'vue-router'
import { getDashboardDataAPI } from '@/api' 
import panelHead from '@/components/panelHead.vue' 

// --- 统一数据存储 ---
// 存储 API 返回的原始 data.data 部分
const dashboardData = ref(null) 

// --- 状态定义 ---
// 声明 user/types/typeList 只需要 ref()，赋值在 fetchDashboardData 中完成
const user = ref({ 
  user_img: '',
  user_name: '', 
  permission: '', 
  ip: '' 
})
const types = ref([])
const typeList = ref([])

const echartRef = ref()

const imgs = ['dzf.png', 'dfw.png', 'ywc.png', 'yqx.png']
const color = ['#F05050', '#7266BA', '#23B7E5', '#27C24C']

// --- 核心逻辑函数 ---

/**
 * @description: 获取仪表盘数据并处理
 */
const fetchDashboardData = async () => {
  try {
    const res = await getDashboardDataAPI()
    
    // 1. 赋值统一数据：最精简的操作
    dashboardData.value = res?.data?.data ?? null 

    // 2. 使用统一的响应式数据进行校验和处理
    if (dashboardData.value) {
      
      // 2.1 简洁赋值用户信息：直接将对象赋给 user.value
      user.value = dashboardData.value.user ?? {}

      // 2.2 处理订单类型统计数据 (types)
      const rawTypes = dashboardData.value.types
      if (Array.isArray(rawTypes)) {
        types.value = rawTypes.map((item, index) => ({
          state: item.state, 
          num: item.num,
          img: imgs[index % imgs.length],
          bgColor: color[index % color.length], 
        }))
      }

      // 2.3 处理订单图表数据 (typeList) 并进行类型转换
      const rawTypeList = dashboardData.value.typeList
      
      if (Array.isArray(rawTypeList)) {
        typeList.value = rawTypeList.map(item => ({
          ...item,
          // 确保 order_money 是数字类型
          order_money: parseFloat(item.order_money) || 0 
        }))
      }


      // 数据准备完成后，初始化 ECharts
      if (typeList.value.length > 0) {
        initEchart()
      }
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  }
}


/**
 * @description: ECharts 初始化
 */
const initEchart = () => {
  if (!echartRef.value) return 

  // 提取图表所需数据
  const dates = typeList.value.map((item) => item.date)
  const orderSums = typeList.value.map((item) => item.order_sum)

  const options = {
    grid: { left: 40, bottom: 20, right: 40, top: 30, containLabel: true },
    color: ['#67CEBC'],
    
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: function (params) {
        const dataIndex = params[0].dataIndex
        const dataItem = typeList.value[dataIndex]
        if (!dataItem) return ''
        
        // order_money 已确保为数字
        return `
          日期: ${dataItem.date}<br />
          ${params[0].seriesName}: ${dataItem.order_sum}<br />
          总金额: ${dataItem.order_money.toFixed(2)}
        `
      },
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: true, lineStyle: { width: 2, color: '#999' } },
      boundaryGap: false,
      axisLabel: { color: '#999' },
      splitLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '订单数',
      axisLabel: { color: '#999' },
      axisLine: { show: true, lineStyle: { color: '#999' } },
      splitLine: { show: true, lineStyle: { type: 'dashed', color: '#eee' } },
    },
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true, 
        data: orderSums,
        symbolSize: 8,
        areaStyle: { opacity: 0.1 }
      },
    ],
  }

  const myChart = echarts.init(echartRef.value)
  myChart.setOption(options)

  const observer = new ResizeObserver(() => {
    myChart.resize()
  })
  observer.observe(echartRef.value)
}

// --- 生命周期 ---
onMounted(() => {
  fetchDashboardData()
})

const route = useRoute()
</script>

<template>
  <panelHead :panelData="route.meta"></panelHead>
  <div class="control-container">
    <div class="card">
      <div class="user">
        <el-card class="user-card">
          <template #header>
            <div class="card-header">
              <el-image :src="user.user_img" fit="cover" />
              <span>{{ user.user_name }}</span>
            </div>
          </template>
          <div class="user-info">
            <div>当前权限：<span class="info-value">{{ user.permission }}</span></div>
            <div>登录IP:<span class="info-value">{{ user.ip }}</span></div>
          </div>
        </el-card>
      </div>

      <el-card class="serive-list">
        <div class="serive-item" v-for="(item, index) in types" :key="index">
          <div class="img-box" :style="{ 'background-color': item.bgColor }">
            <img :src="item.img" :alt="item.state" />
          </div>
          <div class="text">
            <div class="num">{{ item.num }}</div>
            <div class="name">{{ item.state }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="content">
      <el-card header="每日订单量统计" class="chart-card">
        <div class="echart" ref="echartRef"></div>
      </el-card>
    </div>
  </div>
</template>

<style lang="less" scoped>
// 样式保持不变
.control-container {
  padding: 10px;
}
.card {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.user {
  flex: 0 0 45%;
  .user-card {
    height: 100%;
    .card-header {
      display: flex;
      align-items: center;
      .el-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin-right: 20px;
      }
      span {
        font-size: 28px;
        font-weight: bold;
      }
    }
    .user-info {
      color: #666;
      line-height: 30px;
      .info-value {
        font-weight: bold;
        color: #333;
      }
    }
  }
}
.serive-list {
  flex: 1;
  height: 269px; 
  :deep(.el-card__body) {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    height: 100%;

    .serive-item {
      width: 45%;
      display: flex;
      align-items: center;
      padding: 10px;

      .img-box {
        width: 70px;
        height: 70px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 15px;
        border-radius: 5px;
        img {
          width: 50px;
          height: 50px;
        }
      }

      .num {
        font-size: 28px;
        line-height: 1.2;
        font-weight: bold;
        color: #333;
      }
      .name {
        font-size: 16px;
        color: #666;
      }
    }
  }
}
.content {
  margin-top: 20px;
  .chart-card {
    .echart {
      height: 400px;
    }
  }
}
</style>