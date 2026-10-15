<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-input v-model="q.keyword" placeholder="操作内容/用户名" clearable style="width:240px" @keyup.enter="load" />
      <el-button type="primary" @click="load">查询</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">操作日志（留痕可追溯）</span></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column type="index" label="序" width="50" align="center" />
        <el-table-column prop="user_name" label="操作人" width="100" />
        <el-table-column prop="operation" label="操作描述" show-overflow-tooltip />
        <el-table-column prop="method" label="请求方法" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="create_time" label="操作时间" width="160" />
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { listLog } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ keyword: '', page: 1, pageSize: 10 })
async function load() { loading.value = true; const res = await listLog(q); list.value = res.list; total.value = res.total; loading.value = false }
load()
</script>
