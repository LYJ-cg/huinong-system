<template>
  <div class="suppliers-page container">
    <div class="breadcrumb"><router-link to="/">首页</router-link> <span>/</span> 供货方名录</div>
    <el-table :data="list" stripe class="supplier-table">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column label="农户" width="160">
        <template #default="{ row }">
          <div class="sb-cell">
            <div class="sb-avatar"><el-icon><Sunny /></el-icon></div>
            <div><div class="sb-name">{{ row.farmer_name }}</div><div class="sb-sub">{{ row.phone }}</div></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="产地地址" min-width="200">
        <template #default="{ row }">📍 {{ row.address || '产地直供' }}</template>
      </el-table-column>
      <el-table-column label="认证状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.auth_status === 1" type="success" effect="light">已认证</el-tag>
          <el-tag v-else type="warning" effect="plain">待认证</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="供应产品" min-width="260">
        <template #default="{ row }">
          <div v-if="row.products?.length" class="p-list">
            <router-link
              v-for="p in row.products" :key="p.product_id"
              :to="`/product/${p.product_id}`"
              class="p-chip"
            >{{ p.product_name }}</router-link>
          </div>
          <span v-else class="empty-tip">暂无供应</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Sunny } from '@element-plus/icons-vue'
import { listFarmer, listSupply, listProduct } from '@/api'

const list = ref([])

onMounted(async () => {
  const fs = await listFarmer({ pageSize: 500 })
  const sp = await listSupply({ pageSize: 1000 })
  const pp = await listProduct({ pageSize: 500 })

  list.value = fs.list.map(f => {
    const mySupplies = sp.list.filter(s => s.farmer_id === f.farmer_id && s.audit_status === 1)
    const productIds = new Set(mySupplies.map(s => s.product_id))
    const products = pp.list.filter(p => productIds.has(p.product_id))
    return { ...f, products }
  })
})
</script>

<style scoped>
.suppliers-page { background: #fff; border-radius: 10px; padding: 22px 26px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.breadcrumb { font-size: 13px; color: #666; margin-bottom: 14px; }
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb a:hover { color: #12694a; }
.breadcrumb span { margin: 0 6px; color: #ccc; }

.supplier-table :deep(.el-table__header th) { background: #f6f8f7 !important; font-weight: 600; }
.sb-cell { display: flex; align-items: center; gap: 10px; }
.sb-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #12694a, #1a8a60); color: #ffd24a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sb-avatar .el-icon { font-size: 16px; }
.sb-name { font-weight: 700; color: #1f3d2b; }
.sb-sub { font-size: 11.5px; color: #999; margin-top: 2px; }

.p-list { display: flex; flex-wrap: wrap; gap: 6px; }
.p-chip { font-size: 12px; color: #12694a; background: #e8f5e9; border: 1px solid #c8e6c9; padding: 2px 10px; border-radius: 10px; text-decoration: none; transition: all .15s; }
.p-chip:hover { background: #12694a; color: #fff; }
.empty-tip { color: #bbb; font-style: italic; font-size: 12px; }
</style>
