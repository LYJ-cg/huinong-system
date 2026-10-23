<template>
  <div class="public-app">
    <!-- ========== 顶部 Toolbar ========== -->
    <div class="toolbar">
      <div class="container">
        <div class="tb-left">
          <span class="tb-welcome">欢迎来到惠农物资管理系统</span>
          <span class="tb-divider">|</span>
          <span class="tb-loc"><el-icon><LocationFilled /></el-icon>当前地区：华东农业示范区</span>
        </div>
        <div class="tb-right">
          <template v-if="!auth.token">
            <router-link to="/login" class="tb-link tb-login">登录 / 注册</router-link>
          </template>
          <template v-else-if="auth.isBuyer">
            <el-dropdown trigger="click" @command="onBuyerCmd">
              <span class="tb-user">
                <el-avatar :size="22" class="tb-avatar">{{ (auth.buyer?.buyer_name || 'B').charAt(0) }}</el-avatar>
                {{ auth.buyer?.buyer_name }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="buyer-home">进入买方中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else-if="auth.isFarmer">
            <el-dropdown trigger="click" @command="onFarmerCmd">
              <span class="tb-user">
                <el-avatar :size="22" class="tb-avatar farmer">{{ (auth.farmer?.farmer_name || 'F').charAt(0) }}</el-avatar>
                {{ auth.farmer?.farmer_name }}（农户）
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="farmer-home">进入农户端</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else-if="auth.user">
            <el-dropdown trigger="click" @command="onAdminCmd">
              <span class="tb-user">
                <el-avatar :size="22" class="tb-avatar admin">{{ (auth.user?.real_name || 'A').charAt(0) }}</el-avatar>
                {{ auth.user?.real_name }}（{{ roleLabel }}）
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="admin-home">进入管理后台</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <span class="tb-divider">|</span>
          <a href="#/buyer/order/new" class="tb-link">我的预订</a>
          <span class="tb-divider">|</span>
          <a href="#/buyer/notice" class="tb-link">消息中心</a>
        </div>
      </div>
    </div>

    <!-- ========== Header：Logo + 搜索 + 角色入口 ========== -->
    <header class="site-header">
      <div class="container header-row">
        <router-link to="/" class="brand">
          <div class="brand-logo">
            <el-icon class="sun"><Sunny /></el-icon>
          </div>
          <div class="brand-text">
            <div class="brand-title">惠农物资管理系统</div>
            <div class="brand-sub">产 · 收 · 储 · 销 · 结算 一体化</div>
          </div>
        </router-link>

        <div class="search-box">
          <el-input
            v-model="searchKw"
            placeholder="搜索农产品名称、分类..."
            size="large"
            clearable
            @keyup.enter="doSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button class="search-btn" size="large" type="primary" @click="doSearch">搜索</el-button>
          <div class="hot-words">
            <span class="hw-label">热搜：</span>
            <a class="hw-item" @click="doSearch('西红柿')">西红柿</a>
            <a class="hw-item" @click="doSearch('苹果')">苹果</a>
            <a class="hw-item" @click="doSearch('黄瓜')">黄瓜</a>
            <a class="hw-item" @click="doSearch('水稻')">水稻</a>
            <a class="hw-item" @click="doSearch('土鸡')">土鸡</a>
          </div>
        </div>

        <div class="role-entry">
          <template v-if="!auth.token">
            <div class="entry-title">统一入口</div>
            <router-link to="/login" class="entry-btn">
              <el-icon><UserFilled /></el-icon>
              <span>登录 / 注册</span>
            </router-link>
            <div class="entry-hint">买方 · 农户 · 管理 通用</div>
          </template>
          <template v-else>
            <div class="entry-title">已登录</div>
            <router-link :to="workbenchPath" class="entry-btn logged">
              <el-icon><Monitor /></el-icon>
              <span>进入工作台</span>
            </router-link>
            <div class="entry-hint">{{ roleLabel }}</div>
          </template>
        </div>
      </div>
    </header>

    <!-- ========== 分类导航栏 ========== -->
    <nav class="cat-nav">
      <div class="container cat-row">
        <div class="cat-main">
          <span class="cat-title">全部分类</span>
          <span class="cat-sub">▾</span>
        </div>
        <div class="cat-list">
          <router-link
            v-for="c in categories"
            :key="c.key"
            :to="{ path: '/products', query: { cat: c.key === 'all' ? '' : c.key } }"
            class="cat-item"
            :class="{ active: activeCat === c.key }"
          >
            {{ c.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ========== 内容区 ========== -->
    <main class="site-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- ========== 底部 ========== -->
    <footer class="site-footer">
      <div class="container footer-row">
        <div class="footer-col">
          <h4>关于我们</h4>
          <p>惠农物资管理系统服务于农业产区，为买方、农户、收购方提供一站式农产品流通管理平台。</p>
        </div>
        <div class="footer-col">
          <h4>服务</h4>
          <a href="#/products">产品浏览</a>
          <a href="#/suppliers">供货方名录</a>
          <a href="#/prices">行情价格</a>
        </div>
        <div class="footer-col">
          <h4>快速入口</h4>
          <a href="#/buyer/register">买方注册</a>
          <a href="#/m/register">农户注册</a>
          <a href="#/login">统一登录</a>
        </div>
        <div class="footer-col qq">
          <h4>联系方式</h4>
          <p>📞 400-888-0000</p>
          <p>✉️ service@huinong.com</p>
          <p>🏠 华东农业示范区惠农路 1 号</p>
        </div>
      </div>
      <div class="copyright">© 2026 惠农物资管理系统 · 本科毕业设计作品</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Sunny, Search, LocationFilled, UserFilled, Monitor
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const searchKw = ref('')
const activeCat = ref('all')

watch(() => route.query.cat, (c) => {
  if (c) activeCat.value = c
  else if (route.path === '/' || route.path === '/products') activeCat.value = 'all'
}, { immediate: true })

const categories = [
  { key: 'all', label: '全部商品' },
  { key: '蔬菜', label: '蔬菜' },
  { key: '水果', label: '水果' },
  { key: '粮食', label: '粮食' },
  { key: '畜禽', label: '畜禽' }
]

const roleLabel = computed(() => {
  if (auth.isBuyer) return '买方账号'
  if (auth.isFarmer) return '农户账号'
  const m = { SYS: '系统管理员', ADMIN: '收购管理员', SALES: '销售管理员' }
  return m[auth.user?.role] || '管理员'
})

const workbenchPath = computed(() => {
  if (auth.isBuyer) return '/buyer'
  if (auth.isFarmer) return '/m'
  return '/admin'
})

function doSearch(kw) {
  const w = kw ?? searchKw.value.trim()
  if (!w) { router.push('/products'); return }
  router.push({ path: '/products', query: { kw: w } })
}

function onBuyerCmd(c) {
  if (c === 'buyer-home') router.push('/buyer')
  else if (c === 'logout') { auth.logout(); ElMessage.success('已退出登录'); router.push('/') }
}
function onFarmerCmd(c) {
  if (c === 'farmer-home') router.push('/m')
  else if (c === 'logout') { auth.logout(); ElMessage.success('已退出登录'); router.push('/') }
}
function onAdminCmd(c) {
  if (c === 'admin-home') router.push('/admin')
  else if (c === 'logout') { auth.logout(); ElMessage.success('已退出登录'); router.push('/') }
}
</script>

<style scoped>
.public-app { min-height: 100vh; display: flex; flex-direction: column; background: #f6f7f9; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }

/* 顶部 Toolbar */
.toolbar { background: #f5f5f5; border-bottom: 1px solid #ececec; font-size: 12.5px; color: #666; }
.tb-left, .tb-right { display: flex; align-items: center; gap: 4px; }
.toolbar .container { display: flex; justify-content: space-between; align-items: center; height: 34px; }
.tb-divider { margin: 0 10px; color: #ccc; }
.tb-loc { color: #12694a; cursor: pointer; }
.tb-loc .el-icon { margin-right: 2px; }
.tb-link { color: #666; text-decoration: none; transition: color .15s; }
.tb-link:hover { color: #12694a; }
.tb-login { color: #12694a; font-weight: 600; }
.tb-register { color: #c81623; font-weight: 600; }
.tb-user { display: inline-flex; align-items: center; gap: 6px; color: #333; cursor: pointer; }
.tb-avatar { background: #12694a; color: #fff; font-size: 12px; }
.tb-avatar.farmer { background: #f59e0b; }
.tb-avatar.admin { background: #2563eb; }

/* Header */
.site-header { background: #fff; padding: 22px 0 18px; border-bottom: 1px solid #eee; }
.header-row { display: flex; align-items: center; gap: 32px; }
.brand { display: flex; align-items: center; gap: 12px; text-decoration: none; flex-shrink: 0; }
.brand-logo {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, #0b4632, #12694a);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(18, 105, 74, .3);
}
.brand-logo .sun { font-size: 28px; color: #ffd24a; }
.brand-title { font-size: 22px; font-weight: 800; color: #1f3d2b; letter-spacing: 1px; }
.brand-sub { font-size: 12px; color: #6b8a79; margin-top: 2px; letter-spacing: 1px; }

.search-box { flex: 1; max-width: 560px; }
.search-box :deep(.el-input__wrapper) { border-radius: 24px 0 0 24px; box-shadow: 0 0 0 1px #12694a inset !important; }
.search-box :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px #12694a inset !important; }
.search-btn { border-radius: 0 24px 24px 0; height: 40px !important; background: #12694a !important; border-color: #12694a !important; padding: 0 26px !important; font-weight: 600; }
.search-btn:hover { background: #0e5c40 !important; }
.hot-words { margin-top: 6px; font-size: 12px; color: #999; }
.hw-label { color: #999; }
.hw-item { margin-left: 8px; color: #666; cursor: pointer; text-decoration: none; }
.hw-item:hover { color: #c81623; }

.role-entry { flex-shrink: 0; text-align: center; }
.entry-title { font-size: 12px; color: #999; margin-bottom: 6px; letter-spacing: .5px; }
.entry-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 0 22px; height: 38px; border-radius: 20px;
  background: linear-gradient(135deg, #0b4632, #12694a);
  color: #fff; font-size: 14px; font-weight: 600; text-decoration: none;
  box-shadow: 0 4px 12px rgba(18, 105, 74, .25);
  transition: all .2s; white-space: nowrap;
}
.entry-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(18, 105, 74, .35); }
.entry-btn.logged { background: linear-gradient(135deg, #1a5fbf, #2563eb); box-shadow: 0 4px 12px rgba(37, 99, 235, .25); }
.entry-btn.logged:hover { box-shadow: 0 8px 18px rgba(37, 99, 235, .35); }
.entry-hint { font-size: 11.5px; color: #9aa8a1; margin-top: 6px; }

/* 分类导航 */
.cat-nav { background: #fff; border-bottom: 2px solid #12694a; }
.cat-row { display: flex; align-items: center; gap: 28px; height: 44px; }
.cat-main { background: #12694a; color: #fff; padding: 0 18px; height: 36px; display: flex; align-items: center; gap: 6px; border-radius: 4px; font-weight: 600; font-size: 14px; }
.cat-list { display: flex; gap: 22px; }
.cat-item { font-size: 14px; color: #333; text-decoration: none; transition: color .15s; position: relative; padding: 2px 0; }
.cat-item:hover { color: #12694a; }
.cat-item.active { color: #c81623; font-weight: 600; }

/* 主内容 */
.site-main { flex: 1; padding: 22px 0 40px; }

/* 底部 */
.site-footer { background: #223329; color: #b3cfbd; padding: 40px 0 20px; margin-top: 30px; }
.footer-row { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 36px; }
.footer-col h4 { color: #ffd24a; font-size: 15px; margin: 0 0 14px; font-weight: 700; }
.footer-col a { display: block; color: #b3cfbd; font-size: 13px; text-decoration: none; line-height: 2; }
.footer-col a:hover { color: #fff; }
.footer-col p { font-size: 13px; line-height: 1.9; color: #8fb49c; margin: 0; }
.copyright { text-align: center; margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.08); font-size: 12.5px; color: #6b8a79; }

.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
