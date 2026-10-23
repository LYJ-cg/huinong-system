<template>
  <div class="products-page container">
    <div class="breadcrumb">
      <router-link to="/">首页</router-link> <span>/</span> 全部商品
    </div>

    <div class="filter-bar">
      <div class="filter-row">
        <span class="fl-label">分类：</span>
        <div class="fl-items">
          <a :class="{active: !cat}" @click="$router.push('/products')">全部</a>
          <a
            v-for="c in categories" :key="c"
            :class="{active: cat === c}"
            @click="$router.push({ path: '/products', query: { cat: c } })"
          >{{ c }}</a>
        </div>
      </div>
      <div class="filter-row">
        <span class="fl-label">排序：</span>
        <div class="fl-items">
          <a :class="{active: orderBy === 'default'}" @click="orderBy = 'default'">综合</a>
          <a :class="{active: orderBy === 'priceAsc'}" @click="orderBy = 'priceAsc'">价格 ↑</a>
          <a :class="{active: orderBy === 'priceDesc'}" @click="orderBy = 'priceDesc'">价格 ↓</a>
          <a :class="{active: orderBy === 'stock'}" @click="orderBy = 'stock'">库存优先</a>
        </div>
      </div>
      <div class="filter-row kw-row" v-if="kw">
        <span class="fl-label">搜索：</span>
        <div class="fl-items"><span class="kw-tag">"{{ kw }}"</span> <a @click="$router.push('/products')">× 清除</a></div>
      </div>
    </div>

    <div class="product-grid">
      <div v-for="p in sortedList" :key="p.product_id" class="product-card" @click="goDetail(p)">
        <div class="pc-img">
          <div class="pc-badge">{{ p.category }}</div>
          <el-icon class="pc-emoji">{{ catIcon(p.category) }}</el-icon>
          <el-tag v-if="p.stock_qty === 0" size="small" type="info" effect="dark" class="pc-soldout">缺货</el-tag>
        </div>
        <div class="pc-body">
          <div class="pc-name">{{ p.product_name }}</div>
          <div class="pc-meta">
            <span><el-icon><Box /></el-icon> {{ p.stock_qty || 0 }} {{ p.unit }}</span>
            <span><el-icon><Timer /></el-icon> 保鲜 {{ p.shelf_life }}天</span>
          </div>
          <div class="pc-footer">
            <span class="pc-price">¥{{ p.guide_price }}<small>/{{ p.unit }}</small></span>
            <span class="pc-supply" v-if="p.farmer_name">🏡 {{ p.farmer_name }}</span>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-if="!sortedList.length" description="没有找到符合条件的商品" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Sunny, Box, Timer } from '@element-plus/icons-vue'
import { listProduct, listStock } from '@/api'

const route = useRoute()
const router = useRouter()

const categories = ['蔬菜', '水果', '粮食', '畜禽']
const list = ref([])
const orderBy = ref('default')

const cat = computed(() => route.query.cat || '')
const kw = computed(() => route.query.kw || '')

const sortedList = computed(() => {
  let l = [...list.value]
  if (cat.value) l = l.filter(p => p.category === cat.value)
  if (kw.value) l = l.filter(p => (p.product_name || '').includes(kw.value))
  if (orderBy.value === 'priceAsc') l.sort((a, b) => a.guide_price - b.guide_price)
  else if (orderBy.value === 'priceDesc') l.sort((a, b) => b.guide_price - a.guide_price)
  else if (orderBy.value === 'stock') l.sort((a, b) => (b.stock_qty || 0) - (a.stock_qty || 0))
  return l
})

function catIcon(c) {
  const m = { 蔬菜: '🥬', 水果: '🍎', 粮食: '🌾', 畜禽: '🐔' }
  return m[c] || '🌿'
}
function goDetail(p) { router.push(`/product/${p.product_id}`) }

async function load() {
  const pp = await listProduct({ pageSize: 500 })
  const st = await listStock({ pageSize: 1000 })
  const byP = {}
  st.list.forEach(s => { byP[s.product_id] = (byP[s.product_id] || 0) + Number(s.quantity) })
  list.value = pp.list.map(p => ({ ...p, stock_qty: byP[p.product_id] || 0 }))
}
onMounted(load)
watch(() => route.query, load, { deep: true })
</script>

<style scoped>
.products-page { background: #fff; border-radius: 10px; padding: 22px 24px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.breadcrumb { font-size: 13px; color: #666; margin-bottom: 14px; }
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb a:hover { color: #12694a; }
.breadcrumb span { margin: 0 6px; color: #ccc; }

.filter-bar { background: #fafbfb; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px; border: 1px solid #f0f2f1; }
.filter-row { display: flex; align-items: center; gap: 14px; padding: 4px 0; }
.filter-row + .filter-row { border-top: 1px dashed #eef0ef; margin-top: 8px; padding-top: 12px; }
.fl-label { color: #888; font-size: 13px; min-width: 50px; }
.fl-items { display: flex; gap: 18px; font-size: 13px; }
.fl-items a { color: #555; cursor: pointer; text-decoration: none; }
.fl-items a:hover { color: #12694a; }
.fl-items a.active { color: #12694a; font-weight: 700; }
.kw-tag { background: #fff3e0; color: #c81623; padding: 2px 8px; border-radius: 4px; }

.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.product-card { background: #fff; border: 1px solid #eee; border-radius: 10px; cursor: pointer; transition: all .25s; overflow: hidden; }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(18, 105, 74, .15); border-color: #12694a; }
.pc-img { position: relative; height: 140px; background: linear-gradient(135deg, #f3f7f5, #e6f0ea); display: flex; align-items: center; justify-content: center; }
.pc-emoji { font-size: 58px; }
.pc-badge { position: absolute; top: 10px; left: 10px; background: rgba(18, 105, 74, .9); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
.pc-soldout { position: absolute; top: 10px; right: 10px; }
.pc-body { padding: 12px 14px; }
.pc-name { font-size: 15px; font-weight: 600; color: #1f3d2b; margin-bottom: 6px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
.pc-meta { display: flex; gap: 10px; font-size: 12px; color: #888; margin-bottom: 10px; }
.pc-meta .el-icon { vertical-align: -2px; }
.pc-footer { display: flex; justify-content: space-between; align-items: baseline; }
.pc-price { color: #c81623; font-size: 18px; font-weight: 800; }
.pc-price small { font-size: 11px; color: #999; font-weight: 400; margin-left: 2px; }
.pc-supply { font-size: 11.5px; color: #6b8a79; max-width: 120px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
</style>
