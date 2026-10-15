<template>
  <div class="page">
    <van-nav-bar title="指导价 / 行情" left-arrow @click-left="$router.back()" />
    <div class="hint">每日收购指导价透明公示，防止压价，助力增收</div>
    <van-cell-group inset style="margin-top:10px">
      <van-cell v-for="p in products" :key="p.product_id">
        <template #title>
          <span class="pn">{{ p.product_name }}</span>
          <van-tag plain type="success" size="mini">{{ p.category }}</van-tag>
        </template>
        <template #value><span class="pp">¥{{ p.guide_price }}/{{ p.unit }}</span></template>
      </van-cell>
    </van-cell-group>
    <div class="section">
      <div class="sec-title">价格走势</div>
      <div ref="chart" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { listProduct, listPrice } from '@/api'
const products = ref([]); const chart = ref(null); let ec = null
onMounted(async () => {
  const pr = await listProduct({ pageSize: 999 })
  products.value = pr.list
  const pv = await listPrice({ pageSize: 999 })
  await nextTick()
  ec = echarts.init(chart.value)
  const byProduct = {}
  pv.list.forEach(p => { (byProduct[p.product_id] = byProduct[p.product_id] || []).push({ date: p.price_date, price: Number(p.guide_price) }) })
  const legend = pr.list.slice(0, 5).map(p => p.product_name)
  const series = pr.list.slice(0, 5).map(p => {
    const arr = (byProduct[p.product_id] || []).sort((a, b) => (a.date < b.date ? -1 : 1))
    return { name: p.product_name, type: 'line', smooth: true, data: arr.map(x => x.price) }
  })
  const xData = [...new Set(pv.list.map(p => p.price_date))].sort()
  ec.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: legend, bottom: 0, textStyle: { fontSize: 10 } },
    grid: { left: 36, right: 16, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: xData, axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: 'value', name: '元' },
    series
  })
})
onBeforeUnmount(() => ec && ec.dispose())
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: 20px; }
.hint { text-align: center; color: #969799; font-size: 12px; padding: 8px; }
.pn { margin-right: 6px; font-weight: 600; }
.pp { color: #f56c6c; font-weight: 700; }
.section { margin: 12px 10px 0; background: #fff; border-radius: 12px; overflow: hidden; padding-bottom: 6px; }
.sec-title { font-weight: 700; padding: 12px 14px 4px; font-size: 15px; }
.chart { height: 240px; }
</style>
