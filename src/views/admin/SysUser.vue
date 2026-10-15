<template>
  <div class="page-wrap">
    <div class="table-card">
      <div class="toolbar"><span class="title">系统用户管理</span><el-button type="primary" @click="open()">+ 新增用户</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column type="index" label="序" width="50" align="center" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="real_name" label="姓名" width="100" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column label="角色" width="130" align="center">
          <template #default="{row}"><el-tag :type="{SYS:'danger',ADMIN:'success',SALES:'warning'}[row.role]" size="small">{{ roleName(row.role) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center"><template #default="{row}"><el-tag :type="row.status?'success':'info'">{{ row.status ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{row}">
            <el-button type="primary" size="small" link @click="open(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="del(row.user_id)"><template #reference><el-button type="danger" size="small" link>删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
    <el-dialog v-model="dlg" :title="form.user_id?'编辑用户':'新增用户'" width="460px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名" required><el-input v-model="form.username" :disabled="!!form.user_id" /></el-form-item>
        <el-form-item label="姓名" required><el-input v-model="form.real_name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="form.role" style="width:100%">
            <el-option label="系统管理员" value="SYS" /><el-option label="收购点管理员" value="ADMIN" /><el-option label="销售管理员" value="SALES" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始密码"><el-input v-model="form.password" placeholder="默认123456" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { listUser, saveUser, delUser } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ page: 1, pageSize: 10 }); const dlg = ref(false); const form = reactive({})
function roleName(r) { return { SYS: '系统管理员', ADMIN: '收购点管理员', SALES: '销售管理员' }[r] }
async function load() { loading.value = true; const res = await listUser(q); list.value = res.list; total.value = res.total; loading.value = false }
function open(row) { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, row || { role: 'ADMIN', password: '123456' }); dlg.value = true }
async function save() { if (!form.username || !form.real_name) return ElMessage.warning('请填写必填项'); const res = await saveUser({ ...form }); res.ok ? (ElMessage.success('保存成功'), dlg.value = false, load()) : ElMessage.error(res.msg) }
async function del(id) { await delUser(id); ElMessage.success('已删除'); load() }
load()
</script>
