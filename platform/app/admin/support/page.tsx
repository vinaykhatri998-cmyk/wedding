import { closeSupport } from '@/app/actions'
import { when } from '@/lib/admin'
import { t } from '@/lib/data'

export default async function Support() {
  const { data } = await t('support_requests').select('*').order('created_at', { ascending: false }).limit(200)
  const rows = (data || []) as { id: string; email: string; message: string; status: string; created_at: string }[]
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Support requests</h1>
      <p className="muted">Reply to customers by email, then mark the request as done.</p>
      {rows.map((r) => (
        <div className="card stack" key={r.id} style={{ opacity: r.status === 'closed' ? .6 : 1 }}>
          <div className="row between"><a className="link" href={'mailto:' + r.email}>{r.email}</a><span className="small muted">{when(r.created_at)}</span></div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{r.message}</p>
          <form action={closeSupport}><input type="hidden" name="id" value={r.id} /><button className="btn sm ghost" name="act" value={r.status === 'open' ? 'close' : 'open'}>{r.status === 'open' ? 'Mark as done' : 'Reopen'}</button></form>
        </div>
      ))}
      {!rows.length && <p className="muted">No messages yet.</p>}
    </div>
  )
}
