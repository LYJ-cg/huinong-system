<template>
  <div class="page-wrap">
    <div class="table-card">
      <div class="toolbar"><span class="title">仓库管理</span><el-button type="primary" @click="open()">+ 新增仓库</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column type="index" label="序" width="50" align="center" />
        <el-table-column prop="warehouse_name" label="仓库名称" width="140" />
        <el-table-column prop="location" label="位置" show-overflow-tooltip />
        <el-table-column prop="manager_name" label="负责人" width="100" />
        <el-table-column label="状态" width="90" align="center"><template #default="{row}"><el-tag :type="row.status?'success':'info'">{{ row.status ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{row}">
            <el-button type="primary" size="small" link @click="open(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="del(row.warehouse_id)"><template #reference><el-button type="danger" size="small" link>删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>
    <el-dialog v-model="dlg" :title="form.warehouse_id?'编辑仓库':'新增仓库'" width="440px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required><el-input v-model="form.warehouse_name" /></el-form-item>
        <el-form-item label="位置"><el-input v-model="form.location" /></el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="form.manager_id" style="width:100%">
            <el-option v-for="u in users" :key="u.user_id" :label="u.real_name" :value="u.user_id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listWarehouse, saveWarehouse, delWarehouse, listUser } from '@/api'
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ page: 1, pageSize: 10 }); const dlg = ref(false); const form = reactive({}); const users = ref([])
async function load() { loading.value = true; const res = await listWarehouse(q); list.value = res.list; total.value = res.total; loading.value = false }
function open(row) { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, row || { manager_id: null }); dlg.value = true }
async function save() { if (!form.warehouse_name) return ElMessage.warning('请填写名称'); await saveWarehouse({ ...form }); ElMessage.success('保存成功'); dlg.value = false; load() }
async function del(id) { await delWarehouse(id); ElMessage.success('已删除'); load() }
onMounted(async () => { const r = await listUser({ pageSize: 999 }); users.value = r.list; load() })
</script>
