<template>
  <div>
    <div class="search-bar">
      <el-input v-model="kw" placeholder="搜索产品" clearable style="width:220px" @keyup.enter="load" />
      <el-select v-model="cat" placeholder="品类" clearable style="width:130px" @change="load">
        <el-option v-for="c in cats" :key="c" :label="c" :value="c" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
    </div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column prop="product_name" label="产品名称" width="140" />
      <el-table-column prop="category" label="品类" width="100" />
      <el-table-column prop="unit" label="单位" width="80" align="center" />
      <el-table-column label="指导价" width="110" align="right">
        <template #default="{ row }"><span class="amt">¥{{ row.guide_price }}</span></template>
      </el-table-column>
      <el-table-column prop="shelf_life" label="保鲜期(天)" width="110" align="right" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="orderRow(row)">下单预订</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="page" v-model:page-size="pageSize" @current-change="load" /></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listProduct } from '@/api'
const router = useRouter()
const loading = ref(false); const list = ref([]); const total = ref(0)
const kw = ref(''); const cat = ref(''); const cats = ref([])
const page = ref(1); const pageSize = ref(10)
async function load() {
  loading.value = true
  const r = await listProduct({ keyword: kw.value, category: cat.value, page: page.value, pageSize: pageSize.value })
  list.value = r.list; total.value = r.total
  // 收集品类
  cats.value = [...new Set(r.list.map(p => p.category).filter(Boolean))]
  loading.value = false
}
function orderRow(row) { router.push({ path: '/buyer/order/new', query: { product_id: row.product_id } }) }
onMounted(load)
</script>
<style scoped>
.amt { color: #f56c6c; font-weight: 700; }
.search-bar { display: flex; gap: 10px; margin-bottom: 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
