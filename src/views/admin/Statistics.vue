<template>
  <div class="page-wrap">
    <div class="toolbar">
      <span class="title">统计分析报表</span>
      <el-tag size="small" :type="roleTag" effect="plain">{{ roleLabel }}视角</el-tag>
      <el-button type="primary" :loading="loading" @click="load" style="margin-left:auto">刷新</el-button>
    </div>
    <el-alert v-if="role==='ADMIN'" type="info" :closable="false" show-icon class="mb">
      收购点管理员视角：仅展示收购、农户收益与库存相关数据，不显示销售渠道数据。
    </el-alert>
    <el-alert v-else-if="role==='SALES'" type="info" :closable="false" show-icon class="mb">
      销售管理员视角：仅展示销售、渠道与库存相关数据，不显示收购与农户收益数据。
    </el-alert>

    <el-row :gutter="16" class="mb">
      <el-col v-for="(k, i) in visibleKpis" :key="i" :xs="24" :sm="8">
        <div class="kpi">
          <div class="kpi-lbl">{{ k.lbl }}</div>
          <div class="kpi-val" :class="k.color">¥{{ k.value }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col v-if="showChart.byCategory" :xs="24" :md="12">
        <div class="table-card"><div class="sub-title">各品类收购量占比</div><div ref="c1" class="chart"></div></div>
      </el-col>
      <el-col v-if="showChart.monthly" :xs="24" :md="12">
        <div class="table-card"><div class="sub-title">{{ monthlyTitle }}</div><div ref="c2" class="chart"></div></div>
      </el-col>
    </el-row>
    <el-row :gutter="16" class="mt">
      <el-col v-if="showChart.rankList" :xs="24" :md="12">
        <div class="table-card"><div class="sub-title">农户收益排行</div><div ref="c3" class="chart"></div></div>
      </el-col>
      <el-col v-if="showChart.channelSale" :xs="24" :md="12">
        <div class="table-card"><div class="sub-title">渠道销售额分布</div><div ref="c4" class="chart"></div></div>
      </el-col>
    </el-row>
    <el-row v-if="showChart.stock" :gutter="16" class="mt">
      <el-col :xs="24"><div class="table-card"><div class="sub-title">库存分布(按品类) - 库存周转分析</div><div ref="c5" class="chart-wide"></div></div></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getStatistics, getDashboard } from '@/api'
import { useAuthStore } from '@/store/auth'
const auth = useAuthStore()
const role = computed(() => auth.user?.role || 'SYS')
const roleLabel = computed(() => ({ SYS: '系统管理员', ADMIN: '收购点管理员', SALES: '销售管理员' }[role.value]))
const roleTag = computed(() => ({ SYS: 'danger', ADMIN: 'success', SALES: 'warning' }[role.value]))

const loading = ref(false)
const c1 = ref(), c2 = ref(), c3 = ref(), c4 = ref(), c5 = ref()
const kpi = ref({ purchaseAmt: '0.00', saleAmt: '0.00', profit: '0.00', farmerCount: 0, purchaseCount: 0, saleCount: 0, unpaidSaleAmt: '0.00' })
const stat = ref({})
let charts = []
const green = '#2da64a'

// 角色可见图表配置
const showChart = computed(() => ({
  byCategory: ['SYS', 'ADMIN'].includes(role.value),
  monthly: true,
  rankList: ['SYS', 'ADMIN'].includes(role.value),
  channelSale: ['SYS', 'SALES'].includes(role.value),
  stock: true
}))
// 月度图标题按角色
const monthlyTitle = computed(() => {
  if (role.value === 'ADMIN') return '月度收购金额'
  if (role.value === 'SALES') return '月度销售金额'
  return '月度收购/销售金额'
})
// KPI按角色显示
const visibleKpis = computed(() => {
  const k = kpi.value
  if (role.value === 'ADMIN') {
    return [
      { lbl: '收购总金额', value: k.purchaseAmt, color: 'green' },
      { lbl: '收购单数', value: k.purchaseCount, color: 'blue' },
      { lbl: '认证农户数', value: k.farmerCount, color: 'red' }
    ]
  }
  if (role.value === 'SALES') {
    return [
      { lbl: '销售总金额', value: k.saleAmt, color: 'blue' },
      { lbl: '销售订单数', value: k.saleCount, color: 'green' },
      { lbl: '应收款(未收款)', value: k.unpaidSaleAmt, color: 'red' }
    ]
  }
  // SYS
  return [
    { lbl: '收购总金额', value: k.purchaseAmt, color: 'green' },
    { lbl: '销售总金额', value: k.saleAmt, color: 'blue' },
    { lbl: '毛利(销-收)', value: k.profit, color: 'red' }
  ]
})

async function load() {
  loading.value = true
  const [s, d] = await Promise.all([getStatistics(), getDashboard()])
  stat.value = s
  const p = Number(d.purchaseAmt), sa = Number(d.saleAmt)
  kpi.value = {
    purchaseAmt: p.toFixed(2),
    saleAmt: sa.toFixed(2),
    profit: (sa - p).toFixed(2),
    farmerCount: d.farmerCount,
    purchaseCount: d.purchaseCount,
    saleCount: d.saleCount,
    unpaidSaleAmt: s.unpaidSaleAmt
  }
  await nextTick()
  charts.forEach(c => c && c.dispose()); charts = []
  const s2 = stat.value
  // 图1 品类收购量
  if (showChart.value.byCategory && c1.value) {
    const ch = echarts.init(c1.value)
    ch.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0 },
      color: ['#2da64a', '#409eff', '#e6a23c', '#f56c6c', '#9254de'],
      series: [{ type: 'pie', radius: ['40%', '65%'], data: s2.byCategory, label: { formatter: '{b}\n{c}' } }]
    })
    charts.push(ch)
  }
  // 图2 月度（按角色过滤系列）
  if (c2.value) {
    const ch = echarts.init(c2.value)
    const isSys = role.value === 'SYS'
    const isSales = role.value === 'SALES'
    const legendData = isSys ? ['收购', '销售'] : (isSales ? ['销售'] : ['收购'])
    const series = []
    if (!isSales) series.push({ name: '收购', type: 'bar', data: s2.monthly.map(m => m.purchase), itemStyle: { color: '#409eff' } })
    if (isSys || isSales) series.push({ name: '销售', type: 'bar', data: s2.monthly.map(m => m.sale), itemStyle: { color: green } })
    ch.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: legendData, top: 0 },
      grid: { left: 50, right: 20, top: 40, bottom: 30 },
      xAxis: { type: 'category', data: s2.monthly.map(m => m.month) },
      yAxis: { type: 'value', name: '元' },
      series
    })
    charts.push(ch)
  }
  // 图3 农户收益排行
  if (showChart.value.rankList && c3.value) {
    const ch = echarts.init(c3.value)
    ch.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 70, right: 20, top: 20, bottom: 20 },
      xAxis: { type: 'value', name: '元' },
      yAxis: { type: 'category', data: s2.rankList.map(r => r.farmer_name).reverse() },
      series: [{ type: 'bar', data: s2.rankList.map(r => r.amount).reverse(), itemStyle: { color: green }, label: { show: true, position: 'right' } }]
    })
    charts.push(ch)
  }
  // 图4 渠道销售
  if (showChart.value.channelSale && c4.value) {
    const ch = echarts.init(c4.value)
    ch.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      color: ['#2da64a', '#e6a23c', '#409eff', '#f56c6c', '#9254de'],
      series: [{ type: 'pie', radius: '62%', data: s2.channelSale, label: { formatter: '{b}\n¥{c}' } }]
    })
    charts.push(ch)
  }
  // 图5 库存品类
  if (showChart.value.stock && c5.value) {
    const ch = echarts.init(c5.value)
    ch.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: s2.stockByCategory.map(x => x.name) },
      yAxis: { type: 'value', name: '数量' },
      series: [{ type: 'bar', data: s2.stockByCategory.map(x => x.value), itemStyle: { color: '#5bb97a' }, label: { show: true, position: 'top' }, barWidth: '40%' }]
    })
    charts.push(ch)
  }
  loading.value = false
}
const onResize = () => charts.forEach(c => c && c.resize())
onMounted(async () => { await nextTick(); load(); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); charts.forEach(c => c && c.dispose()) })
</script>

<style scoped>
.kpi { background: #fff; border-radius: 8px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.kpi-lbl { font-size: 13px; color: #909399; }
.kpi-val { font-size: 26px; font-weight: 700; margin-top: 6px; }
.kpi-val.green { color: #2da64a; }
.kpi-val.blue { color: #409eff; }
.kpi-val.red { color: #f56c6c; }
.sub-title { font-weight: 700; color: #303133; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--hn-green); }
.chart { height: 300px; }
.chart-wide { height: 280px; }
.mt { margin-top: 14px; } .mb { margin-bottom: 14px; }
.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.title { font-weight: 700; }
</style>
