<template>
  <div class="page-wrap">
    <div class="stat-grid">
      <div class="stat-card green">
        <div class="stat-icon"><el-icon><User /></el-icon></div>
        <div class="stat-body"><div class="num">{{ data.farmerCount }}</div><div class="lbl">认证农户</div></div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon"><el-icon><ShoppingCart /></el-icon></div>
        <div class="stat-body"><div class="num">¥{{ data.purchaseAmt }}</div><div class="lbl">收购金额</div></div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon"><el-icon><Sell /></el-icon></div>
        <div class="stat-body"><div class="num">¥{{ data.saleAmt }}</div><div class="lbl">销售金额</div></div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
        <div class="stat-body"><div class="num">{{ data.warnCount }}</div><div class="lbl">临期预警</div></div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon"><el-icon><Box /></el-icon></div>
        <div class="stat-body"><div class="num">{{ data.stockBatch }}</div><div class="lbl">在库批次</div></div>
      </div>
      <div class="stat-card teal">
        <div class="stat-icon"><el-icon><Bell /></el-icon></div>
        <div class="stat-body"><div class="num">{{ data.noticeCount }}</div><div class="lbl">未读通知</div></div>
      </div>
    </div>

    <el-row :gutter="16" class="mt">
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="flow-card">
          <template #header><div class="card-title"><el-icon><Connection /></el-icon> 业务流程总览（供—收—储—销—结算）</div></template>
          <div class="flow-chain">
            <div class="flow-node" v-for="(n, i) in flow" :key="i">
              <div class="fn-icon" :style="{background:n.color}"><el-icon><component :is="n.icon" /></el-icon></div>
              <div class="fn-title">{{ n.title }}</div>
              <div class="fn-desc">{{ n.desc }}</div>
              <el-icon v-if="i < flow.length-1" class="fn-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <el-divider />
          <div class="quick-entry">
            <div class="qe-title">快捷入口</div>
            <div class="qe-list">
              <el-button type="success" plain @click="$router.push('/admin/supply')">审核供货</el-button>
              <el-button type="warning" plain @click="$router.push('/admin/order')">新建收购单</el-button>
              <el-button type="primary" plain @click="$router.push('/admin/sale-order')">销售出库</el-button>
              <el-button type="danger" plain @click="$router.push('/admin/settlement')">农户结算</el-button>
              <el-button plain @click="$router.push('/admin/warn')">临期预警</el-button>
              <el-button plain @click="$router.push('/admin/statistics')">统计分析</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="todo-card">
          <template #header><div class="card-title"><el-icon><List /></el-icon> 待办事项</div></template>
          <div class="todo-item" v-for="t in todos" :key="t.path" @click="$router.push(t.path)">
            <el-badge :value="t.value" :hidden="!t.value" type="danger">
              <span class="todo-text">{{ t.text }}</span>
            </el-badge>
            <el-icon class="todo-arrow"><ArrowRight /></el-icon>
          </div>
          <el-empty v-if="!todos.some(t=>t.value)" description="暂无待办" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/api'
const data = ref({ farmerCount: 0, purchaseAmt: '0.00', saleAmt: '0.00', warnCount: 0, stockBatch: 0, noticeCount: 0, pendingSupply: 0 })
const flow = [
  { title: '农户供货', desc: '登记待售农产品', icon: 'EditPen', color: '#5bb97a' },
  { title: '审核计划', desc: '审核供货·制定计划', icon: 'Document', color: '#409eff' },
  { title: '称重质检', desc: '生成收购单', icon: 'ScaleToOriginal', color: '#e6a23c' },
  { title: '入库管理', desc: '批次入库·临期预警', icon: 'Box', color: '#67c23a' },
  { title: '销售出库', desc: '对接渠道发货', icon: 'Sell', color: '#f56c6c' },
  { title: '结算打款', desc: '生成结算·付款农户', icon: 'Money', color: '#9254de' }
]
const todos = ref([])
async function load() {
  const d = await getDashboard()
  data.value = d
  todos.value = [
    { text: '待审核供货信息', value: d.pendingSupply, path: '/admin/supply' },
    { text: '临期预警库存', value: d.warnCount, path: '/admin/warn' },
    { text: '未读消息通知', value: d.noticeCount, path: '/admin/notice' }
  ]
}
onMounted(load)
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-radius: 10px; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.stat-icon { width: 50px; height: 50px; border-radius: 12px; background: rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; font-size: 26px; }
.stat-body .num { font-size: 24px; font-weight: 700; }
.stat-body .lbl { font-size: 13px; opacity: .9; margin-top: 2px; }
.green { background: linear-gradient(135deg,#2da64a,#1e7d36); }
.orange { background: linear-gradient(135deg,#e6a23c,#cf8a1e); }
.blue { background: linear-gradient(135deg,#409eff,#1d7df0); }
.red { background: linear-gradient(135deg,#f56c6c,#e34949); }
.purple { background: linear-gradient(135deg,#9254de,#6e3ebd); }
.teal { background: linear-gradient(135deg,#13c2c2,#0e8f8f); }
.mt { margin-top: 14px; }
.card-title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #303133; }
.flow-chain { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 4px; }
.flow-node { position: relative; flex: 1; min-width: 110px; text-align: center; padding: 8px 4px; }
.fn-icon { width: 44px; height: 44px; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; }
.fn-title { font-weight: 600; color: #303133; }
.fn-desc { font-size: 12px; color: #909399; margin-top: 2px; }
.fn-arrow { position: absolute; right: -8px; top: 18px; color: #c0c4cc; font-size: 18px; }
.quick-entry { margin-top: 4px; }
.qe-title { font-weight: 600; margin-bottom: 10px; color: #606266; }
.qe-list { display: flex; flex-wrap: wrap; gap: 10px; }
.todo-card { height: 100%; }
.todo-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 8px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.todo-item:hover { background: #f9fdfb; }
.todo-text { font-size: 14px; color: #606266; }
.todo-arrow { color: #c0c4cc; }
</style>
