<template>
  <div class="page">
    <van-nav-bar title="结算查询" left-arrow @click-left="$router.back()" />
    <div class="summary">
      <div class="s-row"><span>累计结算金额</span><span class="big">¥{{ totalIncome }}</span></div>
      <div class="s-row"><span>已确认</span><span>{{ confirmed }} 笔</span></div>
    </div>
    <div class="list">
      <van-cell-group inset v-for="s in list" :key="s.settlement_id" style="margin-top:10px">
        <van-cell>
          <template #title><span class="ono">{{ s.settlement_no }}</span></template>
          <template #value><van-tag :type="['warning','','success'][s.status]" size="mini">{{ ['待打款','已打款','已确认'][s.status] }}</van-tag></template>
        </van-cell>
        <van-cell title="结算区间" :value="s.start_date + ' ~ ' + s.end_date" />
        <van-cell title="结算金额"><template #value><span class="amt">¥{{ s.total_amount }}</span></template></van-cell>
        <van-cell title="支付方式" :value="s.pay_method || '-'" />
        <van-cell title="打款时间" :value="s.pay_time || '-'" />
        <div class="action" v-if="s.status===1">
          <van-button type="success" size="small" round @click="confirm(s)">确认收款</van-button>
        </div>
      </van-cell-group>
      <van-empty v-if="!list.length" description="暂无结算记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showSuccessToast } from 'vant'
import { useAuthStore } from '@/store/auth'
import { listSettlement, confirmSettlement } from '@/api'
const auth = useAuthStore(); const farmer = auth.farmer
const list = ref([])
const totalIncome = computed(() => list.value.reduce((a, b) => a + Number(b.total_amount), 0).toFixed(2))
const confirmed = computed(() => list.value.filter(s => s.status >= 1).length)
async function load() { const res = await listSettlement({ farmer_id: farmer.farmer_id, pageSize: 999 }); list.value = res.list }
async function confirm(s) { await confirmSettlement(s.settlement_id); showSuccessToast('已确认收款'); load() }
onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.summary { background: linear-gradient(135deg, #2da64a, #1e7d36); color: #fff; padding: 18px 16px; }
.s-row { display: flex; justify-content: space-between; align-items: center; margin: 6px 0; }
.big { font-size: 22px; font-weight: 700; }
.list { padding-bottom: 20px; }
.ono { font-weight: 700; }
.amt { color: #f56c6c; font-weight: 700; font-size: 16px; }
.action { padding: 8px 14px 14px; text-align: right; }
</style>
