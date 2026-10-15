import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  { path: '/', redirect: '/admin/login' },
  // 管理端登录
  { path: '/admin/login', name: 'AdminLogin', component: () => import('@/views/admin/Login.vue'), meta: { guest: true } },
  // 管理端主体
  {
    path: '/admin',
    component: () => import('@/layout/AdminLayout.vue'),
    children: [
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
      { path: 'price', name: 'Price', component: () => import('@/views/admin/Price.vue'), meta: { title: '指导价/行情' } },
      { path: 'notice', name: 'Notice', component: () => import('@/views/admin/Notice.vue'), meta: { title: '消息通知' } },
      { path: 'statistics', name: 'Statistics', component: () => import('@/views/admin/Statistics.vue'), meta: { title: '统计分析' } },
      { path: 'sys-user', name: 'SysUser', component: () => import('@/views/admin/SysUser.vue'), meta: { title: '用户管理' } },
      { path: 'sys-log', name: 'SysLog', component: () => import('@/views/admin/SysLog.vue'), meta: { title: '操作日志' } }
    ]
  },
  // 农户移动端
  { path: '/m/login', name: 'MobileLogin', component: () => import('@/views/mobile/Login.vue'), meta: { guest: true } },
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!auth.isAdmin) return next('/admin/login')
  }
  if (to.path.startsWith('/m/') && to.path !== '/m/login' && to.path !== '/m/register') {
    if (!auth.isFarmer) return next('/m/login')
  }
  next()
})

export default router
