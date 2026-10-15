<template>
  <div class="home">
    <div class="header">
      <div class="user">
        <van-image round width="50" height="50" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
        <div class="info"><div class="name">{{ farmer.farmer_name }}</div><div class="addr">{{ farmer.address || '未设置地址' }}</div></div>
        <van-icon name="bell" size="22" @click="$router.push('/m/notice')" />
      </div>
      <div class="stat">
        <div class="stat-item"><div class="num">{{ stats.supply }}</div><div class="lbl">供货记录</div></div>
        <div class="stat-item"><div class="num">¥{{ stats.income }}</div><div class="lbl">累计结算</div></div>
        <div class="stat-item"><div class="num">{{ stats.unread }}</div><div class="lbl">未读消息</div></div>
      </div>
    </div>
    <div class="grid">
      <div class="grid-item" v-for="g in funcs" :key="g.path" @click="$router.push(g.path)">
        <van-icon :name="g.icon" size="30" :color="g.color" />
        <div class="g-name">{{ g.name }}</div>
      </div>
    </div>
    <div class="section">
      <div class="sec-title">今日收购指导价</div>
      <van-cell v-for="p in prices" :key="p.product_id">
        <template #title><span class="pn">{{ p.product_name }}</span><van-tag plain type="success" size="mini">{{ p.category }}</van-tag></template>
        <template #value><span class="pp">¥{{ p.guide_price }}/{{ p.unit }}</span></template>
      </van-cell>
    </div>
    <div class="section">
      <div class="sec-title">最新通知</div>
      <van-cell v-for="n in notices.slice(0,3)" :key="n.notice_id" :title="n.title" :label="n.create_time" is-link @click="$router.push('/m/notice')" />
      <van-empty v-if="!notices.length" description="暂无通知" image-size="60" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { listSupply, listSettlement, listNotice, listProduct, listPrice } from '@/api'
const auth = useAuthStore()
const farmer = auth.farmer || {}
const funcs = [
  { name: '发布供货', path: '/m/supply', icon: 'add-o', color: '#2da64a' },
  { name: '我的收购单', path: '/m/orders', icon: 'balance-list-o', color: '#409eff' },
  { name: '结算查询', path: '/m/settlement', icon: 'gold-coin-o', color: '#e6a23c' },
  { name: '指导价/行情', path: '/m/price', icon: 'chart-trending-o', color: '#9254de' },
  { name: '消息通知', path: '/m/notice', icon: 'bell', color: '#13c2c2' }
]
const stats = ref({ supply: 0, income: '0.00', unread: 0 })
const prices = ref([])
const notices = ref([])
onMounted(async () => {
  const fid = farmer.farmer_id
  const [sp, st, nt, pr, pv] = await Promise.all([
    listSupply({ farmer_id: fid, pageSize: 999 }),
    listSettlement({ farmer_id: fid, pageSize: 999 }),
    listNotice({ receiver_type: 1, receiver_id: fid, pageSize: 999 }),
    listProduct({ pageSize: 999 }),
    listPrice({ pageSize: 5 })
  ])
  stats.value = {
    supply: sp.total,
    income: st.list.filter(s => s.status >= 1).reduce((a, b) => a + Number(b.total_amount), 0).toFixed(2),
    unread: nt.list.filter(n => !n.is_read).length
  }
  prices.value = pr.list.slice(0, 6).map(p => ({ ...p, ...pv.list.find(x => x.product_id === p.product_id) }))
  notices.value = nt.list
})
</script>

<style scoped>
.home { min-height: 100vh; background: #f7f8fa; }
.header { background: linear-gradient(135deg, #2da64a, #1e7d36); color: #fff; padding: 24px 16px 30px; }
.user { display: flex; align-items: center; gap: 12px; }
.user .info { flex: 1; }
.name { font-size: 18px; font-weight: 700; }
.addr { font-size: 12px; opacity: .85; margin-top: 2px; }
.stat { display: flex; margin-top: 20px; background: rgba(255,255,255,.15); border-radius: 10px; padding: 14px 0; }
.stat-item { flex: 1; text-align: center; }
.stat-item .num { font-size: 20px; font-weight: 700; }
.stat-item .lbl { font-size: 12px; opacity: .85; margin-top: 2px; }
.grid { margin: -18px 10px 0; background: #fff; border-radius: 12px; padding: 16px 8px; display: grid; grid-template-columns: repeat(3,1fr); }
.grid-item { text-align: center; padding: 10px 0; }
.g-name { font-size: 13px; color: #646566; margin-top: 6px; }
.section { margin: 12px 10px 0; background: #fff; border-radius: 12px; overflow: hidden; }
.sec-title { font-weight: 700; padding: 12px 14px 4px; font-size: 15px; }
.pn { margin-right: 6px; }
.pp { color: #f56c6c; font-weight: 600; }
</style>
