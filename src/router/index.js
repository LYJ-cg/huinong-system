import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  // ========== 公共浏览区（京东/淘宝风格，所有人可访问） ==========
  {
    path: '/',
    component: () => import('@/layout/PublicLayout.vue'),
    children: [
      { path: '', name: 'PublicHome', component: () => import('@/views/public/Home.vue'), meta: { title: '惠农物资管理系统 - 产地直供农产品' } },
      { path: 'products', name: 'PublicProducts', component: () => import('@/views/public/Products.vue'), meta: { title: '全部商品' } },
      { path: 'product/:id', name: 'PublicProductDetail', component: () => import('@/views/public/ProductDetail.vue'), meta: { title: '商品详情' } },
      { path: 'suppliers', name: 'PublicSuppliers', component: () => import('@/views/public/Suppliers.vue'), meta: { title: '供货方名录' } },
      { path: 'prices', name: 'PublicPrices', component: () => import('@/views/public/Price.vue'), meta: { title: '实时行情价' } }
    ]
  },

  // ========== 三角色统一登录入口 ==========
  { path: '/login', name: 'UnifiedLogin', component: () => import('@/views/UnifiedLogin.vue'), meta: { guest: true } },
  // 兼容旧书签：原三个独立登录页 → 重定向到统一登录
  { path: '/admin/login', redirect: '/login' },
  { path: '/m/login', redirect: '/login' },
  { path: '/buyer/login', redirect: '/login' },
  { path: '/buyer/register', name: 'BuyerRegister', component: () => import('@/views/buyer/Register.vue'), meta: { guest: true } },

  // ========== 管理端主体 ==========
  {
    path: '/admin',
    component: () => import('@/layout/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '工作台' } },
      { path: 'farmer', name: 'Farmer', component: () => import('@/views/admin/Farmer.vue'), meta: { title: '农户管理' } },
      { path: 'product', name: 'Product', component: () => import('@/views/admin/Product.vue'), meta: { title: '农产品信息' } },
      { path: 'supply', name: 'Supply', component: () => import('@/views/admin/SupplyInfo.vue'), meta: { title: '供货信息' } },
      { path: 'plan', name: 'Plan', component: () => import('@/views/admin/PurchasePlan.vue'), meta: { title: '收购计划' } },
      { path: 'order', name: 'Order', component: () => import('@/views/admin/PurchaseOrder.vue'), meta: { title: '收购单' } },
      { path: 'settlement', name: 'Settlement', component: () => import('@/views/admin/Settlement.vue'), meta: { title: '结算管理' } },
      { path: 'warehouse', name: 'Warehouse', component: () => import('@/views/admin/Warehouse.vue'), meta: { title: '仓库管理' } },
      { path: 'stock', name: 'Stock', component: () => import('@/views/admin/Stock.vue'), meta: { title: '库存查询' } },
      { path: 'stock-in', name: 'StockIn', component: () => import('@/views/admin/StockIn.vue'), meta: { title: '入库记录' } },
      { path: 'stock-out', name: 'StockOut', component: () => import('@/views/admin/StockOut.vue'), meta: { title: '出库记录' } },
      { path: 'warn', name: 'Warn', component: () => import('@/views/admin/StockWarn.vue'), meta: { title: '临期预警' } },
      { path: 'channel', name: 'Channel', component: () => import('@/views/admin/Channel.vue'), meta: { title: '销售渠道' } },
      { path: 'sale-order', name: 'SaleOrder', component: () => import('@/views/admin/SaleOrder.vue'), meta: { title: '销售订单' } },
      { path: 'buyer-order', name: 'BuyerOrderAudit', component: () => import('@/views/admin/BuyerOrderAudit.vue'), meta: { title: '买方预订审核' } },
      { path: 'buyer', name: 'Buyer', component: () => import('@/views/admin/Buyer.vue'), meta: { title: '买方档案' } },
      { path: 'price', name: 'Price', component: () => import('@/views/admin/Price.vue'), meta: { title: '指导价/行情' } },
      { path: 'notice', name: 'Notice', component: () => import('@/views/admin/Notice.vue'), meta: { title: '消息通知' } },
      { path: 'statistics', name: 'Statistics', component: () => import('@/views/admin/Statistics.vue'), meta: { title: '统计分析' } },
      { path: 'sys-user', name: 'SysUser', component: () => import('@/views/admin/SysUser.vue'), meta: { title: '用户管理' } },
      { path: 'sys-log', name: 'SysLog', component: () => import('@/views/admin/SysLog.vue'), meta: { title: '操作日志' } }
    ]
  },

  // ========== 农户移动端（注册入口保留） ==========
  { path: '/m/register', name: 'MobileRegister', component: () => import('@/views/mobile/Register.vue'), meta: { guest: true } },
  {
    path: '/m',
    component: () => import('@/layout/MobileLayout.vue'),
    children: [
      { path: '', name: 'MobileHome', component: () => import('@/views/mobile/Home.vue'), meta: { title: '首页' } },
      { path: 'supply', name: 'MobileSupply', component: () => import('@/views/mobile/Supply.vue'), meta: { title: '发布供货' } },
      { path: 'orders', name: 'MobileOrders', component: () => import('@/views/mobile/Orders.vue'), meta: { title: '我的收购单' } },
      { path: 'settlement', name: 'MobileSettlement', component: () => import('@/views/mobile/Settlement.vue'), meta: { title: '结算查询' } },
      { path: 'price', name: 'MobilePrice', component: () => import('@/views/mobile/Price.vue'), meta: { title: '指导价/行情' } },
      { path: 'notice', name: 'MobileNotice', component: () => import('@/views/mobile/Notice.vue'), meta: { title: '消息通知' } },
      { path: 'me', name: 'MobileMe', component: () => import('@/views/mobile/Me.vue'), meta: { title: '我的' } }
    ]
  },

  // ========== 买方端（含游客浏览公开页 + 受限页） ==========
  {
    path: '/buyer',
    component: () => import('@/layout/BuyerLayout.vue'),
    children: [
      { path: '', name: 'BuyerHome', component: () => import('@/views/buyer/Home.vue'), meta: { title: '首页', public: true } },
      { path: 'supply', name: 'BuyerSupply', component: () => import('@/views/buyer/Supply.vue'), meta: { title: '供货方', public: true } },
      { path: 'product', name: 'BuyerProduct', component: () => import('@/views/buyer/Product.vue'), meta: { title: '产品列表', public: true } },
      { path: 'order/new', name: 'BuyerNewOrder', component: () => import('@/views/buyer/NewOrder.vue'), meta: { title: '提交预订', guestBlocked: true } },
      { path: 'orders', name: 'BuyerOrders', component: () => import('@/views/buyer/Orders.vue'), meta: { title: '我的预订', guestBlocked: true } },
      { path: 'price', name: 'BuyerPrice', component: () => import('@/views/buyer/Price.vue'), meta: { title: '行情价', public: true } },
      { path: 'notice', name: 'BuyerNotice', component: () => import('@/views/buyer/Notice.vue'), meta: { title: '消息', guestBlocked: true } },
      { path: 'me', name: 'BuyerMe', component: () => import('@/views/buyer/Me.vue'), meta: { title: '买方信息', guestBlocked: true } }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  // 管理端权限守卫
  if (to.path.startsWith('/admin')) {
    if (!auth.token || !auth.user) return next('/login')
    if (!['SYS', 'ADMIN', 'SALES'].includes(auth.user.role)) return next('/')
  }
  // 农户端守卫
  if (to.path.startsWith('/m') && to.path !== '/m/register') {
    if (!auth.isFarmer) return next('/login')
  }
  // 买方端：公开页放行，受限页拦截
  if (to.path.startsWith('/buyer') && to.path !== '/buyer/register') {
    if (!auth.isBuyer && to.meta.guestBlocked) return next('/login')
  }
  // 已登录用户访问登录页 → 跳回对应角色首页
  if (to.path === '/login' && auth.token) {
    if (auth.isBuyer) return next('/buyer')
    if (auth.isFarmer) return next('/m')
    if (auth.user) return next('/admin')
  }
  next()
})

export default router
