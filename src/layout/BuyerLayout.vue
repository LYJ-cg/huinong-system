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
        <el-menu-item :index="guestBlocked('/buyer/order/new')" class="guest-blocked" @click="onBlockedClick('/buyer/order/new')">
          <el-icon><EditPen /></el-icon><span>提交预订</span>
          <el-tag v-if="isGuest" size="small" type="info" effect="plain" class="lock-tag">🔒</el-tag>
        </el-menu-item>
        <el-menu-item :index="guestBlocked('/buyer/orders')" class="guest-blocked" @click="onBlockedClick('/buyer/orders')">
          <el-icon><Tickets /></el-icon><span>我的预订</span>
          <el-tag v-if="isGuest" size="small" type="info" effect="plain" class="lock-tag">🔒</el-tag>
        </el-menu-item>
        <el-menu-item index="/buyer/price"><el-icon><TrendCharts /></el-icon><span>行情价</span></el-menu-item>
        <el-menu-item :index="guestBlocked('/buyer/notice')" class="guest-blocked" @click="onBlockedClick('/buyer/notice')">
          <el-icon><Bell /></el-icon><span>消息通知</span>
          <el-tag v-if="isGuest" size="small" type="info" effect="plain" class="lock-tag">🔒</el-tag>
        </el-menu-item>
        <el-menu-item :index="guestBlocked('/buyer/me')" class="guest-blocked" @click="onBlockedClick('/buyer/me')">
          <el-icon><UserFilled /></el-icon><span>买方信息</span>
          <el-tag v-if="isGuest" size="small" type="info" effect="plain" class="lock-tag">🔒</el-tag>
        </el-menu-item>
      </el-menu>

      <div v-if="isGuest" class="guest-tip">
        <div class="guest-tip-title">🔔 游客模式</div>
        <div class="guest-tip-text">浏览产品后，登录即可提交预订、查看订单追踪</div>
        <div class="guest-tip-btns">
          <el-button size="small" class="tip-login" @click="goLogin">登录</el-button>
          <el-button size="small" class="tip-register" @click="goRegister">注册</el-button>
        </div>
      </div>
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
          <template v-if="isGuest">
            <el-tag type="warning" effect="plain" class="guest-badge">
              <el-icon><View /></el-icon> 游客浏览中
            </el-tag>
            <el-button size="small" class="login-btn" @click="goLogin">登录</el-button>
            <el-button size="small" type="primary" class="register-btn" @click="goRegister">免费注册</el-button>
          </template>
          <template v-else>
            <el-dropdown @command="onCommand">
              <span class="user-info">
                <el-avatar :size="28" class="avatar">{{ (buyer?.buyer_name || 'B').charAt(0) }}</el-avatar>
                <span class="uname">{{ buyer?.buyer_name }}</span>
                <el-tag size="small" type="warning" effect="plain">买方</el-tag>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="reset">重置演示数据</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
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

    <!-- 游客受限引导 Modal -->
    <el-dialog v-model="blockedVisible" width="440px" :show-close="false" center :close-on-click-modal="true">
      <div class="blocked-dialog">
        <div class="blocked-icon">🔒</div>
        <div class="blocked-title">请先登录</div>
        <div class="blocked-text">
          功能已准备好，登录买方账号后即可：
        </div>
        <ul class="blocked-list">
          <li>• 在线提交预订订单</li>
          <li>• 追踪订单收购进度</li>
          <li>• 接收供货方最新消息</li>
        </ul>
        <div class="blocked-btns">
          <el-button class="btn-login" type="primary" size="large" @click="goLogin">立即登录</el-button>
          <el-button class="btn-register" size="large" @click="goRegister">免费注册</el-button>
        </div>
        <div class="blocked-hint">演示账号：buyer1 / 123456</div>
      </div>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, Goods, User, EditPen, Tickets, TrendCharts, Bell, UserFilled, View, ShoppingBag } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { resetDB } from '@/api/db'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const buyer = computed(() => auth.buyer)
const isGuest = computed(() => !auth.isBuyer)
const blockedVisible = ref(false)

// 受限路由的 menu index 置空（防止 router 直接跳过去）
function guestBlocked(path) {
  return isGuest.value ? '' : path
}

function onBlockedClick(path) {
  if (isGuest.value) {
    blockedVisible.value = true
  } else {
    router.push(path)
  }
}

// 路由变化时，游客若进了受限页面 → 弹引导 + 跳回首页
watch(() => route.path, (p) => {
  if (isGuest.value && route.meta.guestBlocked) {
    blockedVisible.value = true
    router.replace('/buyer')
  }
}, { immediate: true })

function goLogin() {
  blockedVisible.value = false
  router.push('/')
}
function goRegister() {
  blockedVisible.value = false
  router.push('/buyer/register')
}

function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/buyer/login')
  } else if (cmd === 'reset') {
    ElMessageBox.confirm('重置后将恢复初始演示数据，当前操作数据将被清空，是否继续？', '提示', { type: 'warning' })
      .then(() => { resetDB(); ElMessage.success('已重置演示数据'); setTimeout(() => location.reload(), 600) }).catch(() => {})
  }
}
</script>

<style scoped>
.buyer-layout { height: 100vh; }
.side { background: #0a543a; overflow-y: auto; display: flex; flex-direction: column; }
.logo { height: 60px; display: flex; align-items: center; gap: 10px; padding: 0 18px; color: #fff; white-space: nowrap; border-bottom: 1px solid rgba(255,255,255,.08); }
.logo-icon { font-size: 26px; color: #ffd24a; }
.logo-text { font-size: 17px; font-weight: 700; }

.guest-blocked { opacity: .85; }
.guest-blocked:hover { opacity: 1 !important; }
.lock-tag { margin-left: auto; background: rgba(255,255,255,.15) !important; color: #ffd24a !important; border-color: rgba(255,210,74,.4) !important; }

.guest-tip {
  margin-top: auto;
  padding: 14px 16px 16px;
  background: rgba(0,0,0,.18);
  border-top: 1px solid rgba(255,255,255,.08);
}
.guest-tip-title { font-size: 13px; font-weight: 600; color: #ffd24a; margin-bottom: 6px; }
.guest-tip-text { font-size: 12px; color: #b3cfbd; line-height: 1.5; margin-bottom: 10px; }
.guest-tip-btns { display: flex; gap: 8px; }
.tip-login { flex: 1; background: transparent !important; color: #ffd24a !important; border-color: rgba(255,210,74,.6) !important; }
.tip-register { flex: 1; background: #ffd24a !important; color: #0a543a !important; border-color: #ffd24a !important; font-weight: 600; }

.header { background: #fff; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.header-right { display: flex; align-items: center; gap: 14px; }

.guest-badge { background: #fff9e6 !important; color: #b86d00 !important; border-color: #ffd591 !important; display: inline-flex !important; align-items: center !important; gap: 4px !important; }
.login-btn { background: #fff !important; color: #0a543a !important; border-color: #0a543a !important; }
.login-btn:hover { background: #e6f0ea !important; }
.register-btn { background: #0a543a !important; border-color: #0a543a !important; }

.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.avatar { background: #0a543a; color: #fff; }
.uname { font-size: 14px; color: #303133; }
.main { background: #f0f2f5; padding: 14px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 受限引导 Modal */
.blocked-dialog { text-align: center; padding: 18px 10px 8px; }
.blocked-icon { font-size: 42px; margin-bottom: 12px; }
.blocked-title { font-size: 20px; font-weight: 700; color: #1f3d2b; margin-bottom: 8px; }
.blocked-text { font-size: 14px; color: #606266; margin-bottom: 12px; }
.blocked-list { text-align: left; display: inline-block; padding: 12px 20px; background: #f3f7f5; border-radius: 8px; font-size: 13px; color: #4a5c53; line-height: 1.9; margin-bottom: 20px; }
.blocked-btns { display: flex; gap: 12px; margin-bottom: 12px; }
.btn-login { flex: 1; background: #0a543a !important; border-color: #0a543a !important; }
.btn-register { flex: 1; }
.blocked-hint { font-size: 12px; color: #a0a7aa; }
</style>
