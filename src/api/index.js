/**
 * 模拟API服务层 - 同步实现，对外暴露异步接口模拟REST调用
 * 覆盖：登录/农户/农产品/供货/收购计划/收购单/结算/仓库/库存/入出库/
 *      渠道/销售订单/指导价/通知/日志/统计
 */
import { loadDB, saveDB, genNo, today, now, addDays, ensureFresh } from './db'

// 每次接口调用前先同步远端最新数据（未配置共享存储时为空操作）
const delay = async (ms = 80) => { await ensureFresh(); await new Promise(r => setTimeout(r, ms)) }

function db() {
  return loadDB()
}
function commit(d) {
  saveDB(d)
}
function nextId(d, table) {
  d.seq[table] = (d.seq[table] || 0) + 1
  return d.seq[table]
}

// 通用分页过滤
function paginate(list, { page = 1, pageSize = 10 } = {}) {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + Number(pageSize)), total: list.length }
}

// ============ 鉴权 ============
export async function loginAdmin(username, password) {
  await delay()
  const d = db()
  const u = d.sys_user.find(x => x.username === username && x.password === password)
  if (!u) return { ok: false, msg: '用户名或密码错误' }
  if (!u.status) return { ok: false, msg: '账号已停用' }
  const token = 'mock-jwt-' + u.user_id + '-' + Date.now()
  return { ok: true, token, user: { ...u, password: undefined } }
}

export async function loginFarmer(phone, idCard) {
  await delay()
  const d = db()
  const f = d.farmer.find(x => x.phone === phone && x.id_card === idCard)
  if (!f) return { ok: false, msg: '手机号或身份证号错误' }
  if (f.auth_status !== 1) return { ok: false, msg: '账号尚未通过实名认证' }
  const token = 'mock-jwt-farmer-' + f.farmer_id + '-' + Date.now()
  return { ok: true, token, farmer: f }
}

export async function registerFarmer(payload) {
  await delay()
  const d = db()
  if (d.farmer.some(f => f.phone === payload.phone)) return { ok: false, msg: '该手机号已注册' }
  if (d.farmer.some(f => f.id_card === payload.id_card)) return { ok: false, msg: '该身份证号已注册' }
  const id = nextId(d, 'farmer')
  const rec = {
    farmer_id: id, farmer_name: payload.farmer_name, phone: payload.phone,
    id_card: payload.id_card, address: payload.address || null, bank_card: payload.bank_card || null,
    auth_status: 0, remark: payload.remark || null, create_time: now(), update_time: now()
  }
  d.farmer.push(rec)
  commit(d)
  return { ok: true, data: rec }
}

// ============ 字典/概览 ============
export async function getDashboard() {
  await delay()
  const d = db()
  const purchaseAmt = d.purchase_order.reduce((s, o) => s + Number(o.total_amount), 0)
  const saleAmt = d.sale_order.reduce((s, o) => s + Number(o.total_amount), 0)
  const warnStock = d.stock.filter(s => {
    if (s.status !== 1) return false
    const days = (new Date(s.warn_date) - new Date(today())) / 86400000
    return days <= 3 && days >= 0
  })
  return {
    farmerCount: d.farmer.length,
    productCount: d.product.length,
    purchaseCount: d.purchase_order.length,
    purchaseAmt: purchaseAmt.toFixed(2),
    saleCount: d.sale_order.length,
    saleAmt: saleAmt.toFixed(2),
    stockBatch: d.stock.filter(s => s.status === 1).length,
    warnCount: warnStock.length,
    pendingSupply: d.supply_info.filter(s => s.audit_status === 0).length,
    noticeCount: d.notice.filter(n => n.is_read === 0).length
  }
}

// ============ 农户 ============
export async function listFarmer(params = {}) {
  await delay()
  const d = db()
  let list = [...d.farmer]
  if (params.keyword) {
    const kw = params.keyword.trim()
    list = list.filter(f => f.farmer_name.includes(kw) || f.phone.includes(kw) || (f.id_card && f.id_card.includes(kw)))
  }
  if (params.auth_status !== undefined && params.auth_status !== '' && params.auth_status !== null) {
    list = list.filter(f => f.auth_status === Number(params.auth_status))
  }
  list.reverse()
  return paginate(list, params)
}
export async function saveFarmer(payload) {
  await delay()
  const d = db()
  if (payload.farmer_id) {
    const f = d.farmer.find(x => x.farmer_id === payload.farmer_id)
    Object.assign(f, payload, { update_time: now() })
    commit(d)
    return { ok: true }
  }
  if (d.farmer.some(f => f.phone === payload.phone)) return { ok: false, msg: '该手机号已存在' }
  if (d.farmer.some(f => f.id_card === payload.id_card)) return { ok: false, msg: '该身份证号已存在' }
  const id = nextId(d, 'farmer')
  d.farmer.push({ ...payload, farmer_id: id, auth_status: payload.auth_status ?? 1, create_time: now(), update_time: now() })
  commit(d)
  return { ok: true }
}
export async function auditFarmer(id, status) {
  await delay()
  const d = db()
  const f = d.farmer.find(x => x.farmer_id === id)
  f.auth_status = status
  f.update_time = now()
  commit(d)
  return { ok: true }
}
export async function delFarmer(id) {
  await delay()
  const d = db()
  d.farmer = d.farmer.filter(f => f.farmer_id !== id)
  commit(d)
  return { ok: true }
}

// ============ 农产品 ============
export async function listProduct(params = {}) {
  await delay()
  const d = db()
  let list = [...d.product]
  if (params.keyword) list = list.filter(p => p.product_name.includes(params.keyword))
  if (params.category) list = list.filter(p => p.category === params.category)
  list.reverse()
  return paginate(list, params)
}
export async function saveProduct(payload) {
  await delay()
  const d = db()
  if (payload.product_id) {
    const p = d.product.find(x => x.product_id === payload.product_id)
    Object.assign(p, payload, { update_time: now() })
    commit(d)
    return { ok: true }
  }
  const id = nextId(d, 'product')
  d.product.push({ ...payload, product_id: id, status: 1, create_time: now(), update_time: now() })
  commit(d)
  return { ok: true }
}
export async function delProduct(id) {
  await delay()
  const d = db()
  d.product = d.product.filter(p => p.product_id !== id)
  commit(d)
  return { ok: true }
}

// ============ 供货信息 ============
export async function listSupply(params = {}) {
  await delay()
  const d = db()
  let list = d.supply_info.map(s => ({
    ...s,
    farmer_name: (d.farmer.find(f => f.farmer_id === s.farmer_id) || {}).farmer_name,
    product_name: (d.product.find(p => p.product_id === s.product_id) || {}).product_name,
    unit: (d.product.find(p => p.product_id === s.product_id) || {}).unit
  }))
  if (params.farmer_id) list = list.filter(s => s.farmer_id === Number(params.farmer_id))
  if (params.audit_status !== undefined && params.audit_status !== '' && params.audit_status !== null) {
    list = list.filter(s => s.audit_status === Number(params.audit_status))
  }
  list.reverse()
  return paginate(list, params)
}
export async function saveSupply(payload) {
  await delay()
  const d = db()
  const id = nextId(d, 'supply_info')
  d.supply_info.push({
    supply_id: id, farmer_id: payload.farmer_id, product_id: payload.product_id,
    expect_qty: payload.expect_qty, harvest_date: payload.harvest_date,
    address: payload.address || null, image_url: payload.image_url || '',
    audit_status: 0, audit_user: null, audit_time: null,
    create_time: now(), update_time: now()
  })
  commit(d)
  return { ok: true }
}
export async function auditSupply(id, status, userId) {
  await delay()
  const d = db()
  const s = d.supply_info.find(x => x.supply_id === id)
  s.audit_status = status
  s.audit_user = userId
  s.audit_time = now()
  s.update_time = now()
  if (status === 1) {
    // 通过则给农户发通知
    d.notice.push({
      notice_id: nextId(d, 'notice'), receiver_type: 1, receiver_id: s.farmer_id,
      notice_type: '送货提醒', title: '供货审核通过', is_read: 0,
      content: `您的供货信息已审核通过，请于${s.harvest_date}按计划送货至收购点。`,
      create_time: now()
    })
  }
  commit(d)
  return { ok: true }
}

// ============ 收购计划 ============
export async function listPlan(params = {}) {
  await delay()
  const d = db()
  let list = d.purchase_plan.map(p => ({
    ...p, product_name: (d.product.find(x => x.product_id === p.product_id) || {}).product_name,
    create_user_name: (d.sys_user.find(x => x.user_id === p.create_user) || {}).real_name
  }))
  if (params.status !== undefined && params.status !== '' && params.status !== null) {
    list = list.filter(p => p.status === Number(params.status))
  }
  list.reverse()
  return paginate(list, params)
}
export async function savePlan(payload, userId) {
  await delay()
  const d = db()
  const id = nextId(d, 'purchase_plan')
  d.purchase_plan.push({
    plan_id: id, plan_no: genNo('JH'), product_id: payload.product_id,
    plan_qty: payload.plan_qty, plan_date: payload.plan_date, create_user: userId,
    status: 0, remark: payload.remark || null, create_time: now(), update_time: now()
  })
  commit(d)
  return { ok: true }
}
export async function changePlanStatus(id, status) {
  await delay()
  const d = db()
  const p = d.purchase_plan.find(x => x.plan_id === id)
  p.status = status; p.update_time = now()
  commit(d)
  return { ok: true }
}

// ============ 收购单 ============
export async function listOrder(params = {}) {
  await delay()
  const d = db()
  let list = d.purchase_order.map(o => ({
    ...o,
    farmer_name: (d.farmer.find(f => f.farmer_id === o.farmer_id) || {}).farmer_name,
    product_name: (d.product.find(p => p.product_id === o.product_id) || {}).product_name,
    operator_name: (d.sys_user.find(u => u.user_id === o.operator_id) || {}).real_name
  }))
  if (params.farmer_id) list = list.filter(o => o.farmer_id === Number(params.farmer_id))
  if (params.status !== undefined && params.status !== '' && params.status !== null) {
    list = list.filter(o => o.status === Number(params.status))
  }
  list.reverse()
  return paginate(list, params)
}
export async function saveOrder(payload, userId) {
  await delay()
  const d = db()
  const gross = Number(payload.gross_weight)
  const tare = Number(payload.tare_weight)
  const net = +(gross - tare).toFixed(3)
  const price = Number(payload.price)
  const deduct = Number(payload.deduct_amount || 0)
  const total = +(net * price - deduct).toFixed(2)
  const id = nextId(d, 'purchase_order')
  const orderNo = genNo('SG')
  d.purchase_order.push({
    order_id: id, order_no: orderNo, supply_id: payload.supply_id || null,
    plan_id: payload.plan_id || null, farmer_id: payload.farmer_id, product_id: payload.product_id,
    gross_weight: gross, tare_weight: tare, net_weight: net, price, deduct_amount: deduct,
    total_amount: total, quality_grade: payload.quality_grade || null,
    purchase_date: payload.purchase_date || now(), operator_id: userId,
    settle_status: 0, status: 0, create_time: now(), update_time: now()
  })
  // 通知农户
  d.notice.push({
    notice_id: nextId(d, 'notice'), receiver_type: 1, receiver_id: payload.farmer_id,
    notice_type: '收购提醒', title: '收购单待确认', is_read: 0,
    content: `收购单${orderNo}已生成，净重${net}，金额${total}元，请前往确认。`,
    create_time: now()
  })
  commit(d)
  return { ok: true, order_no: orderNo, total_amount: total, net_weight: net }
}
export async function confirmOrder(id, fromFarmer = false) {
  await delay()
  const d = db()
  const o = d.purchase_order.find(x => x.order_id === id)
  // 0待确认->1已确认->2已锁定
  o.status = o.status === 0 ? 1 : 2
  o.update_time = now()
  if (o.status === 2) {
    // 锁定后自动入库
    const whId = Number(promptWarehouse(d, o.product_id))
    const batchNo = o.order_no
    const inDate = today()
    const prod = d.product.find(p => p.product_id === o.product_id)
    const warnDate = addDays(inDate, prod.shelf_life)
    // 入库单
    d.stock_in.push({
      in_id: nextId(d, 'stock_in'), in_no: genNo('RK'), order_id: o.order_id,
      warehouse_id: whId, product_id: o.product_id, batch_no: batchNo,
      quantity: o.net_weight, in_date: now(), operator_id: o.operator_id, create_time: now()
    })
    // 库存
    const exist = d.stock.find(s => s.warehouse_id === whId && s.product_id === o.product_id && s.batch_no === batchNo)
    if (exist) {
      exist.quantity = +(Number(exist.quantity) + o.net_weight).toFixed(2)
      exist.update_time = now()
    } else {
      d.stock.push({
        stock_id: nextId(d, 'stock'), warehouse_id: whId, product_id: o.product_id,
        batch_no: batchNo, quantity: o.net_weight, in_date: inDate, warn_date: warnDate,
        status: 1, create_time: now(), update_time: now()
      })
    }
  }
  commit(d)
  return { ok: true, status: o.status }
}
function promptWarehouse(d, productId) {
  const prod = d.product.find(p => p.product_id === productId)
  if (prod && (prod.category === '水果' || prod.category === '蔬菜' || prod.category === '畜禽')) return 1
  return 2
}

// ============ 结算 ============
export async function listSettlement(params = {}) {
  await delay()
  const d = db()
  let list = d.settlement.map(s => ({
    ...s,
    farmer_name: (d.farmer.find(f => f.farmer_id === s.farmer_id) || {}).farmer_name,
    create_user_name: (d.sys_user.find(u => u.user_id === s.create_user) || {}).real_name,
    items: d.settlement_item.filter(it => it.settlement_id === s.settlement_id).map(it => ({
      ...it,
      order_no: (d.purchase_order.find(o => o.order_id === it.order_id) || {}).order_no
    }))
  }))
  if (params.farmer_id) list = list.filter(s => s.farmer_id === Number(params.farmer_id))
  list.reverse()
  return paginate(list, params)
}
export async function createSettlement(payload, userId) {
  await delay()
  const d = db()
  // 查该农户未结算收购单
  const orders = d.purchase_order.filter(o => o.farmer_id === payload.farmer_id && o.settle_status === 0 && o.status >= 1)
  if (!orders.length) return { ok: false, msg: '该农户没有可结算的收购单' }
  const total = orders.reduce((s, o) => s + Number(o.total_amount), 0)
  const sid = nextId(d, 'settlement')
  const sNo = genNo('JS')
  d.settlement.push({
    settlement_id: sid, settlement_no: sNo, farmer_id: payload.farmer_id,
    start_date: payload.start_date, end_date: payload.end_date, total_amount: +total.toFixed(2),
    pay_method: payload.pay_method || '银行转账', pay_time: null, status: 0,
    create_user: userId, create_time: now(), update_time: now()
  })
  orders.forEach(o => {
    d.settlement_item.push({
      item_id: nextId(d, 'settlement_item'), settlement_id: sid, order_id: o.order_id, amount: o.total_amount
    })
    o.settle_status = 1
  })
  d.notice.push({
    notice_id: nextId(d, 'notice'), receiver_type: 1, receiver_id: payload.farmer_id,
    notice_type: '结算提醒', title: '结算单已生成', is_read: 0,
    content: `您的结算单${sNo}已生成，金额${total.toFixed(2)}元，待打款。`, create_time: now()
  })
  commit(d)
  return { ok: true, settlement_no: sNo, total_amount: total }
}
export async function paySettlement(id, payMethod) {
  await delay()
  const d = db()
  const s = d.settlement.find(x => x.settlement_id === id)
  s.status = 1
  s.pay_method = payMethod || s.pay_method
  s.pay_time = now()
  s.update_time = now()
  d.notice.push({
    notice_id: nextId(d, 'notice'), receiver_type: 1, receiver_id: s.farmer_id,
    notice_type: '结算提醒', title: '结算已打款', is_read: 0,
    content: `您的结算单${s.settlement_no}已打款${s.total_amount}元，请确认收款。`, create_time: now()
  })
  commit(d)
  return { ok: true }
}
export async function confirmSettlement(id) {
  await delay()
  const d = db()
  const s = d.settlement.find(x => x.settlement_id === id)
  s.status = 2
  s.update_time = now()
  commit(d)
  return { ok: true }
}

// ============ 仓库 ============
export async function listWarehouse(params = {}) {
  await delay()
  const d = db()
  let list = d.warehouse.map(w => ({
    ...w, manager_name: (d.sys_user.find(u => u.user_id === w.manager_id) || {}).real_name
  }))
  list.reverse()
  return paginate(list, params)
}
export async function saveWarehouse(payload) {
  await delay()
  const d = db()
  if (payload.warehouse_id) {
    Object.assign(d.warehouse.find(w => w.warehouse_id === payload.warehouse_id), payload, { update_time: now() })
    commit(d); return { ok: true }
  }
  const id = nextId(d, 'warehouse')
  d.warehouse.push({ ...payload, warehouse_id: id, status: 1, create_time: now(), update_time: now() })
  commit(d)
  return { ok: true }
}
export async function delWarehouse(id) {
  await delay()
  const d = db()
  d.warehouse = d.warehouse.filter(w => w.warehouse_id !== id)
  commit(d)
  return { ok: true }
}

// ============ 库存（含临期预警） ============
export async function listStock(params = {}) {
  await delay()
  const d = db()
  const t = today()
  let list = d.stock.map(s => {
    const prod = d.product.find(p => p.product_id === s.product_id) || {}
    const wh = d.warehouse.find(w => w.warehouse_id === s.warehouse_id) || {}
    const days = Math.ceil((new Date(s.warn_date) - new Date(t)) / 86400000)
    return {
      ...s, product_name: prod.product_name, category: prod.category, unit: prod.unit,
      warehouse_name: wh.warehouse_name, left_days: days,
      warn_level: days < 0 ? 'expired' : (days <= 3 ? 'warn' : (days <= 7 ? 'soon' : 'safe'))
    }
  })
  if (params.warn) list = list.filter(s => s.warn_level === 'warn' || s.warn_level === 'expired' || s.warn_level === 'soon')
  if (params.warehouse_id) list = list.filter(s => s.warehouse_id === Number(params.warehouse_id))
  list.sort((a, b) => a.left_days - b.left_days)
  return paginate(list, params)
}
export async function adjustStock(id, qty) {
  await delay()
  const d = db()
  const s = d.stock.find(x => x.stock_id === id)
  s.quantity = +Number(qty).toFixed(2)
  s.status = s.quantity <= 0 ? 0 : 1
  s.update_time = now()
  commit(d)
  return { ok: true }
}

// 入库单
export async function listStockIn(params = {}) {
  await delay()
  const d = db()
  let list = d.stock_in.map(i => ({
    ...i, product_name: (d.product.find(p => p.product_id === i.product_id) || {}).product_name,
    warehouse_name: (d.warehouse.find(w => w.warehouse_id === i.warehouse_id) || {}).warehouse_name,
    operator_name: (d.sys_user.find(u => u.user_id === i.operator_id) || {}).real_name,
    order_no: (d.purchase_order.find(o => o.order_id === i.order_id) || {}).order_no
  }))
  list.reverse()
  return paginate(list, params)
}
// 出库单
export async function listStockOut(params = {}) {
  await delay()
  const d = db()
  let list = d.stock_out.map(o => ({
    ...o, product_name: (d.product.find(p => p.product_id === o.product_id) || {}).product_name,
    warehouse_name: (d.warehouse.find(w => w.warehouse_id === o.warehouse_id) || {}).warehouse_name,
    operator_name: (d.sys_user.find(u => u.user_id === o.operator_id) || {}).real_name,
    sale_no: (d.sale_order.find(s => s.sale_id === o.sale_id) || {}).sale_no
  }))
  list.reverse()
  return paginate(list, params)
}

// ============ 销售渠道 ============
export async function listChannel(params = {}) {
  await delay()
  const d = db()
  let list = [...d.channel]
  if (params.channel_type) list = list.filter(c => c.channel_type === params.channel_type)
  list.reverse()
  return paginate(list, params)
}
export async function saveChannel(payload) {
  await delay()
  const d = db()
  if (payload.channel_id) {
    Object.assign(d.channel.find(c => c.channel_id === payload.channel_id), payload, { update_time: now() })
    commit(d); return { ok: true }
  }
  const id = nextId(d, 'channel')
  d.channel.push({ ...payload, channel_id: id, status: 1, create_time: now(), update_time: now() })
  commit(d)
  return { ok: true }
}
export async function delChannel(id) {
  await delay()
  const d = db()
  d.channel = d.channel.filter(c => c.channel_id !== id)
  commit(d)
  return { ok: true }
}

// ============ 销售订单 ============
export async function listSaleOrder(params = {}) {
  await delay()
  const d = db()
  let list = d.sale_order.map(s => ({
    ...s,
    channel_name: (d.channel.find(c => c.channel_id === s.channel_id) || {}).channel_name,
    product_name: (d.product.find(p => p.product_id === s.product_id) || {}).product_name,
    create_user_name: (d.sys_user.find(u => u.user_id === s.create_user) || {}).real_name
  }))
  if (params.out_status !== undefined && params.out_status !== '' && params.out_status !== null) {
    list = list.filter(s => s.out_status === Number(params.out_status))
  }
  if (params.pay_status !== undefined && params.pay_status !== '' && params.pay_status !== null) {
    list = list.filter(s => s.pay_status === Number(params.pay_status))
  }
  list.reverse()
  return paginate(list, params)
}
// 可售库存（按批次）
export async function listSellableStock() {
  await delay()
  const d = db()
  return d.stock.filter(s => s.status === 1 && s.quantity > 0).map(s => ({
    ...s, product_name: (d.product.find(p => p.product_id === s.product_id) || {}).product_name,
    warehouse_name: (d.warehouse.find(w => w.warehouse_id === s.warehouse_id) || {}).warehouse_name
  }))
}
export async function saveSaleOrder(payload, userId) {
  await delay()
  const d = db()
  const qty = Number(payload.quantity)
  const price = Number(payload.price)
  const total = +(qty * price).toFixed(2)
  // 校验库存
  const stk = d.stock.find(s => s.warehouse_id === payload.warehouse_id && s.product_id === payload.product_id && s.batch_no === payload.batch_no && s.status === 1)
  if (!stk) return { ok: false, msg: '该批次库存不存在' }
  if (qty > Number(stk.quantity)) return { ok: false, msg: '库存不足' }
  const id = nextId(d, 'sale_order')
  const sNo = genNo('XS')
  d.sale_order.push({
    sale_id: id, sale_no: sNo, channel_id: payload.channel_id, product_id: payload.product_id,
    batch_no: payload.batch_no, quantity: qty, price, total_amount: total, sale_date: now(),
    out_status: 0, out_date: null, pay_status: 0, pay_time: null, create_user: userId,
    create_time: now(), update_time: now()
  })
  commit(d)
  return { ok: true, sale_no: sNo }
}
export async function outStock(id, userId) {
  await delay()
  const d = db()
  const s = d.sale_order.find(x => x.sale_id === id)
  if (s.out_status === 1) return { ok: false, msg: '已出库' }
  const stk = d.stock.find(x => x.batch_no === s.batch_no && x.product_id === s.product_id)
  if (!stk || Number(stk.quantity) < Number(s.quantity)) return { ok: false, msg: '库存不足，无法出库' }
  stk.quantity = +(Number(stk.quantity) - Number(s.quantity)).toFixed(2)
  if (stk.quantity <= 0) stk.status = 0
  stk.update_time = now()
  s.out_status = 1
  s.out_date = now()
  s.update_time = now()
  d.stock_out.push({
    out_id: nextId(d, 'stock_out'), out_no: genNo('CK'), sale_id: s.sale_id,
    warehouse_id: stk.warehouse_id, product_id: s.product_id, batch_no: s.batch_no,
    quantity: s.quantity, out_date: now(), operator_id: userId, create_time: now()
  })
  commit(d)
  return { ok: true }
}
export async function paySaleOrder(id) {
  await delay()
  const d = db()
  const s = d.sale_order.find(x => x.sale_id === id)
  s.pay_status = 1
  s.pay_time = now()
  s.update_time = now()
  commit(d)
  return { ok: true }
}

// ============ 指导价 ============
export async function listPrice(params = {}) {
  await delay()
  const d = db()
  let list = d.price.map(p => ({
    ...p, product_name: (d.product.find(x => x.product_id === p.product_id) || {}).product_name
  }))
  if (params.product_id) list = list.filter(p => p.product_id === Number(params.product_id))
  list.sort((a, b) => (a.price_date < b.price_date ? 1 : -1))
  return paginate(list, params)
}
export async function savePrice(productId, guidePrice) {
  await delay()
  const d = db()
  const t = today()
  let rec = d.price.find(p => p.product_id === productId && p.price_date === t)
  if (rec) {
    rec.guide_price = Number(guidePrice)
  } else {
    d.price.push({ price_id: nextId(d, 'price'), product_id: productId, price_date: t, guide_price: Number(guidePrice), create_time: now() })
  }
  // 同步农产品当前指导价
  const prod = d.product.find(p => p.product_id === productId)
  if (prod) prod.guide_price = Number(guidePrice)
  commit(d)
  return { ok: true }
}
export async function priceTrend(productId) {
  await delay()
  const d = db()
  return d.price.filter(p => p.product_id === Number(productId))
    .map(p => ({ date: p.price_date, price: Number(p.guide_price) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

// ============ 通知 ============
export async function listNotice(params = {}) {
  await delay()
  const d = db()
  let list = [...d.notice]
  if (params.receiver_type !== undefined) list = list.filter(n => n.receiver_type === Number(params.receiver_type))
  if (params.receiver_id) list = list.filter(n => n.receiver_id === Number(params.receiver_id))
  list.reverse()
  return paginate(list, params)
}
export async function readNotice(id) {
  await delay()
  const d = db()
  const n = d.notice.find(x => x.notice_id === id)
  if (n) { n.is_read = 1; commit(d) }
  return { ok: true }
}
export async function sendNotice(payload) {
  await delay()
  const d = db()
  d.notice.push({
    notice_id: nextId(d, 'notice'), receiver_type: payload.receiver_type,
    receiver_id: payload.receiver_id, notice_type: payload.notice_type,
    title: payload.title, content: payload.content, is_read: 0, create_time: now()
  })
  commit(d)
  return { ok: true }
}

// ============ 日志 ============
export async function listLog(params = {}) {
  await delay()
  const d = db()
  let list = [...d.sys_log]
  if (params.keyword) list = list.filter(l => l.operation.includes(params.keyword) || (l.user_name || '').includes(params.keyword))
  list.reverse()
  return paginate(list, params)
}
export function addLog(d, userId, userName, operation, method = '', ip = '127.0.0.1') {
  d.sys_log.push({ log_id: nextId(d, 'sys_log'), user_id: userId, user_name: userName, operation, method, ip, create_time: now() })
}

// ============ 系统用户 ============
export async function listUser(params = {}) {
  await delay()
  const d = db()
  let list = d.sys_user.map(u => ({ ...u, password: undefined }))
  list.reverse()
  return paginate(list, params)
}
export async function saveUser(payload) {
  await delay()
  const d = db()
  if (payload.user_id) {
    const u = d.sys_user.find(x => x.user_id === payload.user_id)
    Object.assign(u, payload, { update_time: now() })
    commit(d); return { ok: true }
  }
  if (d.sys_user.some(u => u.username === payload.username)) return { ok: false, msg: '用户名已存在' }
  const id = nextId(d, 'sys_user')
  d.sys_user.push({ ...payload, user_id: id, status: 1, password: payload.password || '123456', create_time: now(), update_time: now() })
  commit(d)
  return { ok: true }
}
export async function delUser(id) {
  await delay()
  const d = db()
  d.sys_user = d.sys_user.filter(u => u.user_id !== id)
  commit(d)
  return { ok: true }
}

// ============ 统计 ============
export async function getStatistics() {
  await delay()
  const d = db()
  // 各品类收购量
  const byCategory = {}
  d.purchase_order.forEach(o => {
    const p = d.product.find(x => x.product_id === o.product_id) || {}
    const c = p.category || '其他'
    byCategory[c] = (byCategory[c] || 0) + Number(o.net_weight)
  })
  // 月度收购/销售金额
  const monthly = {}
  d.purchase_order.forEach(o => {
    const m = (o.purchase_date || '').slice(0, 7)
    monthly[m] = monthly[m] || { purchase: 0, sale: 0 }
    monthly[m].purchase += Number(o.total_amount)
  })
  d.sale_order.forEach(s => {
    const m = (s.sale_date || '').slice(0, 7)
    monthly[m] = monthly[m] || { purchase: 0, sale: 0 }
    monthly[m].sale += Number(s.total_amount)
  })
  // 农户收益排行
  const farmerRank = {}
  d.purchase_order.forEach(o => {
    farmerRank[o.farmer_id] = (farmerRank[o.farmer_id] || 0) + Number(o.total_amount)
  })
  const rankList = Object.entries(farmerRank).map(([fid, amt]) => ({
    farmer_name: (d.farmer.find(f => f.farmer_id === Number(fid)) || {}).farmer_name || '未知',
    amount: +amt.toFixed(2)
  })).sort((a, b) => b.amount - a.amount)
  // 渠道销售额
  const channelSale = {}
  d.sale_order.forEach(s => {
    const cn = (d.channel.find(c => c.channel_id === s.channel_id) || {}).channel_name || '未知'
    channelSale[cn] = (channelSale[cn] || 0) + Number(s.total_amount)
  })
  // 库存周转(简化：按品类库存量)
  const stockByCategory = {}
  d.stock.forEach(s => {
    const p = d.product.find(x => x.product_id === s.product_id) || {}
    const c = p.category || '其他'
    stockByCategory[c] = (stockByCategory[c] || 0) + Number(s.quantity)
  })
  // 应收款（未收款销售金额）
  const unpaidSaleAmt = d.sale_order.filter(s => s.pay_status === 0).reduce((s, o) => s + Number(o.total_amount), 0)
  return {
    byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value: +value.toFixed(2) })),
    monthly: Object.entries(monthly).map(([month, v]) => ({ month, purchase: +v.purchase.toFixed(2), sale: +v.sale.toFixed(2) })).sort((a, b) => (a.month < b.month ? -1 : 1)),
    rankList,
    channelSale: Object.entries(channelSale).map(([name, value]) => ({ name, value: +value.toFixed(2) })),
    stockByCategory: Object.entries(stockByCategory).map(([name, value]) => ({ name, value: +value.toFixed(2) })),
    unpaidSaleAmt: unpaidSaleAmt.toFixed(2)
  }
}

// ============================================================================
// ============ 买方 Buyer 相关接口 ============
// ============================================================================

// ============ 买方登录注册 ============
export async function loginBuyer(username, password) {
  await delay()
  const d = db()
  const u = d.sys_user.find(x => x.username === username && x.password === password && x.role === 'BUYER')
  if (!u) return { ok: false, msg: '用户名或密码错误' }
  if (!u.status) return { ok: false, msg: '账号已停用' }
  const b = d.buyer.find(x => x.phone === u.phone)
  if (!b) return { ok: false, msg: '买方档案不存在，请联系管理员' }
  if (b.auth_status !== 1) return { ok: false, msg: '您的账号尚未通过审核，请耐心等待' }
  const token = 'mock-jwt-buyer-' + u.user_id + '-' + Date.now()
  return { ok: true, token, user: { ...u, password: undefined }, buyer: b }
}

export async function registerBuyer(payload) {
  await delay()
  const d = db()
  if (d.sys_user.some(u => u.username === payload.username)) return { ok: false, msg: '用户名已存在' }
  if (d.buyer.some(b => b.phone === payload.phone)) return { ok: false, msg: '该手机号已注册' }
  // 买方表
  const bid = nextId(d, 'buyer')
  const buyerRec = {
    buyer_id: bid, buyer_name: payload.buyer_name, short_name: payload.short_name || payload.buyer_name,
    contact: payload.contact || '', phone: payload.phone, address: payload.address || '',
    buyer_type: payload.buyer_type || '批发商', credit_level: 2, auth_status: 0,
    remark: payload.remark || '', create_time: now(), update_time: now()
  }
  d.buyer.push(buyerRec)
  // 同步 sys_user 账号
  const uid = nextId(d, 'sys_user')
  d.sys_user.push({
    user_id: uid, username: payload.username, password: payload.password || '123456',
    real_name: payload.buyer_name, phone: payload.phone, role: 'BUYER',
    status: 1, create_time: now(), update_time: now()
  })
  commit(d)
  return { ok: true, buyer_id: bid, msg: '注册成功，等待管理员审核后即可登录' }
}

// ============ 买方管理（管理端） ============
export async function listBuyer(params = {}) {
  await delay()
  const d = db()
  let list = [...d.buyer]
  if (params.keyword) {
    const kw = params.keyword.trim()
    list = list.filter(b => b.buyer_name.includes(kw) || b.phone.includes(kw) || (b.contact || '').includes(kw))
  }
  if (params.auth_status !== undefined && params.auth_status !== '' && params.auth_status !== null) {
    list = list.filter(b => b.auth_status === Number(params.auth_status))
  }
  list.reverse()
  return paginate(list, params)
}
export async function auditBuyer(id, status, userId) {
  await delay()
  const d = db()
  const b = d.buyer.find(x => x.buyer_id === id)
  b.auth_status = status
  b.update_time = now()
  // 同步 sys_user（买方用 phone 匹配）
  const u = d.sys_user.find(x => x.role === 'BUYER' && x.phone === b.phone)
  if (u) u.status = status
  commit(d)
  return { ok: true }
}
export async function saveBuyer(payload) {
  await delay()
  const d = db()
  if (payload.buyer_id) {
    const b = d.buyer.find(x => x.buyer_id === payload.buyer_id)
    Object.assign(b, payload, { update_time: now() })
    commit(d); return { ok: true }
  }
  if (d.buyer.some(b => b.phone === payload.phone)) return { ok: false, msg: '手机号已存在' }
  const id = nextId(d, 'buyer')
  d.buyer.push({ ...payload, buyer_id: id, auth_status: payload.auth_status ?? 1, credit_level: payload.credit_level ?? 3, create_time: now(), update_time: now() })
  commit(d)
  return { ok: true }
}
export async function delBuyer(id) {
  await delay()
  const d = db()
  const b = d.buyer.find(x => x.buyer_id === id)
  if (b) {
    d.sys_user = d.sys_user.filter(u => !(u.role === 'BUYER' && u.phone === b.phone))
  }
  d.buyer = d.buyer.filter(x => x.buyer_id !== id)
  commit(d)
  return { ok: true }
}

// ============ 买方预订订单 ============
// 买方下单（可以选择现有产品或指定新产品 custom_product_name）
export async function submitBuyerOrder(payload, buyerId) {
  await delay()
  const d = db()
  const b = d.buyer.find(x => x.buyer_id === buyerId)
  if (!b) return { ok: false, msg: '买方档案不存在' }
  const id = nextId(d, 'buyer_order')
  d.buyer_order.push({
    order_id: id, order_no: genNo('DY'),
    buyer_id: buyerId, buyer_name: b.buyer_name,
    product_id: payload.product_id || null, custom_product_name: payload.custom_product_name || null,
    unit: payload.unit || '斤', quantity: Number(payload.quantity),
    expected_date: payload.expected_date, expected_price: Number(payload.expected_price) || null,
    buyer_note: payload.buyer_note || null,
    audit_status: 0, audit_user: null, audit_time: null,
    pick_status: 0, sale_id: null, reject_reason: null,
    create_time: now(), update_time: now()
  })
  // 给销售管理员发通知（role=SALES）
  const salesUsers = d.sys_user.filter(u => u.role === 'SALES')
  salesUsers.forEach(u => {
    d.notice.push({
      notice_id: nextId(d, 'notice'), receiver_type: 3 /*销售管理员*/, receiver_id: u.user_id,
      notice_type: '买方订单', title: `有新的买方预订单待审核`, is_read: 0,
      content: `买方 ${b.buyer_name} 提交了订单，请尽快处理。`,
      create_time: now()
    })
  })
  commit(d)
  return { ok: true, order_no: d.buyer_order[d.buyer_order.length - 1].order_no }
}

// 买方订单列表（管理端/买方端通用，buyerId 传入则过滤）
export async function listBuyerOrder(params = {}) {
  await delay()
  const d = db()
  let list = d.buyer_order.map(o => {
    // 组装产品信息（有 product_id 则用产品名，否则用自定义名）
    const prod = o.product_id ? (d.product.find(p => p.product_id === o.product_id) || {}) : {}
    return {
      ...o,
      product_name: prod.product_name || o.custom_product_name || '未指定',
      category: prod.category || '-',
      sale_no: o.sale_id ? (d.sale_order.find(s => s.sale_id === o.sale_id) || {}).sale_no : null
    }
  })
  if (params.buyer_id) list = list.filter(o => o.buyer_id === Number(params.buyer_id))
  if (params.audit_status !== undefined && params.audit_status !== '' && params.audit_status !== null) {
    list = list.filter(o => o.audit_status === Number(params.audit_status))
  }
  list.reverse()
  return paginate(list, params)
}

// 销售管理员审核买方订单
export async function auditBuyerOrder(id, pass, userId, rejectReason = '', priceAdjust) {
  await delay()
  const d = db()
  const o = d.buyer_order.find(x => x.order_id === id)
  if (o.audit_status !== 0) return { ok: false, msg: '该订单已处理' }
  if (!pass) {
    o.audit_status = 2
    o.reject_reason = rejectReason || '暂无法供应'
    o.audit_user = userId
    o.audit_time = now()
    o.update_time = now()
    d.notice.push({
      notice_id: nextId(d, 'notice'), receiver_type: 4 /*买方*/, receiver_id: o.buyer_id,
      notice_type: '订单反馈', title: '预订订单已被拒绝', is_read: 0,
      content: `您的订单 ${o.order_no} 未通过审核：${o.reject_reason}`, create_time: now()
    })
    commit(d)
    return { ok: true }
  }

  // 通过：若系统中有该产品库存 → 直接生成销售订单 + 出库
  //       若库存不足或无该产品 → 生成收购计划，由收购管理员去农户收
  o.audit_status = 1
  o.audit_user = userId
  o.audit_time = now()
  o.update_time = now()

  const productId = o.product_id
  const finalPrice = priceAdjust ?? o.expected_price ?? (productId ? (d.product.find(p => p.product_id === productId) || {}).guide_price : null) ?? 0

  // 若有产品且有库存批次 → 直接走 sale_order
  if (productId) {
    const stk = d.stock.filter(s => s.product_id === productId && s.status === 1 && s.quantity > 0)
      .sort((a, b) => a.in_date.localeCompare(b.in_date)) // FIFO
    if (stk.length > 0) {
      let remaining = Number(o.quantity)
      const batchNos = []
      for (const s of stk) {
        if (remaining <= 0) break
        const deduct = Math.min(Number(s.quantity), remaining)
        batchNos.push({ warehouse_id: s.warehouse_id, batch_no: s.batch_no, qty: deduct })
        s.quantity = +(Number(s.quantity) - deduct).toFixed(2)
        if (s.quantity <= 0) s.status = 0
        remaining -= deduct
      }
      // 生成销售订单（按批次拆分；简化：取首个批次，总数量为买方下单量）
      const first = batchNos[0]
      const saleId = nextId(d, 'sale_order')
      const saleNo = genNo('XS')
      d.sale_order.push({
        sale_id: saleId, sale_no: saleNo, channel_id: null /*买方直购*/,
        product_id: productId, batch_no: first.batch_no,
        quantity: Number(o.quantity), price: Number(finalPrice),
        total_amount: +(Number(o.quantity) * Number(finalPrice)).toFixed(2),
        sale_date: now(), out_status: 0, out_date: null,
        pay_status: 0, pay_time: null, create_user: userId,
        create_time: now(), update_time: now()
      })
      o.sale_id = saleId
      // 生成出库单（简化：首批次；多批次场景后续可扩展）
      d.stock_out.push({
        out_id: nextId(d, 'stock_out'), out_no: genNo('CK'), sale_id: saleId,
        warehouse_id: first.warehouse_id, product_id: productId, batch_no: first.batch_no,
        quantity: Number(o.quantity), out_date: now(), operator_id: userId, create_time: now()
      })
      o.pick_status = 2
      // 若还有缺口 → 生成收购计划
      if (remaining > 0) {
        const newBatch = batchNos[batchNos.length - 1]
        const pid = productId
        const pqty = Number(o.quantity) - Number(o.quantity) + 0 // 忽略小量缺口
        d.purchase_plan.push({
          plan_id: nextId(d, 'purchase_plan'), plan_no: genNo('JH'),
          product_id: pid, plan_qty: Math.ceil(remaining), plan_date: o.expected_date,
          create_user: userId, status: 0, remark: `买方订单 ${o.order_no} 缺口收购`,
          create_time: now(), update_time: now()
        })
      }
    } else {
      // 无库存 → 生成收购计划
      d.purchase_plan.push({
        plan_id: nextId(d, 'purchase_plan'), plan_no: genNo('JH'),
        product_id: productId, plan_qty: Number(o.quantity), plan_date: o.expected_date,
        create_user: userId, status: 0, remark: `买方订单 ${o.order_no} 专用收购计划`,
        create_time: now(), update_time: now()
      })
      o.pick_status = 1
    }
  } else {
    // 买方指定了 custom_product_name（系统中还没有该产品）
    // → 先把它注册进 product 表，再生成收购计划
    let newProductId = null
    const exist = d.product.find(p => p.product_name === o.custom_product_name)
    if (exist) {
      newProductId = exist.product_id
      o.product_id = newProductId
    } else {
      newProductId = nextId(d, 'product')
      d.product.push({
        product_id: newProductId, product_name: o.custom_product_name,
        category: '新增', unit: o.unit || '斤', shelf_life: 7,
        guide_price: Number(finalPrice) || 0, status: 1,
        create_time: now(), update_time: now()
      })
      o.product_id = newProductId
    }
    d.purchase_plan.push({
      plan_id: nextId(d, 'purchase_plan'), plan_no: genNo('JH'),
      product_id: newProductId, plan_qty: Number(o.quantity), plan_date: o.expected_date,
      create_user: userId, status: 0, remark: `买方预订新种类 ${o.custom_product_name}，请收购管理员统筹`,
      create_time: now(), update_time: now()
    })
    o.pick_status = 1
  }

  // 通知收购管理员（role=ADMIN）
  const admins = d.sys_user.filter(u => u.role === 'ADMIN')
  admins.forEach(u => {
    d.notice.push({
      notice_id: nextId(d, 'notice'), receiver_type: 5 /*收购管理员*/, receiver_id: u.user_id,
      notice_type: '收购任务', title: `新的买方订单收购任务`, is_read: 0,
      content: `买方 ${o.buyer_name} 预订订单 ${o.order_no} 已通过审核，请按收购计划执行。`,
      create_time: now()
    })
  })
  // 通知买方
  d.notice.push({
    notice_id: nextId(d, 'notice'), receiver_type: 4, receiver_id: o.buyer_id,
    notice_type: '订单反馈', title: '预订订单已通过', is_read: 0,
    content: `您的订单 ${o.order_no} 已通过审核，${o.pick_status === 2 ? '库存已安排，请等待交付' : '已安排收购，请耐心等待'}。`,
    create_time: now()
  })

  commit(d)
  return { ok: true, order_no: o.order_no, sale_id: o.sale_id || null, pick_status: o.pick_status }
}

// 收购管理员：完成收购后，把关联的 buyer_order 状态推进到"已入库"
export async function linkPickStatus(buyerOrderId, status, userId) {
  await delay()
  const d = db()
  const o = d.buyer_order.find(x => x.order_id === buyerOrderId)
  if (!o) return { ok: false, msg: '订单不存在' }
  o.pick_status = Number(status)
  o.update_time = now()
  commit(d)
  return { ok: true }
}
