<template>
  <div class="page-wrap">
    <el-row :gutter="16">
      <el-col :xs="24" :md="10">
        <div class="table-card">
          <div class="toolbar"><span class="title">每日收购指导价发布</span></div>
          <el-table :data="list" v-loading="loading" stripe border size="default">
            <el-table-column prop="product_name" label="农产品" width="100" />
            <el-table-column prop="price_date" label="日期" width="110" />
            <el-table-column label="指导价" width="110" align="right"><template #default="{row}">¥{{ row.guide_price }}</template></el-table-column>
          </el-table>
          <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
        </div>
        <div class="table-card mt">
          <div class="toolbar"><span class="title">发布今日指导价</span></div>
          <el-form :model="form" label-width="80px">
            <el-form-item label="农产品">
              <el-select v-model="form.product_id" @change="onPick" style="width:100%">
                <el-option v-for="p in products" :key="p.product_id" :label="p.product_name" :value="p.product_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="指导价"><el-input-number v-model="form.guide_price" :min="0" :precision="2" style="width:100%" /></el-form-item>
            <el-button type="primary" @click="publish" style="width:100%">发布</el-button>
          </el-form>
        </div>
      </el-col>
      <el-col :xs="24" :md="14">
        <div class="table-card chart-card">
          <div class="toolbar"><span class="title">价格行情走势</span>
            <el-select v-model="trendId" placeholder="选择农产品" size="small" style="width:160px" @change="loadTrend">
              <el-option v-for="p in products" :key="p.product_id" :label="p.product_name" :value="p.product_id" />
            </el-select>
          </div>
          <div ref="chartRef" class="chart"></div>
          <el-alert type="success" :closable="false" show-icon class="mt">
            价格透明：收购单价与指导价关联并留痕，防止压价，助力农户增收。
          </el-alert>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { listPrice, savePrice, priceTrend, listProduct } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ product_id: '', page: 1, pageSize: 10 })
const form = reactive({ product_id: null, guide_price: 0 })
const products = ref([]); const trendId = ref(null)
const chartRef = ref(null); let chart = null
async function load() { loading.value = true; const res = await listPrice(q); list.value = res.list; total.value = res.total; loading.value = false }
function onPick(pid) { const p = products.value.find(x => x.product_id === pid); if (p) form.guide_price = p.guide_price }
async function publish() {
  if (!form.product_id) return ElMessage.warning('请选择农产品')
  await savePrice(form.product_id, form.guide_price)
  ElMessage.success('指导价已发布，已同步农产品档案')
  load()
}
async function loadTrend() {
  if (!trendId.value) return
  const data = await priceTrend(trendId.value)
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '元' },
    series: [{ name: '指导价', type: 'line', smooth: true, data: data.map(d => d.price), areaStyle: { color: 'rgba(45,166,74,.15)' }, lineStyle: { color: '#2da64a' }, itemStyle: { color: '#2da64a' } }]
  })
}
const onResize = () => chart && chart.resize()
onMounted(async () => {
  const pr = await listProduct({ pageSize: 999 }); products.value = pr.list
  if (pr.list.length) { form.product_id = pr.list[0].product_id; onPick(form.product_id); trendId.value = pr.list[0].product_id }
  load(); await nextTick(); loadTrend()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); chart && chart.dispose() })
</script>

<style scoped>
.mt { margin-top: 14px; }
.chart-card { height: 100%; }
.chart { height: 360px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.title { font-weight: 700; }
</style>
