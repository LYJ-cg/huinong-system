<template>
  <div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column label="已读" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.is_read?'info':'warning'" size="small">{{ row.is_read?'已读':'未读' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="notice_type" label="类型" width="120" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="content" label="内容" min-width="300" />
      <el-table-column prop="create_time" label="时间" width="160" />
    </el-table>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { listNotice, readNotice } from '@/api'
const auth = useAuthStore()
const loading = ref(false); const list = ref([])
async function load() {
  loading.value = true
  // receiver_type=4 表示买方通知
  const r = await listNotice({ receiver_type: 4, receiver_id: auth.buyer?.buyer_id, pageSize: 999 })
  list.value = r.list
  // 全部标记已读
  r.list.filter(n => !n.is_read).forEach(n => readNotice(n.notice_id))
  loading.value = false
}
onMounted(load)
</script>
