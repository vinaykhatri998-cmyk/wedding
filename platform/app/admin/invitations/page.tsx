import Link from 'next/link'
import { adminInvitation } from '@/app/actions'
import { date } from '@/lib/admin'
import { getPackages, t } from '@/lib/data'
import type { Invitation } from '@/lib/types'

export default async function Invitations() {
  const [{ data }, packages] = await Promise.all([t('invitations').select('*').order('created_at', { ascending: false }).limit(300), getPackages(true)])
  const invs = (data || []) as Invitation[]
  const { data: profs } = invs.length ? await t('profiles').select('id,email').in('id', [...new Set(invs.map((i) => i.user_id))]) : { data: [] }
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Invitations</h1>
      <div className="card scroll" style={{ padding: 8 }}>
        <table className="t">
          <thead><tr><th>Couple</th><th>Customer</th><th>Design</th><th>Status</th><th>Online until</th><th>Actions</th></tr></thead>
          <tbody>{invs.map((i) => {
            const expired = i.status === 'published' && i.expires_at && Date.parse(i.expires_at) < Date.now()
            return (
              <tr key={i.id}>
                <td>{i.data.groom?.name || '?'} &amp; {i.data.bride?.name || '?'}<div className="small">{i.slug && i.status === 'published' ? <a className="link" href={'/invite/' + i.slug} target="_blank" rel="noopener">/invite/{i.slug}</a> : <a className="link" href={'/preview/' + i.id} target="_blank" rel="noopener">Preview</a>}</div></td>
                <td>{((profs || []) as { id: string; email: string }[]).find((p) => p.id === i.user_id)?.email}</td>
                <td>{i.template_id}<div className="small muted">{i.package_id || 'no package'}</div></td>
                <td><span className={'tag ' + (expired ? 'bad' : i.status === 'published' ? 'ok' : i.status === 'unpublished' ? 'bad' : '')}>{expired ? 'Expired' : i.status}</span></td>
                <td>{date(i.expires_at)}<div className="small muted">Corrections used: {i.revisions_used}</div></td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <Link className="btn sm ghost" href={'/customize/' + i.id}>Edit</Link>
                    <form action={adminInvitation} className="row" style={{ gap: 6 }}>
                      <input type="hidden" name="id" value={i.id} />
                      {i.status === 'published' ? <button className="btn sm bad" name="act" value="unpublish">Unpublish</button> : (
                        <>{!i.package_id && <select name="pkg" className="in" style={{ width: 'auto', marginTop: 0, padding: '7px 8px', fontSize: 13 }}>{packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}<button className="btn sm ok" name="act" value="publish">Publish</button></>
                      )}
                      {i.status !== 'draft' && <><select name="months" className="in" style={{ width: 'auto', marginTop: 0, padding: '7px 8px', fontSize: 13 }} defaultValue="3"><option value="1">+1 month</option><option value="3">+3 months</option><option value="6">+6 months</option><option value="12">+12 months</option></select><button className="btn sm ghost" name="act" value="extend">Extend</button><button className="btn sm ghost" name="act" value="revisions">Reset corrections</button></>}
                    </form>
                  </div>
                </td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )
}
