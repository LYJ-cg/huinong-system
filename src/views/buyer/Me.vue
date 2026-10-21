<template>
  <el-card>
    <template #header><b>买方信息</b></template>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="买方名称">{{ buyer?.buyer_name }}</el-descriptions-item>
      <el-descriptions-item label="简称">{{ buyer?.short_name }}</el-descriptions-item>
      <el-descriptions-item label="买方类型">{{ buyer?.buyer_type }}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{ buyer?.contact }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ buyer?.phone }}</el-descriptions-item>
      <el-descriptions-item label="信用等级">{{ creditText }}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{ buyer?.address }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ buyer?.remark || '-' }}</el-descriptions-item>
    </el-descriptions>
    <div style="margin-top:18px">
      <el-button type="danger" @click="doLogout">退出登录</el-button>
    </div>
  </el-card>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
const auth = useAuthStore()
const router = useRouter()
const buyer = computed(() => auth.buyer)
const creditText = computed(() => {
  const m = { 1: '★', 2: '★★', 3: '★★★', 4: '★★★★' }
  return m[buyer.value?.credit_level] || '★★★'
})
function doLogout() { auth.logout(); router.push('/buyer/login') }
</script>
