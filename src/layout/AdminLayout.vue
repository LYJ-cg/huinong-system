<template>
  <el-container class="admin-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="side">
      <div class="logo">
        <el-icon class="logo-icon"><Sunny /></el-icon>
        <span v-show="!isCollapse" class="logo-text">惠农物资管理</span>
      </div>
      <el-menu :default-active="activeMenu" :collapse="isCollapse" :collapse-transition="false"
        background-color="#1f3d2b" text-color="#cfe6d5" active-text-color="#fff" router unique-opened>
        <template v-for="m in menuList" :key="m.path || m.title">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="m.children" :index="m.title">
            <template #title>
              <el-icon><component :is="m.icon" /></el-icon>
              <span>{{ m.title }}</span>
            </template>
            <el-menu-item v-for="c in m.children" :key="c.path" :index="c.path">
              <el-icon><Menu /></el-icon>
              <span>{{ c.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <!-- 无子菜单 -->
          <el-menu-item v-else :index="m.path">
            <el-icon><component :is="m.icon" /></el-icon>
            <template #title>{{ m.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="dashboard.warnCount" :hidden="!dashboard.warnCount" class="badge-item">
            <el-icon class="icon-btn" @click="$router.push('/admin/warn')"><WarningFilled /></el-icon>
          </el-badge>
          <el-dropdown @command="onCommand">
            <span class="user-info">
              <el-avatar :size="28" class="avatar">{{ (user && user.real_name || 'A').charAt(0) }}</el-avatar>
              <span class="uname">{{ user && user.real_name }}</span>
              <el-tag size="small" type="success" effect="plain">{{ roleName }}</el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { filterMenus } from '@/router/menu'
import { getDashboard } from '@/api'
import { resetDB } from '@/api/db'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const user = computed(() => auth.user)
const isCollapse = ref(false)
const dashboard = ref({ warnCount: 0 })

const roleName = computed(() => {
  const map = { SYS: '系统管理员', ADMIN: '收购点管理员', SALES: '销售管理员' }
  return map[user.value?.role] || ''
})
const menuList = computed(() => filterMenus(user.value?.role))
const activeMenu = computed(() => route.path)

async function loadDashboard() {
  try { dashboard.value = await getDashboard() } catch (e) { /* ignore */ }
}
onMounted(loadDashboard)

function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/admin/login')
  } else if (cmd === 'reset') {
    ElMessageBox.confirm('重置后将恢复初始演示数据，当前操作数据将被清空，是否继续？', '提示', { type: 'warning' })
      .then(() => {
        resetDB()
        ElMessage.success('已重置演示数据')
        setTimeout(() => location.reload(), 600)
      }).catch(() => {})
  }
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.side { background: #1f3d2b; transition: width .25s; overflow-x: hidden; }
.logo { height: 60px; display: flex; align-items: center; gap: 10px; padding: 0 18px; color: #fff; white-space: nowrap; }
.logo-icon { font-size: 26px; color: #ffd24a; }
.logo-text { font-size: 17px; font-weight: 700; }
.header { background: #fff; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.header-left { display: flex; align-items: center; gap: 16px; }
.collapse-btn { font-size: 20px; cursor: pointer; color: #555; }
.header-right { display: flex; align-items: center; gap: 22px; }
.icon-btn { font-size: 22px; cursor: pointer; color: #e6a23c; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.avatar { background: var(--hn-green); color: #fff; }
.uname { font-size: 14px; color: #303133; }
.main { background: #f0f2f5; padding: 14px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
