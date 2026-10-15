<template>
  <div class="page-wrap">
    <div class="search-bar">
      <el-input v-model="q.keyword" placeholder="农产品名称" clearable style="width:200px" @keyup.enter="load" />
      <el-select v-model="q.category" placeholder="类别" clearable style="width:150px">
        <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div class="table-card">
      <div class="toolbar"><span class="title">农产品信息</span><el-button type="primary" @click="open()">+ 新增农产品</el-button></div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column type="index" label="序" width="50" align="center" />
        <el-table-column prop="product_name" label="名称" width="120" />
        <el-table-column prop="category" label="类别" width="100">
          <template #default="{row}"><el-tag type="success" effect="plain">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="shelf_life" label="保鲜期(天)" width="110" align="center">
          <template #default="{row}"><span :style="{color: row.shelf_life<=7?'#f56c6c':'#606266'}">{{ row.shelf_life }}</span></template>
        </el-table-column>
        <el-table-column prop="guide_price" label="当前指导价" width="120">
          <template #default="{row}">¥{{ row.guide_price }}/{{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{row}"><el-tag :type="row.status?'success':'info'">{{ row.status ? '上架' : '下架' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{row}">
            <el-button type="primary" size="small" link @click="open(row)">编辑</el-button>
            <el-button :type="row.status?'warning':'success'" size="small" link @click="toggle(row)">{{ row.status ? '下架' : '上架' }}</el-button>
            <el-popconfirm title="确认删除？" @confirm="del(row.product_id)"><template #reference><el-button type="danger" size="small" link>删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap"><el-pagination background layout="total,prev,pager,next,sizes" :total="total" v-model:current-page="q.page" v-model:page-size="q.pageSize" :page-sizes="[10,20,50]" @current-change="load" @size-change="load" /></div>
    </div>

    <el-dialog v-model="dlg" :title="form.product_id?'编辑农产品':'新增农产品'" width="480px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="名称" required><el-input v-model="form.product_name" /></el-form-item>
        <el-form-item label="类别" required>
          <el-select v-model="form.category" allow-create filterable style="width:100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" required><el-input v-model="form.unit" style="width:120px" /></el-form-item>
        <el-form-item label="保鲜期(天)" required><el-input-number v-model="form.shelf_life" :min="1" :max="1000" /></el-form-item>
        <el-form-item label="指导价" required><el-input-number v-model="form.guide_price" :min="0" :precision="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { listProduct, saveProduct, delProduct } from '@/api'
const categories = ['蔬菜', '水果', '粮食', '畜禽', '水产']
const loading = ref(false)
const list = ref([]); const total = ref(0)
const q = reactive({ keyword: '', category: '', page: 1, pageSize: 10 })
const dlg = ref(false)
const form = reactive({})
async function load() { loading.value = true; const res = await listProduct(q); list.value = res.list; total.value = res.total; loading.value = false }
function reset() { q.keyword = ''; q.category = ''; q.page = 1; load() }
function open(row) { Object.keys(form).forEach(k => delete form[k]); Object.assign(form, row || { category: '蔬菜', unit: '斤', shelf_life: 7, guide_price: 0 }); dlg.value = true }
async function save() {
  if (!form.product_name || !form.category) return ElMessage.warning('请填写必填项')
  const res = await saveProduct({ ...form })
  if (res.ok) { ElMessage.success('保存成功'); dlg.value = false; load() } else ElMessage.error(res.msg)
}
async function toggle(row) { row.status = row.status ? 0 : 1; await saveProduct({ ...row }); load() }
async function del(id) { await delProduct(id); ElMessage.success('已删除'); load() }
load()
</script>
