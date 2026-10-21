// 管理端菜单配置（role: ADMIN收购点管理员 SALES销售管理员 SYS系统管理员）
// roles 字段控制可见角色，'*' 表示所有角色可见
export const menus = [
  {
    title: '工作台', icon: 'HomeFilled', path: '/admin/dashboard', roles: '*'
  },
  {
    title: '收购管理', icon: 'ShoppingCart', roles: '*', children: [
      { title: '农户管理', path: '/admin/farmer', roles: ['ADMIN', 'SYS'] },
      { title: '农产品信息', path: '/admin/product', roles: '*' },
      { title: '供货信息', path: '/admin/supply', roles: ['ADMIN', 'SYS'] },
      { title: '收购计划', path: '/admin/plan', roles: ['ADMIN', 'SYS'] },
      { title: '收购单', path: '/admin/order', roles: ['ADMIN', 'SYS'] },
      { title: '结算管理', path: '/admin/settlement', roles: ['ADMIN', 'SYS'] }
    ]
  },
  {
    title: '仓储管理', icon: 'Box', roles: '*', children: [
      { title: '仓库管理', path: '/admin/warehouse', roles: ['ADMIN', 'SYS'] },
      { title: '库存查询', path: '/admin/stock', roles: '*' },
      { title: '入库记录', path: '/admin/stock-in', roles: '*' },
      { title: '出库记录', path: '/admin/stock-out', roles: '*' },
      { title: '临期预警', path: '/admin/warn', roles: '*' }
    ]
  },
  {
    title: '销售管理', icon: 'Sell', roles: ['SALES', 'SYS'], children: [
      { title: '销售渠道', path: '/admin/channel', roles: ['SALES', 'SYS'] },
      { title: '销售订单', path: '/admin/sale-order', roles: ['SALES', 'SYS'] },
      { title: '买方预订审核', path: '/admin/buyer-order', roles: ['SALES', 'SYS'] },
      { title: '指导价/行情', path: '/admin/price', roles: '*' }
    ]
  },
  {
    title: '买方管理', icon: 'User', roles: ['SYS'], children: [
      { title: '买方档案', path: '/admin/buyer', roles: ['SYS'] }
    ]
  },
  {
    title: '消息通知', icon: 'Bell', path: '/admin/notice', roles: '*'
  },
  {
    title: '统计分析', icon: 'TrendCharts', path: '/admin/statistics', roles: '*'
  },
  {
    title: '系统管理', icon: 'Setting', roles: ['SYS'], children: [
      { title: '用户管理', path: '/admin/sys-user', roles: ['SYS'] },
      { title: '操作日志', path: '/admin/sys-log', roles: ['SYS'] }
    ]
  }
]

export function filterMenus(role) {
  const walk = (list) => list.filter(m => {
    const vis = m.roles === '*' || m.roles.includes(role)
    if (!vis) return false
    if (m.children) {
      m.children = walk(m.children)
      return m.children.length > 0
    }
    return true
  })
  return walk(JSON.parse(JSON.stringify(menus)))
}
