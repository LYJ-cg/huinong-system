<template>
  <el-container class="buyer-layout">
    <el-aside width="220px" class="side">
      <div class="logo">
        <el-icon class="logo-icon"><ShoppingBag /></el-icon>
        <span class="logo-text">惠农采购通</span>
      </div>
      <el-menu :default-active="$route.path" background-color="#0a543a" text-color="#cfe6d5" active-text-color="#ffd24a" router>
        <el-menu-item index="/buyer"><el-icon><HomeFilled /></el-icon><span>采购首页</span></el-menu-item>
        <el-menu-item index="/buyer/product"><el-icon><Goods /></el-icon><span>产品列表</span></el-menu-item>
        <el-menu-item index="/buyer/supply"><el-icon><User /></el-icon><span>供货方</span></el-menu-item>
        <el-menu-item index="/buyer/order/new"><el-icon><EditPen /></el-icon><span>提交预订</span></el-menu-item>
        <el-menu-item index="/buyer/orders"><el-icon><Tickets /></el-icon><span>我的预订</span></el-menu-item>
        <el-menu-item index="/buyer/price"><el-icon><TrendCharts /></el-icon><span>行情价</span></el-menu-item>
        <el-menu-item index="/buyer/notice"><el-icon><Bell /></el-icon><span>消息通知</span></el-menu-item>
        <el-menu-item index="/buyer/me"><el-icon><UserFilled /></el-icon><span>买方信息</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/buyer' }">采购首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="onCommand">
            <span class="user-info">
              <el-avatar :size="28" class="avatar">{{ (buyer?.buyer_name || 'B').charAt(0) }}</el-avatar>
              <span class="uname">{{ buyer?.buyer_name }}</span>
              <el-tag size="small" type="warning" effect="plain">买方</el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="admin">切换到管理端</el-dropdown-item>
                <el-dropdown-item command="reset">重置演示数据</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { resetDB } from '@/api/db'

const router = useRouter()
const auth = useAuthStore()
const buyer = computed(() => auth.buyer)

function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/buyer/login')
  } else if (cmd === 'admin') {
    window.open('#/admin/login', '_blank')
  } else if (cmd === 'reset') {
    ElMessageBox.confirm('重置后将恢复初始演示数据，当前操作数据将被清空，是否继续？', '提示', { type: 'warning' })
      .then(() => { resetDB(); ElMessage.success('已重置演示数据'); setTimeout(() => location.reload(), 600) }).catch(() => {})
  }
}
</script>

<style scoped>
.buyer-layout { height: 100vh; }
.side { background: #0a543a; overflow-y: auto; }
.logo { height: 60px; display: flex; align-items: center; gap: 10px; padding: 0 18px; color: #fff; white-space: nowrap; border-bottom: 1px solid rgba(255,255,255,.08); }
.logo-icon { font-size: 26px; color: #ffd24a; }
.logo-text { font-size: 17px; font-weight: 700; }
.header { background: #fff; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.header-right { display: flex; align-items: center; gap: 22px; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.avatar { background: #0a543a; color: #fff; }
.uname { font-size: 14px; color: #303133; }
.main { background: #f0f2f5; padding: 14px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
