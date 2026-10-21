<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-select v-model="q.audit_status" placeholder="审核状态" clearable style="width:140px">
        <el-option label="待销售审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已拒绝" :value="2" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">买方预订审核</span></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="order_no" label="预订订单号" width="180" />
        <el-table-column prop="buyer_name" label="买方" width="140" />
        <el-table-column label="产品" width="160">
          <template #default="{ row }">
            <span>{{ row.product_name }}</span>
            <el-tag v-if="!row.product_id" size="small" type="warning" style="margin-left:6px">新增</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="需求" width="150">
          <template #default="{ row }">{{ row.quantity }}{{ row.unit }} · 期望 ¥{{ row.expected_price || '待定价' }}</template>
        </el-table-column>
        <el-table-column prop="expected_date" label="期望日期" width="120" />
        <el-table-column label="销售审核" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.audit_status === 0" type="warning" size="small">待审核</el-tag>
            <el-tag v-else-if="row.audit_status === 1" type="success" size="small">已通过</el-tag>
            <el-tag v-else type="danger" size="small">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收购进度" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="pickType(row.pick_status)">{{ pickText(row.pick_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收购计划" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.audit_status === 1 && row.pick_status >= 1" class="has-plan">已生成</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="备注/反馈" min-width="200">
          <template #default="{ row }">
            <div v-if="row.audit_status === 2" class="note">拒绝：{{ row.reject_reason }}</div>
            <div v-else class="muted">{{ row.buyer_note || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <template v-if="row.audit_status === 0">
              <el-button type="success" size="small" link @click="openPass(row)">通过</el-button>
              <el-button type="danger" size="small" link @click="openReject(row)">拒绝</el-button>
            </template>
            <template v-else-if="row.audit_status === 1">
              <el-button v-if="row.pick_status < 2" type="primary" size="small" link @click="markPicked(row, 2)">已入库</el-button>
              <el-button v-if="row.pick_status < 3" type="success" size="small" link @click="markPicked(row, 3)">已交付</el-button>
            </template>
            <el-tag v-else type="info" size="small">已处理</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>

    <!-- 通过弹窗 -->
    <el-dialog v-model="passD" title="审核通过" width="480px">
      <div class="summary">
        <p><b>订单号：</b>{{ curOrder?.order_no }}</p>
        <p><b>买方：</b>{{ curOrder?.buyer_name }}　<b>产品：</b>{{ curOrder?.product_name }}</p>
        <p><b>数量：</b>{{ curOrder?.quantity }}{{ curOrder?.unit }}　<b>期望日期：</b>{{ curOrder?.expected_date }}</p>
      </div>
      <el-form :model="passForm" label-width="110px" style="margin-top:10px">
        <el-form-item label="销售单价">
          <el-input-number v-model="passForm.price" :min="0" :precision="2" controls-position="right" style="width:100%" />
          <div class="hint">默认使用买方期望价；若为空则使用产品当前指导价</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passD=false">取消</el-button>
        <el-button type="primary" @click="doPass">确认通过</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectD" title="拒绝预订订单" width="480px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input v-model="rejectForm.reason" type="textarea" :rows="3" placeholder="请填写拒绝理由，将通知给买方" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectD=false">取消</el-button>
        <el-button type="danger" @click="doReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listBuyerOrder, auditBuyerOrder, linkPickStatus } from '@/api'
import { useAuthStore } from '@/store/auth'
const auth = useAuthStore()
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ audit_status: 0, page: 1, pageSize: 10 })
const passD = ref(false); const rejectD = ref(false); const curOrder = ref(null)
const passForm = reactive({ price: 0 }); const rejectForm = reactive({ reason: '' })

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
  const r = await listBuyerOrder(q); list.value = r.list; total.value = r.total
  loading.value = false
}
function reset() { q.audit_status = ''; q.page = 1; load() }
function openPass(row) {
  curOrder.value = row
  passForm.price = row.expected_price || 0
  passD.value = true
}
function openReject(row) { curOrder.value = row; rejectForm.reason = ''; rejectD.value = true }

async function doPass() {
  const r = await auditBuyerOrder(curOrder.value.order_id, true, auth.user.user_id, '', passForm.price || null)
  if (r.ok) {
    ElMessage.success(`已通过，${r.pick_status === 2 ? '库存充足已安排出库' : '已创建收购计划请安排收购'}`)
    passD.value = false; load()
  } else ElMessage.error(r.msg)
}
async function doReject() {
  if (!rejectForm.reason.trim()) return ElMessage.warning('请填写拒绝原因')
  const r = await auditBuyerOrder(curOrder.value.order_id, false, auth.user.user_id, rejectForm.reason)
  if (r.ok) { ElMessage.success('已拒绝并通知买方'); rejectD.value = false; load() } else ElMessage.error(r.msg)
}
async function markPicked(row, status) {
  const txt = status === 2 ? '已入库' : '已交付'
  const r = await linkPickStatus(row.order_id, status, auth.user.user_id)
  if (r.ok) ElMessage.success(`已标记${txt}`); load()
}
onMounted(load)
</script>
<style scoped>
.summary { background: #f0f9eb; border-radius: 6px; padding: 10px 14px; font-size: 13px; color: #303133; }
.summary p { margin: 4px 0; }
.hint { font-size: 12px; color: #909399; margin-top: 4px; }
.has-plan { color: #67c23a; font-weight: 600; }
.note { color: #f56c6c; font-size: 13px; }
.muted { color: #909399; font-size: 13px; }
.search-bar { display: flex; gap: 10px; margin-bottom: 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
