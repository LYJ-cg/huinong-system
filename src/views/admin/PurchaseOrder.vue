<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-select v-model="q.status" placeholder="单据状态" clearable style="width:150px">
        <el-option label="待确认" :value="0" /><el-option label="已确认" :value="1" /><el-option label="已锁定" :value="2" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
      <el-alert type="warning" :closable="false" show-icon style="margin-left:auto">
        流程：生成收购单 → 农户确认 → 锁定后自动入库（批次管理）
      </el-alert>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">收购单管理</span><el-button type="primary" @click="open()">+ 新建收购单</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="order_no" label="收购单号" width="180" />
        <el-table-column prop="farmer_name" label="农户" width="90" />
        <el-table-column prop="product_name" label="农产品" width="110" />
        <el-table-column label="毛重" width="90" align="right"><template #default="{row}">{{ row.gross_weight }}</template></el-table-column>
        <el-table-column label="皮重" width="90" align="right"><template #default="{row}">{{ row.tare_weight }}</template></el-table-column>
        <el-table-column label="净重" width="90" align="right">
          <template #default="{row}"><span class="hl">{{ row.net_weight }}</span></template>
        </el-table-column>
        <el-table-column label="单价" width="90" align="right"><template #default="{row}">¥{{ row.price }}</template></el-table-column>
        <el-table-column label="扣杂" width="90" align="right"><template #default="{row}">¥{{ row.deduct_amount }}</template></el-table-column>
        <el-table-column label="总金额" width="110" align="right">
          <template #default="{row}"><span class="amt">¥{{ row.total_amount }}</span></template>
        </el-table-column>
        <el-table-column prop="quality_grade" label="质检" width="80" align="center">
          <template #default="{row}"><el-tag v-if="row.quality_grade" size="small">{{ row.quality_grade }}</el-tag></template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{row}"><el-tag :type="['warning','success','danger'][row.status]">{{ ['待确认','已确认','已锁定'][row.status] }}</el-tag></template>
        </el-table-column>
        <el-table-column label="结算" width="80" align="center">
          <template #default="{row}"><el-tag :type="row.settle_status?'success':'info'" size="small">{{ row.settle_status ? '已结' : '未结' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{row}">
            <el-button v-if="row.status===0" type="primary" size="small" link @click="confirm(row)">农户确认</el-button>
            <el-button v-if="row.status===1" type="danger" size="small" link @click="confirm(row)">锁定入库</el-button>
            <el-tag v-if="row.status===2" type="success" size="small">已入库</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>

    <el-dialog v-model="dlg" title="新建收购单（称重质检）" width="620px">
      <el-form :model="form" label-width="92px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="农户" required>
              <el-select v-model="form.farmer_id" filterable @change="onFarmer" style="width:100%">
                <el-option v-for="f in farmers" :key="f.farmer_id" :label="f.farmer_name" :value="f.farmer_id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="农产品" required>
              <el-select v-model="form.product_id" filterable @change="onProduct" style="width:100%">
                <el-option v-for="p in products" :key="p.product_id" :label="`${p.product_name} ¥${p.guide_price}/${p.unit}`" :value="p.product_id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8"><el-form-item label="毛重" required><el-input-number v-model="form.gross_weight" :min="0" :precision="3" controls-position="right" style="width:100%" @change="calc" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="皮重"><el-input-number v-model="form.tare_weight" :min="0" :precision="3" controls-position="right" style="width:100%" @change="calc" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="净重"><el-input-number v-model="form.net_weight" :precision="3" disabled style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8"><el-form-item label="单价" required><el-input-number v-model="form.price" :min="0" :precision="2" controls-position="right" style="width:100%" @change="calc" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="扣杂金额"><el-input-number v-model="form.deduct_amount" :min="0" :precision="2" controls-position="right" style="width:100%" @change="calc" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="质检等级">
            <el-select v-model="form.quality_grade" style="width:100%"><el-option label="一级" value="一级" /><el-option label="二级" value="二级" /><el-option label="三级" value="三级" /></el-select>
          </el-form-item></el-col>
        </el-row>
        <el-form-item label="结算金额">
          <div class="calc-box">净重 {{ form.net_weight }} × 单价 ¥{{ form.price }} − 扣杂 ¥{{ form.deduct_amount }} = <span class="amt">¥{{ totalCalc }}</span></div>
        </el-form-item>
        <el-form-item label="关联供货"><span v-if="form.supply_id">供货ID: {{ form.supply_id }}</span><span v-else class="muted">现场收购（无关联）</span></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">生成收购单</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listOrder, saveOrder, confirmOrder, listProduct, listFarmer } from '@/api'
import { useAuthStore } from '@/store/auth'
const route = useRoute(); const auth = useAuthStore()
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ status: '', page: 1, pageSize: 10 })
const dlg = ref(false); const form = reactive({})
const products = ref([]); const farmers = ref([])
const totalCalc = computed(() => {
  const net = +((form.gross_weight || 0) - (form.tare_weight || 0)).toFixed(3)
  return +(net * (form.price || 0) - (form.deduct_amount || 0)).toFixed(2)
})
async function load() { loading.value = true; const res = await listOrder(q); list.value = res.list; total.value = res.total; loading.value = false }
function reset() { q.status = ''; q.page = 1; load() }
function calc() { form.net_weight = +((form.gross_weight || 0) - (form.tare_weight || 0)).toFixed(3) }
function onProduct(pid) { const p = products.value.find(x => x.product_id === pid); if (p) form.price = p.guide_price; calc() }
function onFarmer() {}
function open() {
  Object.keys(form).forEach(k => delete form[k])
  Object.assign(form, { gross_weight: 0, tare_weight: 0, net_weight: 0, price: 0, deduct_amount: 0, quality_grade: '一级' })
  // 从供货/计划带入
  if (route.query.supply_id) form.supply_id = Number(route.query.supply_id)
  if (route.query.farmer_id) form.farmer_id = Number(route.query.farmer_id)
  if (route.query.product_id) { form.product_id = Number(route.query.product_id); onProduct(form.product_id) }
  dlg.value = true
}
async function save() {
  if (!form.farmer_id || !form.product_id) return ElMessage.warning('请选择农户和农产品')
  calc()
  const res = await saveOrder({ ...form, net_weight: form.net_weight }, auth.user.user_id)
  if (res.ok) { ElMessage.success(`收购单 ${res.order_no} 已生成，金额¥${res.total_amount}`); dlg.value = false; load() }
}
async function confirm(row) {
  await confirmOrder(row.order_id)
  ElMessage.success(row.status === 0 ? '农户已确认' : '已锁定并自动入库')
  load()
}
onMounted(async () => {
  const [pr, fr] = await Promise.all([listProduct({ pageSize: 999 }), listFarmer({ pageSize: 999 })])
  products.value = pr.list; farmers.value = fr.list
  if (route.query.supply_id || route.query.plan_id) open()
  load()
})
</script>

<style scoped>
.hl { color: var(--hn-green-dark); font-weight: 700; }
.amt { color: #f56c6c; font-weight: 700; }
.calc-box { background: #f0f9eb; padding: 8px 12px; border-radius: 6px; color: #606266; }
.calc-box .amt { font-size: 18px; }
.muted { color: #c0c4cc; }
</style>
