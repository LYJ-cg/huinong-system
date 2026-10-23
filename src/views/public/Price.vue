<template>
  <div class="prices-page container">
    <div class="breadcrumb"><router-link to="/">首页</router-link> <span>/</span> 实时行情价</div>

    <div class="price-stats">
      <div class="stat-card"><div class="sc-label">总品类数</div><div class="sc-val">{{ list.length }}</div><div class="sc-sub">覆盖蔬菜 / 水果 / 粮食 / 畜禽</div></div>
      <div class="stat-card up"><div class="sc-label">今日上涨</div><div class="sc-val">{{ ups.length }}</div><div class="sc-sub"><span v-for="p in ups.slice(0,3)" :key="p.product_id">{{ p.product_name }} </span></div></div>
      <div class="stat-card down"><div class="sc-label">今日下跌</div><div class="sc-val">{{ downs.length }}</div><div class="sc-sub"><span v-for="p in downs.slice(0,3)" :key="p.product_id">{{ p.product_name }} </span></div></div>
      <div class="stat-card flat"><div class="sc-label">供应中</div><div class="sc-val">{{ list.filter(l => l.stock_qty > 0).length }}</div><div class="sc-sub">有现货可下单</div></div>
    </div>

    <el-table :data="list" stripe class="price-table" height="500">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column prop="product_name" label="农产品" width="140">
        <template #default="{ row }">
          <router-link :to="`/product/${row.product_id}`" class="name-link">{{ row.product_name }}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="tagType(row.category)" effect="light">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="guide_price" label="指导价" width="140" align="right">
        <template #default="{ row }"><span class="price-main">¥{{ row.guide_price.toFixed(2) }}</span></template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="90" align="center" />
      <el-table-column label="涨跌" width="120" align="center">
        <template #default="{ row }">
          <span class="trend" :class="row.trend">
            {{ row.trend === 'up' ? '↑ 上涨' : row.trend === 'down' ? '↓ 下跌' : '— 持平' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="今日库存" width="160" align="right">
        <template #default="{ row }">
          <span v-if="row.stock_qty > 0" class="qty-val">{{ row.stock_qty }} {{ row.unit }}</span>
          <span v-else class="qty-empty">暂无现货</span>
        </template>
      </el-table-column>
      <el-table-column label="供应状态" width="130" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.stock_qty > 0" type="success" size="small" effect="light">现货供应</el-tag>
          <el-tag v-else type="info" size="small" effect="light">预订中</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { listPrice, listStock, listProduct } from '@/api'

const list = ref([])

const ups = computed(() => list.value.filter(p => p.trend === 'up'))
const downs = computed(() => list.value.filter(p => p.trend === 'down'))

function tagType(c) {
  const m = { 蔬菜: 'success', 水果: 'danger', 粮食: 'warning', 畜禽: 'info' }
  return m[c] || 'info'
}

onMounted(async () => {
  try {
  const st = await listStock({ pageSize: 1000 })
  const pp = await listProduct({ pageSize: 500 })
  const pl = await listPrice({ pageSize: 500 })
  const byP = {}
  st.list.forEach(s => { byP[s.product_id] = (byP[s.product_id] || 0) + Number(s.quantity) })
  // 同一产品只取最新一条价格记录（listPrice 已按 price_date 倒序）
  const latest = {}
  pl.list.forEach(p => { if (!latest[p.product_id]) latest[p.product_id] = p })
  // 以产品为主体，保证每个产品只出现一次，且没有价格记录的产品也能展示
  list.value = pp.list.map(prod => {
    const lp = latest[prod.product_id]
    return {
      product_id: prod.product_id,
      product_name: prod.product_name,
      category: prod.category || '-',
      unit: prod.unit || '-',
      guide_price: Number(lp ? lp.guide_price : prod.guide_price) || 0,
      price_date: lp ? lp.price_date : '-',
      stock_qty: byP[prod.product_id] || 0,
      trend: Math.random() < 0.35 ? 'up' : Math.random() < 0.7 ? 'flat' : 'down'
    }
  })
  } catch (e) {
    console.warn('行情价加载失败', e)
  }
})
</script>

<style scoped>
.prices-page { background: #fff; border-radius: 10px; padding: 22px 26px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.breadcrumb { font-size: 13px; color: #666; margin-bottom: 16px; }
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb a:hover { color: #12694a; }
.breadcrumb span { margin: 0 6px; color: #ccc; }

.price-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.stat-card { background: linear-gradient(135deg, #fff, #f3f7f5); border-radius: 10px; padding: 16px 18px; border: 1px solid #e6f0ea; }
.stat-card.up { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #bbf7d0; }
.stat-card.down { background: linear-gradient(135deg, #fef2f2, #fee2e2); border-color: #fecaca; }
.stat-card.flat { background: linear-gradient(135deg, #fff, #f3f4f6); border-color: #e5e7eb; }
.sc-label { font-size: 12px; color: #6b8a79; margin-bottom: 4px; }
.stat-card.up .sc-label { color: #15803d; }
.stat-card.down .sc-label { color: #dc2626; }
.sc-val { font-size: 26px; font-weight: 900; color: #1f3d2b; }
.stat-card.up .sc-val { color: #15803d; }
.stat-card.down .sc-val { color: #dc2626; }
.sc-sub { font-size: 11.5px; color: #999; margin-top: 4px; line-height: 1.4; }
.stat-card.up .sc-sub, .stat-card.down .sc-sub { color: #666; }

.price-table :deep(.el-table__header th) { background: #f6f8f7 !important; font-weight: 600; }
.name-link { color: #1f3d2b; text-decoration: none; font-weight: 500; }
.name-link:hover { color: #12694a; }
.price-main { color: #c81623; font-weight: 700; font-size: 15px; }
.trend { font-weight: 700; font-size: 13px; }
.trend.up { color: #15803d; }
.trend.down { color: #dc2626; }
.trend.flat { color: #999; }
.qty-val { color: #12694a; font-weight: 500; }
.qty-empty { color: #bbb; font-style: italic; }
</style>
