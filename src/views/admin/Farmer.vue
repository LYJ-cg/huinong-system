<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-input v-model="q.keyword" placeholder="姓名/电话/身份证号" clearable style="width:240px" @keyup.enter="load" />
      <el-select v-model="q.auth_status" placeholder="认证状态" clearable style="width:150px">
        <el-option label="未认证" :value="0" /><el-option label="已认证" :value="1" /><el-option label="已驳回" :value="2" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar">
        <span class="title">农户档案</span>
        <el-button type="primary" @click="open()">+ 新增农户</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe border size="default">
        <el-table-column type="index" label="序" width="50" align="center" />
        <el-table-column prop="farmer_name" label="姓名" width="90" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="id_card" label="身份证号" width="170" />
        <el-table-column prop="address" label="住址" show-overflow-tooltip />
        <el-table-column prop="bank_card" label="银行卡号" width="180" />
        <el-table-column label="认证状态" width="100" align="center">
          <template #default="{row}">
            <el-tag :type="row.auth_status===1?'success':row.auth_status===2?'danger':'info'">
              {{ ['未认证','已认证','已驳回'][row.auth_status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="注册时间" width="160" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{row}">
            <el-button v-if="row.auth_status!==1" type="success" size="small" link @click="audit(row,1)">通过</el-button>
            <el-button v-if="row.auth_status!==2&&row.auth_status!==1" type="danger" size="small" link @click="audit(row,2)">驳回</el-button>
            <el-button type="primary" size="small" link @click="open(row)">编辑</el-button>
            <el-popconfirm title="确认删除该农户？" @confirm="del(row.farmer_id)">
              <template #reference><el-button type="danger" size="small" link>删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next,sizes" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" :page-sizes="[10,20,50]" @current-change="load" @size-change="load" /></div>
    </div>

    <el-dialog v-model="dlg" :title="form.farmer_id?'编辑农户':'新增农户'" width="560px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="姓名" required><el-input v-model="form.farmer_name" /></el-form-item>
        <el-form-item label="电话" required><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="身份证号" required><el-input v-model="form.id_card" /></el-form-item>
        <el-form-item label="住址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="银行卡号"><el-input v-model="form.bank_card" /></el-form-item>
        <el-form-item label="认证状态">
          <el-radio-group v-model="form.auth_status"><el-radio :value="0">未认证</el-radio><el-radio :value="1">已认证</el-radio><el-radio :value="2">已驳回</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { listFarmer, saveFarmer, auditFarmer, delFarmer } from '@/api'
const loading = ref(false)
const list = ref([]); const total = ref(0)
const q = reactive({ keyword: '', auth_status: '', page: 1, pageSize: 10 })
const dlg = ref(false)
const form = reactive({})
async function load() {
  loading.value = true
  const res = await listFarmer(q)
  list.value = res.list; total.value = res.total; loading.value = false
}
function reset() { q.keyword=''; q.auth_status=''; q.page=1; load() }
function open(row) {
  Object.keys(form).forEach(k => delete form[k])
  if (row) Object.assign(form, row)
  else Object.assign(form, { auth_status: 1 })
  dlg.value = true
}
async function save() {
  if (!form.farmer_name || !form.phone || !form.id_card) return ElMessage.warning('请填写必填项')
  const res = await saveFarmer({ ...form })
  if (res.ok) { ElMessage.success('保存成功'); dlg.value = false; load() }
  else ElMessage.error(res.msg)
}
async function audit(row, status) {
  await auditFarmer(row.farmer_id, status)
  ElMessage.success('操作成功'); load()
}
async function del(id) { await delFarmer(id); ElMessage.success('已删除'); load() }
load()
</script>
