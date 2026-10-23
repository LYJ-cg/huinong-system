<template>
  <div class="home-page container">
    <!-- ===== Banner ===== -->
    <section class="banner-row">
      <div class="banner">
        <div class="banner-inner">
          <div class="banner-text">
            <h1>产地直供 · 新鲜到家</h1>
            <p>覆盖蔬菜 / 水果 / 粮食 / 畜禽四大品类，产地直采，质量可追溯</p>
            <router-link to="/products" class="banner-btn">立即选购 →</router-link>
          </div>
          <div class="banner-illus">
            <div class="illus-circle"></div>
            <el-icon class="illus-icon"><Sunny /></el-icon>
          </div>
        </div>
      </div>
      <div class="banner-side">
        <div class="side-card notice-card">
          <div class="sc-head"><span>📢</span> 最新公告</div>
          <ul class="sc-list">
            <li v-for="n in notices" :key="n.notice_id">{{ n.title }}</li>
            <li v-if="!notices.length" class="empty">暂无公告</li>
          </ul>
        </div>
        <div class="side-card stat-card">
          <div class="sc-head"><span>📊</span> 今日行情</div>
          <div class="stat-list">
            <div class="stat-item" v-for="p in topPrices" :key="p.product_id">
              <span class="si-name">{{ p.product_name }}</span>
              <span class="si-price">¥{{ p.guide_price }}/{{ p.unit }}</span>
              <span class="si-trend" :class="p.trend">{{ p.trend === 'up' ? '↑' : p.trend === 'down' ? '↓' : '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 热销推荐 ===== -->
    <section class="section">
      <div class="section-head">
        <h2>🔥 热销农产品</h2>
        <router-link to="/products" class="more">查看全部 →</router-link>
      </div>
      <div class="product-grid">
        <div v-for="p in hotProducts" :key="p.product_id" class="product-card" @click="goDetail(p)">
          <div class="pc-img">
            <div class="pc-badge">{{ p.category }}</div>
            <el-icon class="pc-emoji" :class="catClass(p.category)">{{ catIcon(p.category) }}</el-icon>
          </div>
          <div class="pc-body">
            <div class="pc-name" :title="p.product_name">{{ p.product_name }}</div>
            <div class="pc-meta">
              <span><el-icon><Box /></el-icon> 库存 {{ p.stock_qty || 0 }} {{ p.unit }}</span>
              <span><el-icon><Timer /></el-icon> 保鲜 {{ p.shelf_life }}天</span>
            </div>
            <div class="pc-footer">
              <span class="pc-price">¥{{ p.guide_price }}<small>/{{ p.unit }}</small></span>
              <span class="pc-supply" v-if="p.farmer_name">🏡 {{ p.farmer_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 行情快览 ===== -->
    <section class="section">
      <div class="section-head">
        <h2>📈 实时行情价</h2>
        <router-link to="/prices" class="more">完整行情 →</router-link>
      </div>
      <el-table :data="prices" size="small" stripe class="price-table">
        <el-table-column prop="product_name" label="农产品" width="120" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="catTagType(row.category)" effect="light">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="guide_price" label="指导价 (元)" width="130" align="right">
          <template #default="{ row }"><span class="price-val">¥{{ row.guide_price.toFixed(2) }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="100" align="center" />
        <el-table-column label="今日库存" width="140" align="right">
          <template #default="{ row }">
            <span v-if="row.stock_qty" class="qty-val">{{ row.stock_qty }} {{ row.unit }}</span>
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
    </section>

    <!-- ===== 热门供货方 ===== -->
    <section class="section">
      <div class="section-head">
        <h2>🏡 热门供货方</h2>
        <router-link to="/suppliers" class="more">全部供货方 →</router-link>
      </div>
      <div class="supplier-grid">
        <div v-for="s in suppliers" :key="s.farmer_id" class="supplier-card">
          <div class="sc-avatar">
            <el-icon><Sunny /></el-icon>
          </div>
          <div class="sc-body">
            <div class="sc-name">
              {{ s.farmer_name }}
              <el-tag v-if="s.auth_status === 1" size="small" type="success" effect="plain">已认证</el-tag>
              <el-tag v-else size="small" type="warning" effect="plain">待认证</el-tag>
            </div>
            <div class="sc-addr">📍 {{ s.address }}</div>
            <div class="sc-info">
              <span>📞 {{ s.phone }}</span>
              <span v-if="s.auth_status === 1" class="sc-good">✨ 信用良好</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Sunny, Box, Timer } from '@element-plus/icons-vue'
import { listProduct, listPrice, listNotice, listStock } from '@/api'

const router = useRouter()

const products = ref([])
const prices = ref([])
const notices = ref([])
const suppliers = ref([])

const hotProducts = ref([])
const topPrices = ref([])

function catIcon(c) {
  const m = { 蔬菜: '🥬', 水果: '🍎', 粮食: '🌾', 畜禽: '🐔' }
  return m[c] || '🌿'
}
function catClass(c) {
  return 'cat-emoji cat-' + c
}
function catTagType(c) {
  const m = { 蔬菜: 'success', 水果: 'danger', 粮食: 'warning', 畜禽: 'info' }
  return m[c] || 'info'
}
function goDetail(p) {
  router.push({ path: `/product/${p.product_id}` })
}

onMounted(async () => {
  try {
    // 拉产品列表
    const pp = await listProduct({ pageSize: 100 })
    products.value = pp.list
    // 拉库存（合并库存到产品上）
    const st = await listStock({ pageSize: 1000 })
    const byProduct = {}
    st.list.forEach(s => { byProduct[s.product_id] = (byProduct[s.product_id] || 0) + Number(s.quantity) })
    hotProducts.value = products.value.map(p => ({
      ...p,
      stock_qty: byProduct[p.product_id] || 0
    })).sort((a, b) => b.guide_price - a.guide_price).slice(0, 8)

    // 行情价：以产品为主体，每个产品一行，取最新一条价格记录
    const pl = await listPrice({ pageSize: 500 })
    const latest = {}
    pl.list.forEach(x => { if (!latest[x.product_id]) latest[x.product_id] = x })
    prices.value = products.value.map(p => ({
      product_id: p.product_id,
      product_name: p.product_name,
      category: p.category || '-',
      unit: p.unit || '-',
      guide_price: Number((latest[p.product_id] || {}).guide_price ?? p.guide_price) || 0,
      stock_qty: byProduct[p.product_id] || 0,
      trend: Math.random() < 0.3 ? 'up' : Math.random() < 0.7 ? 'flat' : 'down'
    }))
    topPrices.value = prices.value.slice(0, 5)

    // 公告
    const nc = await listNotice({ pageSize: 5 })
    notices.value = nc.list || []

    // 供货方（直接用产品里的 farmer 信息）
    const fset = new Map()
    products.value.forEach(p => {
      if (!p.farmer_name) return
      const fid = p.farmer_id || p.supply_farmer_id
      if (!fid || fset.has(fid)) return
      fset.set(fid, { farmer_id: fid, farmer_name: p.farmer_name, phone: p.farmer_phone || '', address: p.farmer_address || '产地直供', auth_status: p.farmer_auth_status ?? 1 })
    })
    suppliers.value = Array.from(fset.values()).slice(0, 6)
  } catch (e) {
    console.warn('首页数据加载失败', e)
  }
})
</script>

<style scoped>
.home-page { padding-bottom: 20px; }

/* Banner */
.banner-row { display: grid; grid-template-columns: 1fr 300px; gap: 18px; margin-top: 18px; }
.banner {
  background: linear-gradient(135deg, #0b4632 0%, #12694a 60%, #1a8a60 100%);
  border-radius: 12px; padding: 38px 42px; position: relative; overflow: hidden;
  box-shadow: 0 6px 20px rgba(18, 105, 74, .2);
}
.banner-inner { display: flex; justify-content: space-between; align-items: center; }
.banner-text { color: #fff; }
.banner-text h1 { font-size: 32px; font-weight: 800; margin: 0 0 10px; letter-spacing: 1px; }
.banner-text p { font-size: 14px; margin: 0 0 20px; opacity: .88; }
.banner-btn {
  display: inline-block; padding: 10px 28px; border-radius: 22px;
  background: #ffd24a; color: #1f3d2b; font-weight: 700; text-decoration: none; font-size: 14px;
  transition: transform .2s, box-shadow .2s;
}
.banner-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(255,210,74,.4); }
.banner-illus { position: relative; width: 120px; height: 120px; }
.illus-circle { position: absolute; inset: 0; border-radius: 50%; background: rgba(255,210,74,.15); }
.illus-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 72px; color: #ffd24a; animation: sun-spin 20s linear infinite; }
@keyframes sun-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

.banner-side { display: flex; flex-direction: column; gap: 14px; }
.side-card { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.05); overflow: hidden; }
.sc-head { padding: 10px 14px; background: #f9f9f9; font-size: 13.5px; font-weight: 700; color: #333; border-bottom: 1px solid #eee; }
.sc-list { list-style: none; margin: 0; padding: 10px 14px; font-size: 13px; line-height: 1.9; color: #555; max-height: 180px; overflow-y: auto; }
.sc-list li { text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
.sc-list li.empty { color: #bbb; font-style: italic; }

.stat-list { padding: 6px 14px 10px; }
.stat-item { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #f0f0f0; font-size: 12.5px; }
.stat-item:last-child { border-bottom: none; }
.si-name { color: #333; font-weight: 500; }
.si-price { color: #c81623; font-weight: 700; }
.si-trend { font-weight: 700; }
.si-trend.up { color: #10b981; }
.si-trend.down { color: #ef4444; }
.si-trend.flat { color: #999; }

/* 区块通用 */
.section { margin-top: 26px; background: #fff; border-radius: 10px; padding: 18px 22px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.section-head h2 { font-size: 17px; margin: 0; font-weight: 700; color: #1f3d2b; }
.more { font-size: 13px; color: #666; text-decoration: none; }
.more:hover { color: #12694a; }

/* 产品网格 */
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.product-card {
  background: #fff; border: 1px solid #eee; border-radius: 10px; cursor: pointer;
  transition: all .25s ease; overflow: hidden;
}
.product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(18, 105, 74, .15); border-color: #12694a; }
.pc-img { position: relative; height: 140px; background: linear-gradient(135deg, #f3f7f5, #e6f0ea); display: flex; align-items: center; justify-content: center; }
.pc-emoji { font-size: 58px; }
.cat-emoji.cat-蔬菜 { filter: drop-shadow(0 4px 8px rgba(16,185,129,.3)); }
.cat-emoji.cat-水果 { filter: drop-shadow(0 4px 8px rgba(239,68,68,.25)); }
.cat-emoji.cat-粮食 { filter: drop-shadow(0 4px 8px rgba(245,158,11,.3)); }
.cat-emoji.cat-畜禽 { filter: drop-shadow(0 4px 8px rgba(107,114,128,.25)); }
.pc-badge { position: absolute; top: 10px; left: 10px; background: rgba(18, 105, 74, .9); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
.pc-body { padding: 12px 14px; }
.pc-name { font-size: 15px; font-weight: 600; color: #1f3d2b; margin-bottom: 6px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
.pc-meta { display: flex; gap: 10px; font-size: 12px; color: #888; margin-bottom: 10px; }
.pc-meta .el-icon { vertical-align: -2px; }
.pc-footer { display: flex; justify-content: space-between; align-items: baseline; }
.pc-price { color: #c81623; font-size: 18px; font-weight: 800; }
.pc-price small { font-size: 11px; color: #999; font-weight: 400; margin-left: 2px; }
.pc-supply { font-size: 11.5px; color: #6b8a79; max-width: 120px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }

/* 行情表 */
.price-table :deep(.el-table__header th) { background: #f6f8f7 !important; color: #333; font-weight: 600; }
.price-val { color: #c81623; font-weight: 700; font-size: 15px; }
.qty-val { color: #12694a; font-weight: 500; }
.qty-empty { color: #bbb; font-style: italic; }

/* 供货方 */
.supplier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.supplier-card { display: flex; gap: 12px; padding: 14px; border: 1px solid #f0f0f0; border-radius: 10px; transition: all .2s; }
.supplier-card:hover { border-color: #12694a; box-shadow: 0 4px 12px rgba(0,0,0,.06); }
.sc-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #12694a, #1a8a60); color: #ffd24a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sc-avatar .el-icon { font-size: 22px; }
.sc-name { font-size: 14.5px; font-weight: 700; color: #1f3d2b; display: flex; align-items: center; gap: 6px; }
.sc-addr { font-size: 12px; color: #888; margin-top: 4px; }
.sc-info { display: flex; gap: 14px; font-size: 12px; color: #666; margin-top: 6px; }
.sc-good { color: #12694a; font-weight: 500; }
</style>
