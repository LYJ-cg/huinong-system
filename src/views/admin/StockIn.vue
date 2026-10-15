<template>
  <div class="page-wrap">
    <div class="table-card">
      <div class="toolbar"><span class="title">入库记录</span><el-alert type="info" :closable="false" show-icon style="flex:.5">入库单由收购单锁定后自动生成，批次号关联收购单号</el-alert></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="in_no" label="入库单号" width="180" />
        <el-table-column prop="order_no" label="关联收购单" width="180" />
        <el-table-column prop="warehouse_name" label="仓库" width="120" />
        <el-table-column prop="product_name" label="农产品" width="110" />
        <el-table-column prop="batch_no" label="批次号" width="180" />
        <el-table-column label="入库数量" width="120" align="right"><template #default="{row}">{{ row.quantity }}</template></el-table-column>
        <el-table-column prop="in_date" label="入库时间" width="160" />
        <el-table-column prop="operator_name" label="操作员" width="100" />
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { listStockIn } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ page: 1, pageSize: 10 })
async function load() { loading.value = true; const res = await listStockIn(q); list.value = res.list; total.value = res.total; loading.value = false }
load()
</script>
