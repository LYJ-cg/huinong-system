<template>
  <div class="page">
    <van-nav-bar title="我的收购单" left-arrow @click-left="$router.back()" />
    <van-tabs v-model:active="active" @change="load">
      <van-tab title="全部" :name="''" /><van-tab title="待确认" :name="0" /><van-tab title="已确认" :name="1" /><van-tab title="已锁定" :name="2" />
    </van-tabs>
    <div class="list">
      <van-cell-group inset v-for="o in list" :key="o.order_id" style="margin-top:10px">
        <van-cell>
          <template #title><span class="ono">{{ o.order_no }}</span></template>
          <template #value><van-tag :type="['warning','success','danger'][o.status]" size="mini">{{ ['待确认','已确认','已锁定'][o.status] }}</van-tag></template>
        </van-cell>
        <van-cell title="农产品" :value="o.product_name" />
        <van-cell title="净重" :value="o.net_weight + ' '" />
        <van-cell title="单价" :value="'¥' + o.price" />
        <van-cell title="扣杂" :value="'¥' + o.deduct_amount" />
        <van-cell title="总金额"><template #value><span class="amt">¥{{ o.total_amount }}</span></template></van-cell>
        <van-cell title="质检等级" :value="o.quality_grade || '-'" />
        <van-cell title="收购时间" :value="o.purchase_date" />
        <div class="action" v-if="o.status===0">
          <van-button type="success" size="small" round @click="confirm(o)">确认收购单</van-button>
        </div>
      </van-cell-group>
      <van-empty v-if="!list.length" description="暂无收购单" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import { useAuthStore } from '@/store/auth'
import { listOrder, confirmOrder } from '@/api'
const auth = useAuthStore(); const farmer = auth.farmer
const active = ref('')
const list = ref([])
async function load() {
  const res = await listOrder({ farmer_id: farmer.farmer_id, status: active.value, pageSize: 999 })
  list.value = res.list
}
async function confirm(o) {
  await confirmOrder(o.order_id, true)
  showSuccessToast('已确认')
  load()
}
onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.list { padding-bottom: 20px; }
.ono { font-weight: 700; color: #323233; }
.amt { color: #f56c6c; font-weight: 700; font-size: 16px; }
.action { padding: 8px 14px 14px; text-align: right; }
</style>
