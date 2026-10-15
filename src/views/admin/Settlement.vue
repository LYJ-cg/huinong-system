<template>
  <div class="page-wrap">
    <div class="table-card">
      <div class="toolbar"><span class="title">结算管理</span><el-button type="primary" @click="open()">+ 生成结算单</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="settlement_no" label="结算单号" width="180" />
        <el-table-column prop="farmer_name" label="农户" width="90" />
        <el-table-column label="结算区间" width="200"><template #default="{row}">{{ row.start_date }} ~ {{ row.end_date }}</template></el-table-column>
        <el-table-column label="结算金额" width="120" align="right"><template #default="{row}"><span class="amt">¥{{ row.total_amount }}</span></template></el-table-column>
        <el-table-column prop="pay_method" label="支付方式" width="100" />
        <el-table-column prop="pay_time" label="打款时间" width="160" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{row}"><el-tag :type="['warning','','success'][row.status]">{{ ['待打款','已打款','农户已确认'][row.status] }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{row}">
            <el-button type="primary" size="small" link @click="detail(row)">明细</el-button>
            <el-button v-if="row.status===0" type="success" size="small" link @click="pay(row)">打款</el-button>
            <el-tag v-else-if="row.status===2" type="success" size="small">已完成</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>

    <el-dialog v-model="dlg" title="生成结算单" width="480px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="农户" required>
          <el-select v-model="form.farmer_id" filterable style="width:100%" @change="onPick">
            <el-option v-for="f in farmers" :key="f.farmer_id" :label="`${f.farmer_name}(${f.phone})`" :value="f.farmer_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算区间" required>
          <el-date-picker v-model="form.range" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width:100%" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="form.pay_method" style="width:100%">
            <el-option label="银行转账" value="银行转账" /><el-option label="现金" value="现金" /><el-option label="微信" value="微信" /><el-option label="支付宝" value="支付宝" />
          </el-select>
        </el-form-item>
        <el-alert v-if="preview.total!==undefined" type="success" :closable="false" show-icon>
          汇总 {{ preview.count }} 笔收购单，合计 ¥{{ preview.total }}
        </el-alert>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">生成</el-button></template>
    </el-dialog>

    <el-dialog v-model="dlgDetail" title="结算明细" width="620px">
      <el-table :data="curItems" border size="small">
        <el-table-column prop="order_no" label="收购单号" width="180" />
        <el-table-column label="结算金额" align="right"><template #default="{row}">¥{{ row.amount }}</template></el-table-column>
      </el-table>
      <div class="sum-row">合计：<span class="amt">¥{{ curTotal }}</span></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { listSettlement, createSettlement, paySettlement, listFarmer, listOrder } from '@/api'
import { useAuthStore } from '@/store/auth'
const auth = useAuthStore()
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ page: 1, pageSize: 10 })
const dlg = ref(false); const form = reactive({})
const farmers = ref([]); const preview = ref({})
const dlgDetail = ref(false); const curItems = ref([]); const curTotal = ref(0)
async function load() { loading.value = true; const res = await listSettlement(q); list.value = res.list; total.value = res.total; loading.value = false }
function open() { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, { pay_method: '银行转账' }); preview.value = {}; dlg.value = true }
async function onPick(fid) {
  const res = await listOrder({ farmer_id: fid, pageSize: 999 })
  const unsettled = res.list.filter(o => o.settle_status === 0 && o.status >= 1)
  preview.value = { count: unsettled.length, total: unsettled.reduce((s, o) => s + Number(o.total_amount), 0).toFixed(2) }
}
async function save() {
  if (!form.farmer_id || !form.range) return ElMessage.warning('请选择农户和结算区间')
  const res = await createSettlement({ farmer_id: form.farmer_id, start_date: form.range[0], end_date: form.range[1], pay_method: form.pay_method }, auth.user.user_id)
  if (res.ok) { ElMessage.success(`结算单 ${res.settlement_no} 已生成，¥${res.total_amount}`); dlg.value = false; load() }
  else ElMessage.error(res.msg)
}
function detail(row) { curItems.value = row.items || []; curTotal.value = row.total_amount; dlgDetail.value = true }
async function pay(row) {
  await paySettlement(row.settlement_id, row.pay_method)
  ElMessage.success('已打款，已通知农户确认')
  load()
}
;(async () => { const r = await listFarmer({ pageSize: 999 }); farmers.value = r.list; load() })()
</script>

<style scoped>
.amt { color: #f56c6c; font-weight: 700; }
.sum-row { text-align: right; padding: 14px 4px 0; font-size: 16px; }
</style>
