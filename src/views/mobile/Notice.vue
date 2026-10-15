<template>
  <div class="page">
    <van-nav-bar title="消息通知" left-arrow @click-left="$router.back()" />
    <van-tabs v-model:active="active" @change="load">
      <van-tab title="未读" :name="0" /><van-tab title="全部" :name="''" />
    </van-tabs>
    <div class="list">
      <van-cell-group inset v-for="n in list" :key="n.notice_id" style="margin-top:10px">
        <van-cell>
          <template #title><van-tag :type="tagType(n.notice_type)" size="mini">{{ n.notice_type }}</van-tag> <span class="nt">{{ n.title }}</span></template>
          <template #value><van-tag v-if="!n.is_read" type="danger" size="mini">未读</van-tag></template>
        </van-cell>
        <van-cell title="" :label="n.content" />
        <van-cell title="" :value="n.create_time" />
        <div class="action" v-if="!n.is_read"><van-button type="primary" size="small" round @click="read(n)">标记已读</van-button></div>
      </van-cell-group>
      <van-empty v-if="!list.length" description="暂无消息" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import { useAuthStore } from '@/store/auth'
import { listNotice, readNotice } from '@/api'
const auth = useAuthStore(); const farmer = auth.farmer
const active = ref(0); const list = ref([])
async function load() {
  const res = await listNotice({ receiver_type: 1, receiver_id: farmer.farmer_id, pageSize: 999 })
  list.value = active.value === 0 ? res.list.filter(n => !n.is_read) : res.list
}
function tagType(t) { return { '送货提醒': 'success', '结算提醒': 'warning', '库存预警': 'danger', '系统公告': 'primary' }[t] || 'default' }
async function read(n) { await readNotice(n.notice_id); showSuccessToast('已读'); load() }
onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.list { padding-bottom: 20px; }
.nt { font-weight: 600; margin-left: 4px; }
.action { padding: 4px 14px 12px; text-align: right; }
</style>
