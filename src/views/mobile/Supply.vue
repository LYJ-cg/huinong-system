<template>
  <div class="page">
    <van-nav-bar title="发布供货信息" left-arrow @click-left="$router.back()" />
    <van-form @submit="onSubmit" style="margin-top:10px">
      <van-cell-group inset>
        <van-field label="农户">{{ farmer.farmer_name }}</van-field>
        <van-field label="农产品" is-link readonly :model-value="prodName" placeholder="请选择农产品" @click="showPicker = true" :rules="[{required:true,message:'请选择农产品'}]" />
        <van-field label="预计数量" type="number" v-model="form.expect_qty" placeholder="请输入预计数量" :rules="[{required:true,message:'请填写数量'}]">
          <template #button>{{ unit }}</template>
        </van-field>
        <van-field label="预计采收期" is-link readonly :model-value="form.harvest_date" placeholder="选择日期" @click="showCal = true" :rules="[{required:true,message:'请选择日期'}]" />
        <van-field label="供货地点" v-model="form.address" placeholder="供货地点" />
        <van-field label="备注" v-model="form.remark" type="textarea" rows="2" placeholder="品质说明等" />
      </van-cell-group>
      <div style="margin:16px"><van-button round block type="success" native-type="submit" :loading="loading">提交供货申请</van-button></div>
    </van-form>

    <div class="section">
      <div class="sec-title">我的供货记录</div>
      <van-cell v-for="s in records" :key="s.supply_id">
        <template #title>
          <div class="rec"><span class="rp">{{ s.product_name }}</span><van-tag size="mini" plain>{{ s.expect_qty }} {{ s.unit }}</van-tag></div>
          <div class="rd">采收期 {{ s.harvest_date }}</div>
        </template>
        <template #value>
          <van-tag :type="statusType(s.audit_status)" size="mini">{{ statusText(s.audit_status) }}</van-tag>
        </template>
      </van-cell>
      <van-empty v-if="!records.length" description="暂无供货记录" image-size="60" />
    </div>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker :columns="products.map(p=>({text:p.product_name+' ¥'+p.guide_price+'/'+p.unit,value:p.product_id,unit:p.unit}))" @confirm="onPick" @cancel="showPicker=false" />
    </van-popup>
    <van-calendar v-model:show="showCal" @confirm="onDate" :min-date="minDate" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import { useAuthStore } from '@/store/auth'
import { listProduct, listSupply, saveSupply } from '@/api'
const auth = useAuthStore(); const farmer = auth.farmer
const loading = ref(false); const showPicker = ref(false); const showCal = ref(false)
const form = reactive({ product_id: null, expect_qty: '', harvest_date: '', address: '', remark: '' })
const products = ref([]); const records = ref([])
const unit = computed(() => { const p = products.value.find(x => x.product_id === form.product_id); return p ? p.unit : '' })
const prodName = computed(() => { const p = products.value.find(x => x.product_id === form.product_id); return p ? p.product_name : '' })
const minDate = new Date()
function onPick({ selectedValues }) { form.product_id = selectedValues[0]; showPicker.value = false }
function onDate(d) { form.harvest_date = d.toISOString().slice(0, 10); showCal.value = false }
function statusType(s) { return ['warning', 'success', 'danger'][s] }
function statusText(s) { return ['待审核', '已通过', '已驳回'][s] }
async function onSubmit() {
  loading.value = true
  await saveSupply({ ...form, farmer_id: farmer.farmer_id })
  loading.value = false
  showSuccessToast('供货申请已提交，等待审核')
  Object.assign(form, { product_id: null, expect_qty: '', harvest_date: '', address: '', remark: '' })
  load()
}
async function load() { const [pr, rs] = await Promise.all([listProduct({ pageSize: 999 }), listSupply({ farmer_id: farmer.farmer_id, pageSize: 999 })]); products.value = pr.list; records.value = rs.list }
onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: 20px; }
.section { margin: 12px 10px 0; background: #fff; border-radius: 12px; overflow: hidden; }
.sec-title { font-weight: 700; padding: 12px 14px 4px; font-size: 15px; }
.rec { display: flex; align-items: center; gap: 8px; } .rp { font-weight: 600; }
.rd { font-size: 12px; color: #969799; margin-top: 2px; }
</style>
