import Link from 'next/link'
import { OrdersTable } from '@/lib/admin'
import { ordersWithNames } from '@/lib/adminData'
import { getSettings, t } from '@/lib/data'
import { rupees } from '@/lib/types'

export default async function AdminHome() {
  const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0)
  const [{ data: paid }, { count: live }, { count: customers }, pending, s] = await Promise.all([
    t('orders').select('amount,created_at').eq('status', 'paid'),
    t('invitations').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    t('profiles').select('id', { count: 'exact', head: true }),
    ordersWithNames('pending_review'), getSettings(),
  ])
  const rows = (paid || []) as { amount: number; created_at: string }[]
  const total = rows.reduce((a, r) => a + r.amount, 0)
  const month = rows.filter((r) => Date.parse(r.created_at) >= monthStart.getTime()).reduce((a, r) => a + r.amount, 0)
  const stats: [string, string][] = [['Revenue this month', rupees(month)], ['Total revenue', rupees(total)], ['Paid orders', String(rows.length)], ['Live invitations', String(live || 0)], ['Customers', String(customers || 0)]]
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Overview</h1>
      {!s.upi_id && !s.qr_image && <div className="alert">Payments are not set up yet. Add your UPI ID in <Link className="link" href="/admin/settings">Settings</Link> so customers can pay.</div>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>{stats.map(([k, v]) => <div className="card" key={k}><div className="eyebrow">{k}</div><div className="stat" style={{ marginTop: 10 }}>{v}</div></div>)}</div>
      <h2 style={{ fontSize: 28, marginTop: 30 }}>Payments waiting for you ({pending.length})</h2>
      <p className="muted small">Open your UPI app, find the payment with the same transaction ID and amount, then approve. Approving publishes the invitation and gives the customer their link.</p>
      <OrdersTable orders={pending} />
    </div>
  )
}
