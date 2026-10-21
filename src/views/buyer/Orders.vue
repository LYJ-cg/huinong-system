<template>
  <div>
    <div class="search-bar">
      <el-select v-model="q.audit_status" placeholder="审核状态" clearable style="width:140px">
        <el-option label="待销售审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已拒绝" :value="2" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column prop="order_no" label="订单号" width="180" />
      <el-table-column prop="product_name" label="产品" width="120" />
      <el-table-column prop="quantity" label="数量" width="90" align="right" />
      <el-table-column prop="unit" label="单位" width="70" />
      <el-table-column label="期望单价" width="100" align="right">
        <template #default="{ row }">{{ row.expected_price ? '¥' + row.expected_price : '待定价' }}</template>
      </el-table-column>
      <el-table-column prop="expected_date" label="期望日期" width="120" />
      <el-table-column label="审核" width="110" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.audit_status === 0" type="info" size="small">待审核</el-tag>
          <el-tag v-else-if="row.audit_status === 1" type="success" size="small">已通过</el-tag>
          <el-tag v-else type="danger" size="small">已拒绝</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收购/交付" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.audit_status !== 1" size="small">{{ pickText(row.pick_status) }}</el-tag>
          <el-tag v-else :type="pickType(row.pick_status)" size="small">{{ pickText(row.pick_status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注/反馈" min-width="180">
        <template #default="{ row }">
          <div class="note" v-if="row.audit_status === 2">拒绝：{{ row.reject_reason }}</div>
          <div v-else class="muted">{{ row.buyer_note || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="下单时间" width="160" />
    </el-table>
    <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { listBuyerOrder } from '@/api'
const auth = useAuthStore()
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ audit_status: '', page: 1, pageSize: 10 })
function pickText(s) {
  const m = { 0: '待收购', 1: '收购中', 2: '已入库', 3: '已交付' }
  return m[s] || '-'
}
function pickType(s) {
  const m = { 0: 'info', 1: 'warning', 2: 'success', 3: 'success' }
  return m[s] || 'info'
}
async function load() {
  loading.value = true
  const r = await listBuyerOrder({ ...q, buyer_id: auth.buyer?.buyer_id })
  list.value = r.list; total.value = r.total
  loading.value = false
}
function reset() { q.audit_status = ''; q.page = 1; load() }
onMounted(load)
</script>
<style scoped>
.note { color: #f56c6c; font-size: 13px; }
.muted { color: #909399; font-size: 13px; }
.search-bar { display: flex; gap: 10px; margin-bottom: 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
