<template>
  <div class="detail-page container" v-if="product">
    <div class="breadcrumb">
      <router-link to="/">首页</router-link> <span>/</span>
      <router-link to="/products">全部商品</router-link> <span>/</span>
      {{ product.category }} <span>/</span> <b>{{ product.product_name }}</b>
    </div>

    <div class="detail-main">
      <div class="dm-left">
        <div class="dm-img">
          <el-icon class="big-emoji">{{ catIcon(product.category) }}</el-icon>
          <div class="dm-tag">{{ product.category }}</div>
        </div>
      </div>
      <div class="dm-right">
        <h1 class="dm-title">{{ product.product_name }}</h1>
        <p class="dm-subtitle">产地直供 · 质量可追溯 · 新鲜直达</p>

        <div class="price-box">
          <span class="price-label">指导价</span>
          <span class="price-value">¥{{ product.guide_price }}</span>
          <span class="price-unit">/ {{ product.unit }}</span>
          <el-tag size="small" type="warning" effect="plain" class="price-tip">官方指导价</el-tag>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">当前库存</span>
            <span class="info-val">
              <span v-if="product.stock_qty > 0" class="stock-ok">{{ product.stock_qty }} {{ product.unit }}</span>
              <span v-else class="stock-empty">暂无现货</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">保质期</span>
            <span class="info-val">{{ product.shelf_life }} 天</span>
          </div>
          <div class="info-item">
            <span class="info-label">计量单位</span>
            <span class="info-val">{{ product.unit }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">分类</span>
            <span class="info-val">{{ product.category }}</span>
          </div>
        </div>

        <div class="supply-box" v-if="product.farmer_name">
          <div class="sb-title">供货方信息</div>
          <div class="sb-row">
            <el-icon class="sb-ico"><Sunny /></el-icon>
            <div class="sb-info">
              <div class="sb-name">
                {{ product.farmer_name }}
                <el-tag v-if="product.farmer_auth_status === 1" size="small" type="success" effect="plain">已认证</el-tag>
              </div>
              <div class="sb-meta">📍 {{ product.farmer_address || '产地直供' }}　·　📞 {{ product.farmer_phone }}</div>
            </div>
          </div>
        </div>

        <div class="action-box">
          <el-button class="btn-order" type="primary" size="large" :disabled="product.stock_qty === 0" @click="goOrder">
            📝 立即预订
          </el-button>
          <el-button class="btn-contact" size="large">💬 联系供货方</el-button>
          <div class="tip" v-if="!auth.isBuyer">
            <el-icon><InfoFilled /></el-icon> 预订前请先 <router-link to="/login">登录买方账号</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-tabs">
      <el-tabs v-model="tab">
        <el-tab-pane label="产品详情" name="desc">
          <div class="tab-content">
            <h3>📋 产品描述</h3>
            <p>【{{ product.product_name }}】属于 <b>{{ product.category }}</b> 类农产品，产地直供。官方指导价 <b class="price-text">¥{{ product.guide_price }}/{{ product.unit }}</b>，保鲜期约 <b>{{ product.shelf_life }} 天</b>。</p>
            <p>当前可售库存 <b>{{ product.stock_qty || 0 }} {{ product.unit }}</b>，由 <b>{{ product.farmer_name || '产地农户' }}</b> 直接供货，全程品质管控。</p>

            <h3>✅ 质量保障</h3>
            <ul class="feature-list">
              <li>🎯 产地直采，不经二次周转</li>
              <li>🧊 全程冷链运输，新鲜到家</li>
              <li>📦 可按买方订单规格定制包装</li>
              <li>🔍 支持批次溯源，透明可查</li>
            </ul>
          </div>
        </el-tab-pane>
        <el-tab-pane label="规格参数" name="spec">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="产品名称">{{ product.product_name }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ product.category }}</el-descriptions-item>
            <el-descriptions-item label="计量单位">{{ product.unit }}</el-descriptions-item>
            <el-descriptions-item label="保质期">{{ product.shelf_life }} 天</el-descriptions-item>
            <el-descriptions-item label="官方指导价">¥{{ product.guide_price }} / {{ product.unit }}</el-descriptions-item>
            <el-descriptions-item label="当前库存">{{ product.stock_qty || 0 }} {{ product.unit }}</el-descriptions-item>
            <el-descriptions-item label="供货方">{{ product.farmer_name || '—' }}</el-descriptions-item>
            <el-descriptions-item label="供货方认证">{{ product.farmer_auth_status === 1 ? '已认证' : '待认证' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Sunny, InfoFilled } from '@element-plus/icons-vue'
import { listProduct, listStock, listSupply } from '@/api'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const tab = ref('desc')
const product = ref(null)

function catIcon(c) {
  const m = { 蔬菜: '🥬', 水果: '🍎', 粮食: '🌾', 畜禽: '🐔' }
  return m[c] || '🌿'
}
function goOrder() {
  if (!auth.isBuyer) { router.push({ path: '/login', query: { role: 'buyer' } }); return }
  router.push({ path: '/buyer/order/new', query: { product_id: product.value.product_id } })
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) { router.replace('/products'); return }
  const pp = await listProduct({ pageSize: 500 })
  const st = await listStock({ pageSize: 1000 })
  const byP = {}
  st.list.forEach(s => { byP[s.product_id] = (byP[s.product_id] || 0) + Number(s.quantity) })
  const target = pp.list.find(p => p.product_id === id)
  if (!target) { router.replace('/products'); return }

  // 补充供货方信息（来自 supply_info 关联）
  const sp = await listSupply({ pageSize: 1000 })
  const relatedSupply = sp.list.find(s => s.product_id === id && s.audit_status === 1)

  product.value = {
    ...target,
    stock_qty: byP[id] || 0,
    farmer_name: relatedSupply?.farmer_name || null,
    farmer_phone: relatedSupply?.farmer_phone || '',
    farmer_address: relatedSupply?.farmer_address || '',
    farmer_auth_status: relatedSupply?.farmer_auth_status ?? 0
  }
})
</script>

<style scoped>
.detail-page { background: #fff; border-radius: 10px; padding: 22px 26px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.breadcrumb { font-size: 13px; color: #666; margin-bottom: 18px; }
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb a:hover { color: #12694a; }
.breadcrumb span { margin: 0 6px; color: #ccc; }
.breadcrumb b { color: #333; }

.detail-main { display: grid; grid-template-columns: 320px 1fr; gap: 40px; margin-bottom: 24px; }
.dm-img { position: relative; height: 300px; background: linear-gradient(135deg, #f3f7f5, #e6f0ea); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 40px rgba(18,105,74,.08); }
.big-emoji { font-size: 150px; }
.dm-tag { position: absolute; top: 14px; left: 14px; background: rgba(18, 105, 74, .92); color: #fff; padding: 4px 12px; border-radius: 14px; font-size: 13px; font-weight: 600; }

.dm-title { font-size: 24px; font-weight: 800; color: #1f3d2b; margin: 0 0 6px; }
.dm-subtitle { font-size: 13px; color: #888; margin: 0 0 16px; }
.price-box { background: #fff3e0; border-radius: 10px; padding: 16px 20px; margin-bottom: 18px; display: flex; align-items: baseline; gap: 6px; }
.price-label { font-size: 13px; color: #b86d00; margin-right: 8px; }
.price-value { font-size: 30px; font-weight: 900; color: #c81623; }
.price-unit { font-size: 13px; color: #999; }
.price-tip { margin-left: 10px; }

.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 18px; margin-bottom: 16px; }
.info-item { display: flex; padding: 8px 0; border-bottom: 1px dashed #f0f0f0; }
.info-label { width: 80px; color: #888; font-size: 13px; }
.info-val { color: #1f3d2b; font-weight: 500; font-size: 13.5px; }
.stock-ok { color: #12694a; font-weight: 700; }
.stock-empty { color: #bbb; font-style: italic; }

.supply-box { background: #f6faf7; border: 1px solid #d7e9de; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; }
.sb-title { font-size: 13px; color: #6b8a79; margin-bottom: 10px; font-weight: 700; }
.sb-row { display: flex; align-items: center; gap: 12px; }
.sb-ico { width: 36px; height: 36px; background: linear-gradient(135deg, #12694a, #1a8a60); border-radius: 50%; color: #ffd24a; font-size: 20px; display: flex; align-items: center; justify-content: center; }
.sb-name { font-size: 15px; font-weight: 700; color: #1f3d2b; display: flex; align-items: center; gap: 6px; }
.sb-meta { font-size: 12px; color: #7a8a82; margin-top: 4px; }

.action-box { display: flex; align-items: center; gap: 14px; margin-top: 8px; }
.btn-order { background: linear-gradient(135deg, #c81623, #e53935) !important; border-color: #c81623 !important; padding: 0 34px !important; height: 44px !important; font-weight: 700 !important; font-size: 15px !important; border-radius: 22px !important; }
.btn-order:hover { box-shadow: 0 6px 16px rgba(200,22,35,.4); }
.btn-contact { border-radius: 22px; height: 44px; }
.tip { margin-left: 4px; font-size: 12px; color: #888; display: flex; align-items: center; gap: 3px; }
.tip a { color: #12694a; text-decoration: none; font-weight: 500; }

.detail-tabs { margin-top: 14px; }
.detail-tabs :deep(.el-tabs__item) { font-size: 14px; }
.tab-content { padding: 10px 0; }
.tab-content h3 { font-size: 15px; color: #1f3d2b; margin: 16px 0 10px; font-weight: 700; }
.tab-content p { font-size: 14px; color: #4a5c53; line-height: 1.8; margin: 0 0 8px; }
.price-text { color: #c81623; }
.feature-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.feature-list li { padding: 8px 14px; background: #f6faf7; border-radius: 6px; font-size: 13px; color: #1f3d2b; }
</style>
