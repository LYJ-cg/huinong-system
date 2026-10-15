<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-select v-model="q.status" placeholder="计划状态" clearable style="width:150px">
        <el-option label="待执行" :value="0" /><el-option label="执行中" :value="1" /><el-option label="已完成" :value="2" /><el-option label="已取消" :value="3" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">收购计划</span><el-button type="primary" @click="open()">+ 制定计划</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="plan_no" label="计划单号" width="180" />
        <el-table-column prop="product_name" label="农产品" width="110" />
        <el-table-column prop="plan_qty" label="计划数量" width="110" />
        <el-table-column prop="plan_date" label="计划日期" width="120" />
        <el-table-column prop="create_user_name" label="制定人" width="100" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{row}"><el-tag :type="['info','','success','danger'][row.status]">{{ ['待执行','执行中','已完成','已取消'][row.status] }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{row}">
            <el-button v-if="row.status===0" type="success" size="small" link @click="change(row,1)">执行</el-button>
            <el-button v-if="row.status===1" type="primary" size="small" link @click="goOrder(row)">去收购</el-button>
            <el-button v-if="row.status===1" type="success" size="small" link @click="change(row,2)">完成</el-button>
            <el-button v-if="row.status<2" type="danger" size="small" link @click="change(row,3)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>

    <el-dialog v-model="dlg" title="制定收购计划" width="480px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="农产品" required>
          <el-select v-model="form.product_id" filterable style="width:100%" @change="onProduct">
            <el-option v-for="p in products" :key="p.product_id" :label="`${p.product_name}(${p.category}) 指导价¥${p.guide_price}/${p.unit}`" :value="p.product_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划数量" required><el-input-number v-model="form.plan_qty" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="计划日期" required><el-date-picker v-model="form.plan_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">制定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listPlan, savePlan, changePlanStatus, listProduct } from '@/api'
import { useAuthStore } from '@/store/auth'
const router = useRouter(); const auth = useAuthStore()
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ status: '', page: 1, pageSize: 10 })
const dlg = ref(false); const form = reactive({})
const products = ref([])
async function load() { loading.value = true; const res = await listPlan(q); list.value = res.list; total.value = res.total; loading.value = false }
function reset() { q.status = ''; q.page = 1; load() }
function open() { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, { plan_qty: 1000, plan_date: new Date().toISOString().slice(0,10) }); dlg.value = true }
function onProduct(pid) { const p = products.value.find(x => x.product_id === pid); if (p) form.guide_price = p.guide_price }
async function save() {
  if (!form.product_id || !form.plan_qty || !form.plan_date) return ElMessage.warning('请填写完整')
  const res = await savePlan({ ...form }, auth.user.user_id)
  if (res.ok) { ElMessage.success('计划已制定'); dlg.value = false; load() }
}
async function change(row, status) { await changePlanStatus(row.plan_id, status); ElMessage.success('状态已更新'); load() }
function goOrder(row) { router.push({ path: '/admin/order', query: { plan_id: row.plan_id, product_id: row.product_id } }) }
onMounted(async () => { const r = await listProduct({ pageSize: 999 }); products.value = r.list; load() })
</script>
