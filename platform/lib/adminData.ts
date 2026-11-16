import 'server-only'
import { t } from './data'
import type { Invitation, Order } from './types'
import type { OrderRow } from './admin'

export async function ordersWithNames(status?: string, limit = 200): Promise<OrderRow[]> {
  let q = t('orders').select('*').order('created_at', { ascending: false }).limit(limit)
  if (status) q = q.eq('status', status)
  const { data } = await q
  const orders = (data || []) as Order[]
  if (!orders.length) return []
  const [{ data: profs }, { data: invs }] = await Promise.all([
    t('profiles').select('id,email').in('id', [...new Set(orders.map((o) => o.user_id))]),
    t('invitations').select('id,data').in('id', [...new Set(orders.map((o) => o.invitation_id))]),
  ])
  return orders.map((o) => {
    const inv = ((invs || []) as Pick<Invitation, 'id' | 'data'>[]).find((i) => i.id === o.invitation_id)
    return { ...o, email: ((profs || []) as { id: string; email: string }[]).find((p) => p.id === o.user_id)?.email, names: inv ? (inv.data.groom?.name || '?') + ' & ' + (inv.data.bride?.name || '?') : '' }
  })
}
