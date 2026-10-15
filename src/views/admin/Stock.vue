<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-select v-model="q.warehouse_id" placeholder="仓库" clearable style="width:180px">
        <el-option v-for="w in warehouses" :key="w.warehouse_id" :label="w.warehouse_name" :value="w.warehouse_id" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">库存查询（按批次管理，批次号=收购单号）</span></div>
      <el-table :data="list" v-loading="loading" stripe border :row-class-name="rowClass">
        <el-table-column prop="batch_no" label="批次号" width="180" />
        <el-table-column prop="warehouse_name" label="仓库" width="120" />
        <el-table-column prop="product_name" label="农产品" width="110" />
        <el-table-column prop="category" label="类别" width="90"><template #default="{row}"><el-tag size="small" type="info" effect="plain">{{ row.category }}</el-tag></template></el-table-column>
        <el-table-column label="当前库存" width="110" align="right"><template #default="{row}">{{ row.quantity }} {{ row.unit }}</template></el-table-column>
        <el-table-column prop="in_date" label="入库日期" width="110" />
        <el-table-column prop="warn_date" label="临期日期" width="110" />
        <el-table-column label="剩余天数" width="100" align="center">
          <template #default="{row}">
            <span :class="'warn-' + row.warn_level">{{ row.left_days }} 天</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{row}"><el-tag :type="row.status===1?'success':row.status===2?'danger':'info'">{{ ['售罄','正常','已过期'][row.status] }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{row}">
            <el-button type="primary" size="small" link @click="adjust(row)">盘点</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
    <el-dialog v-model="dlg" title="库存盘点" width="380px">
      <el-form label-width="100px">
        <el-form-item label="批次">{{ cur.batch_no }}</el-form-item>
        <el-form-item label="当前库存">{{ cur.quantity }} {{ cur.unit }}</el-form-item>
        <el-form-item label="实际数量"><el-input-number v-model="qty" :min="0" :precision="2" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save盘点">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listStock, adjustStock, listWarehouse } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ warehouse_id: '', page: 1, pageSize: 10 })
const warehouses = ref([]); const dlg = ref(false); const cur = ref({}); const qty = ref(0)
async function load() { loading.value = true; const res = await listStock(q); list.value = res.list; total.value = res.total; loading.value = false }
function reset() { q.warehouse_id = ''; q.page = 1; load() }
function rowClass({ row }) { return 'level-' + row.warn_level }
function adjust(row) { cur.value = row; qty.value = row.quantity; dlg.value = true }
async function save盘点() { await adjustStock(cur.value.stock_id, qty.value); ElMessage.success('盘点已保存'); dlg.value = false; load() }
onMounted(async () => { const r = await listWarehouse({ pageSize: 999 }); warehouses.value = r.list; load() })
</script>

<style scoped>
.warn-expired { color: #f56c6c; font-weight: 700; }
.warn-warn { color: #e6a23c; font-weight: 700; }
.warn-soon { color: #e6a23c; }
.warn-safe { color: #67c23a; }
</style>
