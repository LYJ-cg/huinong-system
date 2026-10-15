/**
 * Netlify 云函数：共享数据读写接口（与站点同域，国内可直接访问）
 * GET  /api/state  读取整库快照
 * POST /api/state  覆盖保存整库快照
 * 数据存放于 Netlify Blobs，无需外部数据库
 */
import { getStore } from '@netlify/blobs'

const STORE_NAME = 'huinong'
const KEY = 'state'

export default async function handler(req) {
  const store = getStore(STORE_NAME)

  if (req.method === 'GET') {
    const data = await store.get(KEY, { type: 'json' })
    return Response.json({ data: data || null })
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let body
    try { body = await req.json() } catch (e) {
      return Response.json({ ok: false, msg: 'invalid json' }, { status: 400 })
    }
    const data = body && body.data ? body.data : body
    if (!data || typeof data !== 'object') {
      return Response.json({ ok: false, msg: 'invalid payload' }, { status: 400 })
    }
    await store.setJSON(KEY, data)
    return Response.json({ ok: true })
  }

  return new Response('Method Not Allowed', { status: 405 })
}

export const config = { path: '/api/state' }
