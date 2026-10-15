<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-select v-model="q.out_status" placeholder="出库状态" clearable style="width:140px">
        <el-option label="待出库" :value="0" /><el-option label="已出库" :value="1" />
      </el-select>
      <el-select v-model="q.pay_status" placeholder="收款状态" clearable style="width:140px">
        <el-option label="未收款" :value="0" /><el-option label="已收款" :value="1" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">销售订单管理</span><el-button type="primary" @click="open()">+ 新建销售订单</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="sale_no" label="销售订单号" width="180" />
        <el-table-column prop="channel_name" label="渠道" width="120" />
        <el-table-column prop="product_name" label="农产品" width="110" />
        <el-table-column prop="batch_no" label="出库批次" width="180" />
        <el-table-column label="数量" width="100" align="right"><template #default="{row}">{{ row.quantity }}</template></el-table-column>
        <el-table-column label="单价" width="90" align="right"><template #default="{row}">¥{{ row.price }}</template></el-table-column>
        <el-table-column label="金额" width="110" align="right"><template #default="{row}"><span class="amt">¥{{ row.total_amount }}</span></template></el-table-column>
        <el-table-column prop="sale_date" label="下单时间" width="160" />
        <el-table-column label="出库" width="90" align="center"><template #default="{row}"><el-tag :type="row.out_status?'success':'warning'" size="small">{{ row.out_status ? '已出库' : '待出库' }}</el-tag></template></el-table-column>
        <el-table-column label="收款" width="90" align="center"><template #default="{row}"><el-tag :type="row.pay_status?'success':'info'" size="small">{{ row.pay_status ? '已收' : '未收' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{row}">
            <el-button v-if="!row.out_status" type="success" size="small" link @click="out(row)">出库</el-button>
            <el-button v-if="row.out_status && !row.pay_status" type="primary" size="small" link @click="pay(row)">收款</el-button>
            <el-tag v-if="row.out_status && row.pay_status" type="success" size="small">已完成</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>

    <el-dialog v-model="dlg" title="新建销售订单" width="560px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="销售渠道" required>
          <el-select v-model="form.channel_id" filterable style="width:100%">
            <el-option v-for="c in channels" :key="c.channel_id" :label="`${c.channel_name}(${c.channel_type})`" :value="c.channel_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="出库批次" required>
          <el-select v-model="form.stockKey" placeholder="选择库存批次" style="width:100%" @change="onPickStock">
            <el-option v-for="s in sellable" :key="s.stock_id" :label="`${s.product_name} | ${s.warehouse_name} | ${s.batch_no} | 余${s.quantity}`" :value="s.stock_id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="销售数量" required><el-input-number v-model="form.quantity" :min="1" :precision="2" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="销售单价" required><el-input-number v-model="form.price" :min="0" :precision="2" controls-position="right" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="销售金额">
          <div class="calc-box">{{ form.quantity }} × ¥{{ form.price }} = <span class="amt">¥{{ totalCalc }}</span></div>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">创建</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listSaleOrder, saveSaleOrder, outStock, paySaleOrder, listChannel, listSellableStock } from '@/api'
import { useAuthStore } from '@/store/auth'
const auth = useAuthStore()
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ out_status: '', pay_status: '', page: 1, pageSize: 10 })
const dlg = ref(false); const form = reactive({}); const channels = ref([]); const sellable = ref([])
const totalCalc = computed(() => +((form.quantity || 0) * (form.price || 0)).toFixed(2))
async function load() { loading.value = true; const res = await listSaleOrder(q); list.value = res.list; total.value = res.total; loading.value = false }
function reset() { q.out_status = ''; q.pay_status = ''; q.page = 1; load() }
function open() {
  Object.keys(form).forEach(k => delete form[k])
  Object.assign(form, { quantity: 1, price: 0 })
  dlg.value = true
}
function onPickStock(stockId) {
  const s = sellable.value.find(x => x.stock_id === stockId)
  if (s) { form.warehouse_id = s.warehouse_id; form.product_id = s.product_id; form.batch_no = s.batch_no; form.quantity = s.quantity; form.price = s.guide_price || 0 }
}
async function save() {
  if (!form.channel_id || !form.stockKey) return ElMessage.warning('请选择渠道和库存批次')
  const res = await saveSaleOrder({ ...form }, auth.user.user_id)
  if (res.ok) { ElMessage.success(`销售订单 ${res.sale_no} 已创建`); dlg.value = false; load() }
  else ElMessage.error(res.msg)
}
async function out(row) { const res = await outStock(row.sale_id, auth.user.user_id); res.ok ? ElMessage.success('已出库，库存已扣减') : ElMessage.error(res.msg); load() }
async function pay(row) { await paySaleOrder(row.sale_id); ElMessage.success('已登记收款'); load() }
async function refreshStock() { const r = await listSellableStock(); sellable.value = r }
onMounted(async () => { const cr = await listChannel({ pageSize: 999 }); channels.value = cr.list.filter(c => c.status === 1); await refreshStock(); load() })
</script>

<style scoped>
.amt { color: #f56c6c; font-weight: 700; }
.calc-box { background: #f0f9eb; padding: 8px 12px; border-radius: 6px; color: #606266; }
.calc-box .amt { font-size: 18px; }
</style>
