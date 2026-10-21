<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-input v-model="q.keyword" placeholder="名称/电话/联系人" clearable style="width:220px" @keyup.enter="load" />
      <el-select v-model="q.auth_status" placeholder="认证状态" clearable style="width:140px">
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">买方档案管理</span><el-button type="primary" @click="open()">+ 新建买方</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="buyer_name" label="买方名称" width="180" />
        <el-table-column prop="buyer_type" label="类型" width="110" />
        <el-table-column prop="contact" label="联系人" width="110" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column label="信用等级" width="110" align="center">
          <template #default="{ row }">
            <span v-for="i in 4" :key="i" :style="{ color: i <= (row.credit_level||0) ? '#f56c6c' : '#ddd' }">★</span>
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.auth_status?'success':'info'" size="small">{{ row.auth_status?'已通过':'待审核' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.auth_status" type="success" size="small" link @click="audit(row,1)">通过</el-button>
            <el-button v-if="row.auth_status" type="danger" size="small" link @click="audit(row,0)">停用</el-button>
            <el-button size="small" link @click="edit(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="del(row)">
              <template #reference><el-button size="small" link type="danger">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" @current-change="load" /></div>
    </div>

    <el-dialog v-model="dlg" title="买方档案" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="买方名称"><el-input v-model="form.buyer_name" /></el-form-item>
        <el-form-item label="简称"><el-input v-model="form.short_name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.buyer_type" style="width:100%">
            <el-option label="批发商" value="批发商" /><el-option label="商超" value="商超" />
            <el-option label="电商" value="电商" /><el-option label="加工企业" value="加工企业" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="信用等级">
          <el-rate v-model="form.credit_level" :max="4" />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listBuyer, saveBuyer, auditBuyer, delBuyer } from '@/api'
import { useAuthStore } from '@/store/auth'
const auth = useAuthStore()
const loading = ref(false); const list = ref([]); const total = ref(0)
const q = reactive({ keyword: '', auth_status: '', page: 1, pageSize: 10 })
const dlg = ref(false); const form = reactive({})

async function load() {
  loading.value = true
  const r = await listBuyer(q); list.value = r.list; total.value = r.total
  loading.value = false
}
function open() { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, { buyer_type: '批发商', credit_level: 3, auth_status: 1 }); dlg.value = true }
function edit(row) { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, row); dlg.value = true }
async function save() {
  if (!form.buyer_name || !form.phone) return ElMessage.warning('请填写名称和电话')
  const r = await saveBuyer(form); if (r.ok) { ElMessage.success('保存成功'); dlg.value = false; load() } else ElMessage.error(r.msg)
}
async function audit(row, s) {
  await auditBuyer(row.buyer_id, s, auth.user.user_id)
  ElMessage.success(s ? '已通过审核' : '已停用'); load()
}
async function del(row) { const r = await delBuyer(row.buyer_id); if (r.ok) { ElMessage.success('已删除'); load() } }
onMounted(load)
</script>
