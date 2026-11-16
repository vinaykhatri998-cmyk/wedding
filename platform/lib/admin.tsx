import { reviewOrder } from '@/app/actions'
import type { Order } from '@/lib/types'
import { rupees } from '@/lib/types'

export const when = (s: string | null) => (s ? new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '')
export const date = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '')
export const STATUS: Record<string, [string, string]> = { pending_review: ['Needs checking', 'warn'], paid: ['Paid', 'ok'], rejected: ['Rejected', 'bad'], refunded: ['Refunded', ''] }

export type OrderRow = Order & { email?: string; names?: string }
export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  if (!orders.length) return <p className="muted">No orders here.</p>
  return (
    <div className="card scroll" style={{ padding: 8 }}>
      <table className="t">
        <thead><tr><th>Order</th><th>Customer</th><th>Couple</th><th>Package</th><th>Amount</th><th>Transaction ID</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{orders.map((o) => (
          <tr key={o.id}>
            <td>#{o.order_no}<div className="small muted">{when(o.created_at)}</div></td>
            <td>{o.email}</td>
            <td>{o.names}<div><a className="link small" href={'/preview/' + o.invitation_id} target="_blank" rel="noopener">Preview</a></div></td>
            <td>{o.package_id}{o.coupon_code && <div className="small muted">Coupon {o.coupon_code}</div>}</td>
            <td><b>{rupees(o.amount)}</b></td>
            <td style={{ fontFamily: 'ui-monospace,monospace' }}>{o.utr || '–'}</td>
            <td><span className={'tag ' + STATUS[o.status][1]}>{STATUS[o.status][0]}</span>{o.admin_note && <div className="small muted" style={{ marginTop: 4 }}>{o.admin_note}</div>}</td>
            <td>
              {o.status === 'pending_review' && (
                <form action={reviewOrder} className="stack" style={{ minWidth: 190 }}>
                  <input type="hidden" name="id" value={o.id} />
                  <input className="in" name="note" placeholder="Note (shown if rejected)" maxLength={300} style={{ marginTop: 0, padding: '8px 10px', fontSize: 13 }} />
                  <div className="row"><button className="btn sm ok" name="decision" value="approve">Approve</button><button className="btn sm bad" name="decision" value="reject">Reject</button></div>
                </form>
              )}
              {o.status === 'paid' && <form action={reviewOrder}><input type="hidden" name="id" value={o.id} /><button className="btn sm ghost" name="decision" value="refund">Mark refunded</button></form>}
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
