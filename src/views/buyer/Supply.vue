<template>
  <div>
    <div class="search-bar">
      <el-input v-model="kw" placeholder="搜索农户姓名/手机号" clearable style="width:260px" @keyup.enter="load" />
      <el-button type="primary" @click="load">查询</el-button>
    </div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column prop="farmer_name" label="农户姓名" width="120" />
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column prop="address" label="地址" min-width="200" />
      <el-table-column label="供货产品" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="s in row.supplies" :key="s.supply_id" size="small" class="tag">{{ s.product_name }} · {{ s.expect_qty }}{{ s.unit }}</el-tag>
          <span v-if="!row.supplies.length" class="muted">暂无供货信息</span>
        </template>
      </el-table-column>
      <el-table-column label="认证状态" width="100" align="center">
        <template #default="{ row }"><el-tag :type="row.auth_status?'success':'danger'" size="small">{{ row.auth_status?'已认证':'未认证' }}</el-tag></template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="page" v-model:page-size="pageSize" @current-change="load" /></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { listFarmer, listSupply } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const kw = ref(''); const page = ref(1); const pageSize = ref(10)
async function load() {
  loading.value = true
  const f = await listFarmer({ keyword: kw.value, page: page.value, pageSize: pageSize.value })
  const allSup = (await listSupply({ pageSize: 999 })).list.filter(s => s.audit_status === 1)
  list.value = f.list.map(farmer => ({
    ...farmer,
    supplies: allSup.filter(s => s.farmer_id === farmer.farmer_id)
  }))
  total.value = f.total
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.tag { margin-right: 4px; margin-bottom: 2px; }
.muted { color: #999; font-size: 12px; }
.search-bar { display: flex; gap: 10px; margin-bottom: 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
