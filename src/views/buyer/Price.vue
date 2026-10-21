<template>
  <div>
    <el-select v-model="pid" placeholder="选择产品" style="width:220px" @change="load">
      <el-option v-for="p in products" :key="p.product_id" :label="p.product_name" :value="p.product_id" />
    </el-select>
    <el-card v-if="prices.length" style="margin-top:14px">
      <template #header><b>指导价走势（近 30 天）</b></template>
      <div ref="chartRef" style="height:320px"></div>
    </el-card>
    <el-empty v-else description="请选择产品查看行情" />
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { listProduct, priceTrend } from '@/api'
const pid = ref(null)
const products = ref([])
const prices = ref([])
const chartRef = ref(null); let chart = null
async function load() {
  if (!pid.value) return
  prices.value = await priceTrend(pid.value)
  await nextTick()
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: prices.value.map(p => p.date) },
    yAxis: { type: 'value', name: '指导价 ¥' },
    series: [{ type: 'line', smooth: true, data: prices.value.map(p => p.price), areaStyle: { opacity: .18 }, itemStyle: { color: '#0a543a' } }]
  })
}
onMounted(async () => {
  const r = await listProduct({ pageSize: 999 })
  products.value = r.list
  if (products.value.length) { pid.value = products.value[0].product_id; load() }
})
watch(pid, load)
</script>
