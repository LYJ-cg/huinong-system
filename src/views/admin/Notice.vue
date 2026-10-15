<template>
  <div class="page-wrap">
    <div class="table-card">
      <div class="toolbar"><span class="title">消息通知</span><el-button type="primary" @click="open()">+ 发送通知</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="notice_type" label="类型" width="120"><template #default="{row}"><el-tag size="small">{{ row.notice_type }}</el-tag></template></el-table-column>
        <el-table-column prop="title" label="标题" width="180" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="接收人" width="120">
          <template #default="{row}">{{ row.receiver_type === 1 ? '农户#' + row.receiver_id : '用户#' + row.receiver_id }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center"><template #default="{row}"><el-tag :type="row.is_read?'success':'warning'" size="small">{{ row.is_read ? '已读' : '未读' }}</el-tag></template></el-table-column>
        <el-table-column prop="create_time" label="时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{row}"><el-button v-if="!row.is_read" type="primary" size="small" link @click="read(row)">标记已读</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
    <el-dialog v-model="dlg" title="发送通知" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="接收对象" required>
          <el-radio-group v-model="form.receiver_type"><el-radio :value="1">农户</el-radio><el-radio :value="2">系统用户</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="接收人ID" required><el-input-number v-model="form.receiver_id" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="form.notice_type" style="width:100%">
            <el-option label="送货提醒" value="送货提醒" /><el-option label="结算提醒" value="结算提醒" /><el-option label="库存预警" value="库存预警" /><el-option label="系统公告" value="系统公告" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容" required><el-input v-model="form.content" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="send">发送</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { listNotice, readNotice, sendNotice } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ page: 1, pageSize: 10 }); const dlg = ref(false); const form = reactive({})
async function load() { loading.value = true; const res = await listNotice(q); list.value = res.list; total.value = res.total; loading.value = false }
function open() { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, { receiver_type: 1, notice_type: '系统公告', receiver_id: 1 }); dlg.value = true }
async function send() {
  if (!form.title || !form.content || !form.receiver_id) return ElMessage.warning('请填写完整')
  await sendNotice({ ...form }); ElMessage.success('已发送'); dlg.value = false; load()
}
async function read(row) { await readNotice(row.notice_id); ElMessage.success('已标记'); load() }
load()
</script>
