<template>
  <div>
    <div class="welcome">
      <el-icon class="wave"><Sunny /></el-icon>
      <div>
        <h2>欢迎，{{ buyer?.buyer_name }}</h2>
        <p>买方信用等级：{{ creditText }}　|　类型：{{ buyer?.buyer_type }}</p>
      </div>
    </div>
    <el-row :gutter="14" class="stat-row">
      <el-col :span="6"><el-card class="stat-card"><el-statistic title="产品数量" :value="stats.productCount" /></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><el-statistic title="有效预订" :value="stats.myOrderCount" /></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><el-statistic title="待审核预订" :value="stats.pending" /></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><el-statistic title="累计消费" :value="stats.totalBuy" prefix="¥" /></el-card></el-col>
    </el-row>
    <el-row :gutter="14">
      <el-col :span="12">
        <el-card><template #header>我的预订进度</template>
          <el-table :data="recent" size="small" empty-text="暂无订单">
            <el-table-column prop="order_no" label="订单号" width="170" />
            <el-table-column prop="product_name" label="产品" width="120" />
            <el-table-column prop="quantity" label="数量" width="80" align="right" />
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.audit_status === 0" type="info" size="small">待销售审核</el-tag>
                <el-tag v-else-if="row.audit_status === 2" type="danger" size="small">已拒绝</el-tag>
                <el-tag v-else type="success" size="small">{{ pickText(row.pick_status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card><template #header>快捷操作</template>
          <div class="quick-grid">
            <div class="quick-item" @click="$router.push('/buyer/order/new')">
              <el-icon class="qi"><EditPen /></el-icon><div>提交预订</div>
            </div>
            <div class="quick-item" @click="$router.push('/buyer/product')">
              <el-icon class="qi"><Goods /></el-icon><div>浏览产品</div>
            </div>
            <div class="quick-item" @click="$router.push('/buyer/supply')">
              <el-icon class="qi"><User /></el-icon><div>查看供货方</div>
            </div>
            <div class="quick-item" @click="$router.push('/buyer/notice')">
              <el-icon class="qi"><Bell /></el-icon><div>消息通知</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { listProduct, listBuyerOrder } from '@/api'
const auth = useAuthStore()
const buyer = computed(() => auth.buyer)
const stats = ref({ productCount: 0, myOrderCount: 0, pending: 0, totalBuy: 0 })
const recent = ref([])
const creditText = computed(() => {
  const m = { 1: '★', 2: '★★', 3: '★★★', 4: '★★★★' }
  return m[buyer.value?.credit_level] || '★★★'
})
function pickText(s) {
  const m = { 0: '待收购', 1: '收购中', 2: '已入库', 3: '已交付' }
  return m[s] || '-'
}
onMounted(async () => {
  const pc = await listProduct({ pageSize: 1 })
  stats.value.productCount = pc.total
  if (buyer.value) {
    const os = await listBuyerOrder({ buyer_id: buyer.value.buyer_id, pageSize: 100 })
    stats.value.myOrderCount = os.total
    stats.value.pending = os.list.filter(x => x.audit_status === 0).length
    stats.value.totalBuy = os.list.filter(x => x.pick_status === 2 || x.pick_status === 3)
      .reduce((s, o) => s + Number(o.quantity) * (o.expected_price || 0), 0).toFixed(2)
    recent.value = os.list.slice(0, 5)
  }
})
</script>
<style scoped>
.welcome { background: linear-gradient(90deg,#0a543a,#1f3d2b); color: #fff; border-radius: 8px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
.welcome h2 { margin: 0 0 6px; font-size: 20px; }
.welcome p { margin: 0; opacity: .85; font-size: 13px; }
.wave { font-size: 48px; color: #ffd24a; }
.stat-row { margin-bottom: 14px; }
.stat-card { text-align: center; }
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.quick-item { text-align: center; padding: 18px 8px; border: 1px dashed #0a543a; border-radius: 8px; cursor: pointer; transition: all .2s; }
.quick-item:hover { background: #e8f5e9; border-style: solid; }
.qi { font-size: 28px; color: #0a543a; margin-bottom: 6px; display: block; }
</style>
