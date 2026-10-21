<template>
  <div>
    <el-card>
      <template #header><b>买方预订下单</b></template>
      <el-form :model="form" label-width="110px" size="default">
        <el-form-item label="预订方式" required>
          <el-radio-group v-model="mode">
            <el-radio label="exist">选择已有产品</el-radio>
            <el-radio label="custom">预订系统中没有的新产品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="mode === 'exist'" label="产品" required>
          <el-select v-model="form.product_id" filterable style="width:100%" @change="onPickExist">
            <el-option v-for="p in products" :key="p.product_id" :label="`${p.product_name}（${p.category}，${p.unit}，指导价 ¥${p.guide_price}）`" :value="p.product_id" />
          </el-select>
        </el-form-item>
        <template v-else>
          <el-form-item label="新产品名称" required>
            <el-input v-model="form.custom_product_name" placeholder="例如：胡萝卜、山药" />
          </el-form-item>
          <el-form-item label="产品类别">
            <el-select v-model="customCategory" style="width:100%">
              <el-option label="蔬菜" value="蔬菜" />
              <el-option label="水果" value="水果" />
              <el-option label="粮食" value="粮食" />
              <el-option label="畜禽" value="畜禽" />
              <el-option label="水产" value="水产" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </template>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="数量" required>
              <el-input-number v-model="form.quantity" :min="1" :precision="2" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位">
              <el-input v-model="form.unit" :disabled="mode === 'exist'" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="期望单价">
              <el-input-number v-model="form.expected_price" :min="0" :precision="2" controls-position="right" style="width:100%" placeholder="可留空，由销售管理员定价" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期望到货日期" required>
              <el-date-picker v-model="form.expected_date" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.buyer_note" type="textarea" :rows="3" placeholder="如：要求当日新鲜、需清洗装箱等要求" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submit">提交预订</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-alert title="温馨提示：销售管理员审核通过后，若系统有库存将直接安排出库，否则将由收购管理员按您的需求统筹收购。" type="info" :closable="false" show-icon style="margin-top:14px" />
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listProduct, submitBuyerOrder } from '@/api'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const mode = ref('exist')
const loading = ref(false)
const customCategory = ref('其他')
const products = ref([])
const form = reactive({
  product_id: null, custom_product_name: '', unit: '斤', quantity: 100,
  expected_date: '', expected_price: null, buyer_note: ''
})

async function loadProducts() {
  const r = await listProduct({ pageSize: 999 })
  products.value = r.list.filter(p => p.status === 1)
  if (route.query.product_id) {
    form.product_id = Number(route.query.product_id)
    onPickExist(form.product_id)
  }
}
function onPickExist(id) {
  const p = products.value.find(x => x.product_id === id)
  if (p) { form.unit = p.unit; form.expected_price = p.guide_price }
}

watch(mode, m => {
  // 切换模式时清空对应字段
  if (m === 'exist') form.custom_product_name = ''
  else { form.product_id = null; form.unit = '斤' }
})

function reset() {
  mode.value = 'exist'
  Object.assign(form, { product_id: null, custom_product_name: '', unit: '斤', quantity: 100, expected_date: '', expected_price: null, buyer_note: '' })
}

async function submit() {
  if (!form.quantity || form.quantity < 1) return ElMessage.warning('请填写有效数量')
  if (!form.expected_date) return ElMessage.warning('请选择期望到货日期')
  if (mode.value === 'exist' && !form.product_id) return ElMessage.warning('请选择产品')
  if (mode.value === 'custom' && !form.custom_product_name.trim()) return ElMessage.warning('请填写新产品名称')
  loading.value = true
  const res = await submitBuyerOrder(form, auth.buyer?.buyer_id)
  loading.value = false
  if (res.ok) {
    ElMessage.success(`预订已提交，订单号 ${res.order_no}`)
    router.push('/buyer/orders')
  } else ElMessage.error(res.msg)
}

onMounted(loadProducts)
</script>
