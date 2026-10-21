/**
 * 模拟数据库层 - 基于localStorage持久化
 * 对应SQL脚本18张表：farmer/buyer/sys_user/product/supply_info/purchase_plan/purchase_order/
 * settlement/settlement_item/warehouse/stock/stock_in/channel/sale_order/stock_out/
 * price/notice/sys_log/buyer_order
 */

const KEY = 'huinong_db_v1'

// 生成单号工具
const pad = (n, len = 6) => String(n).padStart(len, '0')
export function genNo(prefix) {
  const d = new Date()
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}`
  const rand = Math.floor(Math.random() * 900000 + 100000)
  return `${prefix}${ymd}${rand}`
}
export function today() {
  return new Date().toISOString().slice(0, 10)
}
export function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// 种子数据
function seed() {
  const sys_user = [
    { user_id: 1, username: 'admin', password: '123456', real_name: '系统管理员', phone: '13800000001', role: 'SYS', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { user_id: 2, username: 'buyer', password: '123456', real_name: '李收购', phone: '13800000002', role: 'ADMIN', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { user_id: 3, username: 'sale', password: '123456', real_name: '王销售', phone: '13800000003', role: 'SALES', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' }
  ]

  // ========== 新增：买方表 ==========
  const buyer = [
    { buyer_id: 1, buyer_name: '北方批发市场', short_name: '北方农批', contact: '刘老板', phone: '13700000001', address: '北方农批市场A区', buyer_type: '批发商', credit_level: 3, auth_status: 1, remark: '长期合作', create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { buyer_id: 2, buyer_name: '鲜达商超', short_name: '鲜达', contact: '陈经理', phone: '13700000002', address: '城区连锁超市', buyer_type: '商超', credit_level: 3, auth_status: 1, remark: '', create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { buyer_id: 3, buyer_name: '绿源加工厂', short_name: '绿源', contact: '周厂长', phone: '13700000004', address: '工业园B栋', buyer_type: '加工企业', credit_level: 2, auth_status: 0, remark: '新注册待审核', create_time: '2026-10-15 09:00:00', update_time: '2026-10-15 09:00:00' }
  ]
  // 买方 sys_user 初始账号（与 buyer 表一一对应，密码 123456，auth_status 决定能否登录）
  sys_user.push(
    { user_id: 4, username: 'buyer1', password: '123456', real_name: '北方批发市场', phone: '13700000001', role: 'BUYER', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { user_id: 5, username: 'buyer2', password: '123456', real_name: '鲜达商超', phone: '13700000002', role: 'BUYER', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' }
  )

  const farmer = [
    { farmer_id: 1, farmer_name: '张三', phone: '13900000001', id_card: '330102199001011234', address: '青山镇青山村1组', bank_card: '6228480401234567890', auth_status: 1, remark: '种植蔬菜为主', create_time: '2026-09-05 09:00:00', update_time: '2026-09-05 09:00:00' },
    { farmer_id: 2, farmer_name: '李四', phone: '13900000002', id_card: '330102199203032345', address: '青山镇青山村2组', bank_card: '6228480402234567891', auth_status: 1, remark: '果园种植户', create_time: '2026-09-06 09:00:00', update_time: '2026-09-06 09:00:00' },
    { farmer_id: 3, farmer_name: '王五', phone: '13900000003', id_card: '330102198805053456', address: '青山镇绿水村3组', bank_card: '6228480403234567892', auth_status: 0, remark: '待认证', create_time: '2026-10-08 09:00:00', update_time: '2026-10-08 09:00:00' }
  ]

  const product = [
    { product_id: 1, product_name: '西红柿', category: '蔬菜', unit: '斤', shelf_life: 7, guide_price: 2.50, status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { product_id: 2, product_name: '黄瓜', category: '蔬菜', unit: '斤', shelf_life: 5, guide_price: 3.00, status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { product_id: 3, product_name: '苹果', category: '水果', unit: '斤', shelf_life: 30, guide_price: 4.50, status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { product_id: 4, product_name: '水稻', category: '粮食', unit: '斤', shelf_life: 365, guide_price: 1.60, status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { product_id: 5, product_name: '土鸡', category: '畜禽', unit: '只', shelf_life: 2, guide_price: 25.00, status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' }
  ]

  const supply_info = [
    { supply_id: 1, farmer_id: 1, product_id: 1, expect_qty: 1200, harvest_date: '2026-10-10', address: '青山村1组大棚', image_url: '', audit_status: 1, audit_user: 2, audit_time: '2026-10-01 10:00:00', create_time: '2026-09-28 09:00:00', update_time: '2026-10-01 10:00:00' },
    { supply_id: 2, farmer_id: 2, product_id: 3, expect_qty: 3000, harvest_date: '2026-10-15', address: '果园东片', image_url: '', audit_status: 1, audit_user: 2, audit_time: '2026-10-02 10:00:00', create_time: '2026-09-29 09:00:00', update_time: '2026-10-02 10:00:00' },
    { supply_id: 3, farmer_id: 1, product_id: 2, expect_qty: 800, harvest_date: '2026-10-12', address: '青山村1组', image_url: '', audit_status: 0, audit_user: null, audit_time: null, create_time: '2026-10-08 09:00:00', update_time: '2026-10-08 09:00:00' }
  ]

  const purchase_plan = [
    { plan_id: 1, plan_no: 'JH20261008000001', product_id: 1, plan_qty: 1000, plan_date: '2026-10-10', create_user: 2, status: 1, remark: '西红柿集中收购', create_time: '2026-10-01 08:00:00', update_time: '2026-10-01 08:00:00' },
    { plan_id: 2, plan_no: 'JH20261008000002', product_id: 3, plan_qty: 2500, plan_date: '2026-10-15', create_user: 2, status: 0, remark: '苹果收购计划', create_time: '2026-10-05 08:00:00', update_time: '2026-10-05 08:00:00' }
  ]

  const purchase_order = [
    { order_id: 1, order_no: 'SG20261008000001', supply_id: 1, plan_id: 1, farmer_id: 1, product_id: 1, gross_weight: 1210.000, tare_weight: 10.000, net_weight: 1200.000, price: 2.50, deduct_amount: 20.00, total_amount: 2980.00, quality_grade: '一级', purchase_date: '2026-10-10 11:00:00', operator_id: 2, settle_status: 1, status: 2, create_time: '2026-10-10 11:00:00', update_time: '2026-10-10 11:30:00' },
    { order_id: 2, order_no: 'SG20261011000001', supply_id: null, plan_id: null, farmer_id: 2, product_id: 3, gross_weight: 505.000, tare_weight: 5.000, net_weight: 500.000, price: 4.50, deduct_amount: 0.00, total_amount: 2250.00, quality_grade: '二级', purchase_date: '2026-10-11 10:00:00', operator_id: 2, settle_status: 0, status: 1, create_time: '2026-10-11 10:00:00', update_time: '2026-10-11 10:00:00' }
  ]

  const settlement = [
    { settlement_id: 1, settlement_no: 'JS20261011000001', farmer_id: 1, start_date: '2026-10-01', end_date: '2026-10-11', total_amount: 2980.00, pay_method: '银行转账', pay_time: '2026-10-11 15:00:00', status: 2, create_user: 2, create_time: '2026-10-11 14:00:00', update_time: '2026-10-11 15:00:00' }
  ]
  const settlement_item = [
    { item_id: 1, settlement_id: 1, order_id: 1, amount: 2980.00 }
  ]

  const warehouse = [
    { warehouse_id: 1, warehouse_name: '1号冷库', location: '收购点北侧', manager_id: 2, status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { warehouse_id: 2, warehouse_name: '2号常温仓', location: '收购点东侧', manager_id: 3, status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' }
  ]

  const stock = [
    { stock_id: 1, warehouse_id: 1, product_id: 1, batch_no: 'SG20261008000001', quantity: 1200.00, in_date: '2026-10-10', warn_date: '2026-10-17', status: 1, create_time: '2026-10-10 12:00:00', update_time: '2026-10-10 12:00:00' },
    { stock_id: 2, warehouse_id: 2, product_id: 3, batch_no: 'SG20261011000001', quantity: 500.00, in_date: '2026-10-11', warn_date: '2026-11-10', status: 1, create_time: '2026-10-11 11:00:00', update_time: '2026-10-11 11:00:00' }
  ]

  const stock_in = [
    { in_id: 1, in_no: 'RK20261010000001', order_id: 1, warehouse_id: 1, product_id: 1, batch_no: 'SG20261008000001', quantity: 1200.00, in_date: '2026-10-10 12:00:00', operator_id: 2, create_time: '2026-10-10 12:00:00' },
    { in_id: 2, in_no: 'RK20261011000001', order_id: 2, warehouse_id: 2, product_id: 3, batch_no: 'SG20261011000001', quantity: 500.00, in_date: '2026-10-11 11:00:00', operator_id: 2, create_time: '2026-10-11 11:00:00' }
  ]

  const channel = [
    { channel_id: 1, channel_name: '北方批发市场', channel_type: '批发商', contact: '刘老板', phone: '13700000001', address: '北方农批市场A区', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { channel_id: 2, channel_name: '鲜达商超', channel_type: '商超', contact: '陈经理', phone: '13700000002', address: '城区连锁超市', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { channel_id: 3, channel_name: '助农电商', channel_type: '电商', contact: '在线客服', phone: '13700000003', address: '线上平台', status: 1, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' },
    { channel_id: 4, channel_name: '绿源加工厂', channel_type: '加工企业', contact: '周厂长', phone: '13700000004', address: '工业园B栋', status: 0, create_time: '2026-09-01 08:00:00', update_time: '2026-09-01 08:00:00' }
  ]

  const sale_order = [
    { sale_id: 1, sale_no: 'XS20261012000001', channel_id: 1, product_id: 1, batch_no: 'SG20261008000001', quantity: 500.00, price: 3.20, total_amount: 1600.00, sale_date: '2026-10-12 09:00:00', out_status: 1, out_date: '2026-10-12 10:00:00', pay_status: 1, pay_time: '2026-10-12 14:00:00', create_user: 3, create_time: '2026-10-12 09:00:00', update_time: '2026-10-12 14:00:00' },
    { sale_id: 2, sale_no: 'XS20261012000002', channel_id: 2, product_id: 3, batch_no: 'SG20261011000001', quantity: 300.00, price: 5.50, total_amount: 1650.00, sale_date: '2026-10-12 09:30:00', out_status: 0, out_date: null, pay_status: 0, pay_time: null, create_user: 3, create_time: '2026-10-12 09:30:00', update_time: '2026-10-12 09:30:00' }
  ]

  const stock_out = [
    { out_id: 1, out_no: 'CK20261012000001', sale_id: 1, warehouse_id: 1, product_id: 1, batch_no: 'SG20261008000001', quantity: 500.00, out_date: '2026-10-12 10:00:00', operator_id: 3, create_time: '2026-10-12 10:00:00' }
  ]

  const price = [
    { price_id: 1, product_id: 1, price_date: '2026-10-12', guide_price: 2.50, create_time: '2026-10-12 08:00:00' },
    { price_id: 2, product_id: 2, price_date: '2026-10-12', guide_price: 3.00, create_time: '2026-10-12 08:00:00' },
    { price_id: 3, product_id: 3, price_date: '2026-10-12', guide_price: 4.50, create_time: '2026-10-12 08:00:00' },
    { price_id: 4, product_id: 1, price_date: '2026-10-11', guide_price: 2.40, create_time: '2026-10-11 08:00:00' },
    { price_id: 5, product_id: 1, price_date: '2026-10-10', guide_price: 2.30, create_time: '2026-10-10 08:00:00' }
  ]

  const notice = [
    { notice_id: 1, receiver_type: 1, receiver_id: 1, notice_type: '送货提醒', title: '请按时送货', content: '您的西红柿供货已审核通过，请于10月10日送货至收购点。', is_read: 1, create_time: '2026-10-01 10:05:00' },
    { notice_id: 2, receiver_type: 1, receiver_id: 1, notice_type: '结算提醒', title: '结算已打款', content: '您的结算单 JS20261011000001 已打款2980元，请确认。', is_read: 0, create_time: '2026-10-11 15:05:00' },
    { notice_id: 3, receiver_type: 2, receiver_id: 3, notice_type: '库存预警', title: '西红柿即将临期', content: '1号冷库西红柿批次SG20261008000001将于10月17日到期，请优先销售。', is_read: 0, create_time: '2026-10-12 08:00:00' }
  ]

  const sys_log = [
    { log_id: 1, user_id: 2, user_name: '李收购', operation: '生成收购单 SG20261008000001', method: 'POST /api/purchase-order', ip: '192.168.1.10', create_time: '2026-10-10 11:00:00' },
    { log_id: 2, user_id: 3, user_name: '王销售', operation: '创建销售订单 XS20261012000001', method: 'POST /api/sale-order', ip: '192.168.1.20', create_time: '2026-10-12 09:00:00' }
  ]

  // ========== 新增：买方预订订单 ==========
  // audit_status: 0 待销售审核 / 1 销售审核通过（生成收购计划） / 2 销售审核拒绝
  // pick_status: 0 待收购 / 1 收购中 / 2 已入库 / 3 已交付给买方
  const buyer_order = [
    { order_id: 1, order_no: 'DY20261013000001', buyer_id: 1, buyer_name: '北方批发市场', product_id: 1, custom_product_name: null, unit: '斤', quantity: 500, expected_date: '2026-10-20', expected_price: 3.20, buyer_note: '要求当日新鲜', audit_status: 1, audit_user: 3, audit_time: '2026-10-13 10:00:00', pick_status: 2, sale_id: 1, reject_reason: null, create_time: '2026-10-13 09:00:00', update_time: '2026-10-13 14:00:00' },
    { order_id: 2, order_no: 'DY20261015000001', buyer_id: 2, buyer_name: '鲜达商超', product_id: null, custom_product_name: '胡萝卜', unit: '斤', quantity: 2000, expected_date: '2026-10-25', expected_price: 2.00, buyer_note: '新上市胡萝卜，有多少收多少', audit_status: 0, audit_user: null, audit_time: null, pick_status: 0, sale_id: null, reject_reason: null, create_time: '2026-10-15 08:30:00', update_time: '2026-10-15 08:30:00' },
    { order_id: 3, order_no: 'DY20261016000001', buyer_id: 3, buyer_name: '绿源加工厂', product_id: 3, custom_product_name: null, unit: '斤', quantity: 5000, expected_date: '2026-11-01', expected_price: 4.00, buyer_note: '用于果汁加工', audit_status: 2, audit_user: 3, audit_time: '2026-10-16 09:00:00', pick_status: 0, sale_id: null, reject_reason: '供应商资质待完善', create_time: '2026-10-16 08:00:00', update_time: '2026-10-16 09:00:00' }
  ]

  return {
    sys_user, farmer, buyer, product, supply_info, purchase_plan, purchase_order,
    settlement, settlement_item, warehouse, stock, stock_in, channel,
    sale_order, stock_out, price, notice, sys_log, buyer_order,
    seq: {
      farmer: 4, sys_user: 6, product: 6, supply_info: 4, purchase_plan: 3,
      purchase_order: 3, settlement: 2, settlement_item: 2, warehouse: 3,
      stock: 3, stock_in: 3, channel: 5, sale_order: 3, stock_out: 2,
      price: 6, notice: 4, sys_log: 3, buyer: 4, buyer_order: 4
    }
  }
}

// ============ 共享存储（Netlify 云函数，与站点同域） ============
// 生产环境通过 /api/state 读写云端整库快照；开发环境或接口不可用时自动降级为本地模式
const API_BASE = import.meta.env.VITE_STATE_API || '/api/state'
const REMOTE = !import.meta.env.DEV

let _db = null          // 内存缓存（全库快照）
let _lastPull = 0       // 上次远端拉取时间
let _pushChain = Promise.resolve() // 写队列，保证写入顺序
let _pullPromise = null // 进行中的拉取，避免并发重复请求

// 读取远端整库快照；无有效数据返回 null
async function fetchRemote() {
  const res = await fetch(API_BASE, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error('远端读取失败 ' + res.status)
  const j = await res.json()
  const data = j && j.data
  return (data && Array.isArray(data.sys_user)) ? data : null
}

// 覆盖写入远端整库快照
async function pushRemote(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data })
  })
  if (!res.ok) throw new Error('远端写入失败 ' + res.status)
}

function safeGetLocal() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null } catch (e) { return null }
}
function safeSetLocal(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch (e) { /* ignore */ }
}

// 兼容式演进：旧本地数据/远端数据可能没有 buyer、buyer_order 表，自动补齐
function ensureSchema(d) {
  const missing = []
  if (!d.buyer) { d.buyer = []; missing.push('buyer') }
  if (!d.buyer_order) { d.buyer_order = []; missing.push('buyer_order') }
  if (!d.seq) d.seq = {}
  if (missing.length) {
    // 若之前已有 channel 表数据，把 channel 同步一份成 buyer（auth_status=1）便于平滑升级
    if (missing.includes('buyer') && Array.isArray(d.channel)) {
      d.channel.forEach(c => {
        d.buyer.push({
          buyer_id: d.seq.buyer = (d.seq.buyer || 0) + 1,
          buyer_name: c.channel_name, short_name: c.channel_name, contact: c.contact,
          phone: c.phone, address: c.address, buyer_type: c.channel_type,
          credit_level: 3, auth_status: c.status ? 1 : 0, remark: '',
          create_time: d.create_time || now(), update_time: now()
        })
      })
    }
    missing.forEach(t => { if (!(t in d.seq)) d.seq[t] = 1 })
  }
  return missing.length > 0
}

// 应用启动时初始化：优先远端数据，其次本地缓存，最后种子数据
export async function initDB() {
  if (!REMOTE) { loadDB(); return false }
  try {
    const remote = await fetchRemote()
    if (remote) {
      _db = remote
      if (ensureSchema(_db)) { saveDB(_db); await pushRemote(_db) }
    } else {
      _db = safeGetLocal() || seed()
      await pushRemote(_db)
    }
    safeSetLocal(_db)
    _lastPull = Date.now()
    return true
  } catch (e) {
    console.warn('[共享存储] 初始化失败，已降级为本地模式：', e.message)
    _db = safeGetLocal() || seed()
    ensureSchema(_db)
    return false
  }
}

// 每次接口调用前刷新缓存（带节流 + 并发去重，避免频繁网络请求）
export async function ensureFresh(maxAge = 1000) {
  if (!REMOTE) return
  if (Date.now() - _lastPull < maxAge) return
  if (_pullPromise) { await _pullPromise; return }
  _pullPromise = (async () => {
    try {
      await _pushChain                     // 等待本机未完成写入落库
      const remote = await fetchRemote()
      if (remote) { _db = remote; safeSetLocal(_db); _lastPull = Date.now() }
    } catch (e) {
      console.warn('[共享存储] 拉取最新数据失败，暂用本地缓存：', e.message)
    }
  })()
  try { await _pullPromise } finally { _pullPromise = null }
}

export function loadDB() {
  if (!_db) _db = safeGetLocal() || seed()
  return _db
}

export function saveDB(data) {
  _db = data
  safeSetLocal(data)
  if (REMOTE) {
    const snap = data
    _pushChain = _pushChain.then(() => pushRemote(snap)).catch(e => console.warn('[共享存储] 保存失败：', e.message))
  }
}

export function resetDB() {
  const data = seed()
  saveDB(data)
  return data
}

export { addDays }
