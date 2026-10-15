<template>
  <div class="page-wrap">
    <el-alert type="warning" :closable="false" show-icon class="mb">
      系统根据农产品保鲜期自动计算临期预警日期（入库日期+保鲜期）。剩余7天内进入预警，3天内为高危，已过期需尽快处理。优先安排销售或促销，防止积压腐烂。
    </el-alert>
    <div class="stat-row">
      <div class="w-card expired"><div class="n">{{ expired.length }}</div><div class="l">已过期</div></div>
      <div class="w-card danger"><div class="n">{{ danger.length }}</div><div class="l">3天内到期</div></div>
      <div class="w-card warn"><div class="n">{{ warn.length }}</div><div class="l">7天内到期</div></div>
      <div class="w-card safe"><div class="n">{{ safe.length }}</div><div class="l">正常</div></div>
    </div>
    <div class="table-card mt">
      <div class="toolbar"><span class="title">临期预警库存</span></div>
      <el-table :data="list" v-loading="loading" stripe border :row-class-name="rowClass">
        <el-table-column prop="batch_no" label="批次号" width="180" />
        <el-table-column prop="warehouse_name" label="仓库" width="120" />
        <el-table-column prop="product_name" label="农产品" width="110" />
        <el-table-column label="库存" width="100" align="right"><template #default="{row}">{{ row.quantity }} {{ row.unit }}</template></el-table-column>
        <el-table-column prop="warn_date" label="临期日期" width="120" />
        <el-table-column label="剩余天数" width="100" align="center">
          <template #default="{row}"><span :class="'warn-'+row.warn_level">{{ row.left_days < 0 ? '已过期' : row.left_days + '天' }}</span></template>
        </el-table-column>
        <el-table-column label="预警级别" width="110" align="center">
          <template #default="{row}"><el-tag :type="tagType(row)">{{ tagText(row) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="建议" show-overflow-tooltip>
          <template #default="{row}">{{ row.left_days < 0 ? '已过期，按报废处理并记录' : '优先安排销售或促销出库' }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { listStock } from '@/api'
const loading = ref(false); const list = ref([])
async function load() { loading.value = true; const res = await listStock({ warn: true, pageSize: 999 }); list.value = res.list; loading.value = false }
const expired = computed(() => list.value.filter(x => x.warn_level === 'expired'))
const danger = computed(() => list.value.filter(x => x.warn_level === 'warn'))
const warn = computed(() => list.value.filter(x => x.warn_level === 'soon'))
const safe = computed(() => list.value.filter(x => x.warn_level === 'safe'))
function rowClass({ row }) { return 'level-' + row.warn_level }
function tagType(row) { return { expired: 'danger', warn: 'danger', soon: 'warning', safe: 'success' }[row.warn_level] }
function tagText(row) { return { expired: '已过期', warn: '高危', soon: '预警', safe: '正常' }[row.warn_level] }
onMounted(load)
</script>

<style scoped>
.mb { margin-bottom: 14px; }
.stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.w-card { padding: 20px; border-radius: 10px; color: #fff; text-align: center; }
.w-card .n { font-size: 30px; font-weight: 700; }
.w-card .l { font-size: 13px; opacity: .9; margin-top: 4px; }
.expired { background: #f56c6c; }
.danger { background: #e6a23c; }
.warn { background: #f0a020; }
.safe { background: #67c23a; }
.mt { margin-top: 14px; }
.warn-expired { color: #f56c6c; font-weight: 700; }
.warn-warn { color: #f56c6c; font-weight: 700; }
.warn-soon { color: #e6a23c; }
.warn-safe { color: #67c23a; }
</style>
