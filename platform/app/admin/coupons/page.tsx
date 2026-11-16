import { saveCoupon, toggleCoupon } from '@/app/actions'
import { t } from '@/lib/data'

export default async function Coupons() {
  const { data } = await t('coupons').select('*').order('created_at', { ascending: false })
  const coupons = (data || []) as { code: string; percent_off: number; max_uses: number | null; used: number; active: boolean }[]
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Coupons</h1>
      <form action={saveCoupon} className="card row" style={{ alignItems: 'flex-end' }}>
        <label className="f">Code<input className="in" name="code" required maxLength={20} placeholder="WELCOME10" style={{ textTransform: 'uppercase' }} /></label>
        <label className="f">Discount %<input className="in" name="percent" type="number" min={1} max={100} required /></label>
        <label className="f">Maximum uses<input className="in" name="max" type="number" min={1} placeholder="No limit" /></label>
        <button className="btn sm" style={{ minHeight: 48 }}>Create coupon</button>
      </form>
      <div className="card scroll" style={{ padding: 8 }}>
        <table className="t"><thead><tr><th>Code</th><th>Discount</th><th>Used</th><th>Status</th><th></th></tr></thead>
          <tbody>{coupons.map((c) => (
            <tr key={c.code}><td><b>{c.code}</b></td><td>{c.percent_off}%</td><td>{c.used}{c.max_uses ? ' of ' + c.max_uses : ''}</td><td><span className={'tag ' + (c.active ? 'ok' : '')}>{c.active ? 'Active' : 'Off'}</span></td>
              <td><form action={toggleCoupon} className="row"><input type="hidden" name="code" value={c.code} /><button className="btn sm ghost" name="act" value={c.active ? 'off' : 'on'}>{c.active ? 'Turn off' : 'Turn on'}</button><button className="btn sm ghost" name="act" value="delete">Delete</button></form></td></tr>
          ))}</tbody></table>
        {!coupons.length && <p className="muted" style={{ padding: 12 }}>No coupons yet.</p>}
      </div>
    </div>
  )
}
