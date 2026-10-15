<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-select v-model="q.audit_status" placeholder="审核状态" clearable style="width:150px">
        <el-option label="待审核" :value="0" /><el-option label="已通过" :value="1" /><el-option label="已驳回" :value="2" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
      <el-alert type="info" :closable="false" show-icon style="margin-left:auto">
        待审核 {{ pendingCount }} 条 — 通过后将自动向农户推送送货提醒通知
      </el-alert>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">供货信息审核</span></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="supply_id" label="ID" width="60" align="center" />
        <el-table-column prop="farmer_name" label="农户" width="90" />
        <el-table-column prop="product_name" label="农产品" width="110" />
        <el-table-column label="预计数量" width="120"><template #default="{row}">{{ row.expect_qty }} {{ row.unit }}</template></el-table-column>
        <el-table-column prop="harvest_date" label="预计采收期" width="120" />
        <el-table-column prop="address" label="供货地点" show-overflow-tooltip />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{row}"><el-tag :type="row.audit_status===1?'success':row.audit_status===2?'danger':'warning'">{{ ['待审核','已通过','已驳回'][row.audit_status] }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{row}">
            <template v-if="row.audit_status===0">
              <el-button type="success" size="small" link @click="audit(row,1)">通过</el-button>
              <el-button type="danger" size="small" link @click="audit(row,2)">驳回</el-button>
            </template>
            <el-button type="primary" size="small" link @click="goOrder(row)">生成收购单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listSupply, auditSupply } from '@/api'
import { useAuthStore } from '@/store/auth'
const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const list = ref([]); const total = ref(0)
const q = reactive({ audit_status: 0, page: 1, pageSize: 10 })
const pendingCount = computed(() => list.value.filter(x => x.audit_status === 0).length)
async function load() { loading.value = true; const res = await listSupply(q); list.value = res.list; total.value = res.total; loading.value = false }
function reset() { q.audit_status = ''; q.page = 1; load() }
async function audit(row, status) {
  await auditSupply(row.supply_id, status, auth.user.user_id)
  ElMessage.success(status === 1 ? '已通过，已通知农户送货' : '已驳回')
  load()
}
function goOrder(row) {
  router.push({ path: '/admin/order', query: { supply_id: row.supply_id, farmer_id: row.farmer_id, product_id: row.product_id } })
}
load()
</script>
