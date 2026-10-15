<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-select v-model="q.channel_type" placeholder="渠道类型" clearable style="width:160px">
        <el-option v-for="t in types" :key="t" :label="t" :value="t" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">销售渠道管理</span><el-button type="primary" @click="open()">+ 新增渠道</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column type="index" label="序" width="50" align="center" />
        <el-table-column prop="channel_name" label="渠道名称" width="160" />
        <el-table-column label="类型" width="100"><template #default="{row}"><el-tag type="success" effect="plain">{{ row.channel_type }}</el-tag></template></el-table-column>
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center"><template #default="{row}"><el-tag :type="row.status?'success':'info'">{{ row.status ? '合作中' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{row}">
            <el-button type="primary" size="small" link @click="open(row)">编辑</el-button>
            <el-button :type="row.status?'warning':'success'" size="small" link @click="toggle(row)">{{ row.status ? '停用' : '启用' }}</el-button>
            <el-popconfirm title="确认删除？" @confirm="del(row.channel_id)"><template #reference><el-button type="danger" size="small" link>删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
    <el-dialog v-model="dlg" :title="form.channel_id?'编辑渠道':'新增渠道'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required><el-input v-model="form.channel_name" /></el-form-item>
        <el-form-item label="类型" required><el-select v-model="form.channel_type" style="width:100%"><el-option v-for="t in types" :key="t" :label="t" :value="t" /></el-select></el-form-item>
        <el-form-item label="联系人"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { listChannel, saveChannel, delChannel } from '@/api'
const types = ['批发商', '商超', '电商', '加工企业']
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ channel_type: '', page: 1, pageSize: 10 }); const dlg = ref(false); const form = reactive({})
async function load() { loading.value = true; const res = await listChannel(q); list.value = res.list; total.value = res.total; loading.value = false }
function reset() { q.channel_type = ''; q.page = 1; load() }
function open(row) { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, row || { channel_type: '批发商' }); dlg.value = true }
async function save() { if (!form.channel_name || !form.channel_type) return ElMessage.warning('请填写必填项'); await saveChannel({ ...form }); ElMessage.success('保存成功'); dlg.value = false; load() }
async function toggle(row) { row.status = row.status ? 0 : 1; await saveChannel({ ...row }); load() }
async function del(id) { await delChannel(id); ElMessage.success('已删除'); load() }
load()
</script>
