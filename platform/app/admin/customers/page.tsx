import { date } from '@/lib/admin'
import { t } from '@/lib/data'
import { rupees } from '@/lib/types'

export default async function Customers() {
  const [{ data: profs }, { data: orders }, { data: invs }] = await Promise.all([
    t('profiles').select('*').order('created_at', { ascending: false }).limit(500),
    t('orders').select('user_id,amount,status'), t('invitations').select('user_id'),
  ])
  const o = (orders || []) as { user_id: string; amount: number; status: string }[], i = (invs || []) as { user_id: string }[]
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Customers</h1>
      <div className="card scroll" style={{ padding: 8 }}>
        <table className="t"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Invitations</th><th>Paid</th></tr></thead>
          <tbody>{((profs || []) as { id: string; email: string; full_name: string; created_at: string }[]).map((p) => (
            <tr key={p.id}><td>{p.full_name}</td><td>{p.email}</td><td>{date(p.created_at)}</td><td>{i.filter((x) => x.user_id === p.id).length}</td><td>{rupees(o.filter((x) => x.user_id === p.id && x.status === 'paid').reduce((a, x) => a + x.amount, 0))}</td></tr>
          ))}</tbody></table>
      </div>
    </div>
  )
}
