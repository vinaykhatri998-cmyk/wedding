import Link from 'next/link'
import QRCode from 'qrcode'
import { deleteDraft, signOut } from '@/app/actions'
import { CopyButton, GuestLinks } from '@/components/CopyButton'
import { requireUser } from '@/lib/auth'
import { getPackages, getTemplates, origin, t } from '@/lib/data'
import type { Invitation, Order } from '@/lib/types'
import { missingFields, rupees } from '@/lib/types'

export const metadata = { title: 'My invitations' }
const day = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '')

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ placed?: string; msg?: string }> }) {
  const sp = await searchParams
  const user = await requireUser()
  const [{ data: invs }, { data: ords }, templates, packages, home] = await Promise.all([
    t('invitations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    t('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    getTemplates(true), getPackages(true), origin(),
  ])
  const invitations = (invs || []) as Invitation[], orders = (ords || []) as Order[]
  const ids = invitations.filter((i) => i.status === 'published').map((i) => i.id)
  const { data: rsvps } = ids.length ? await t('rsvps').select('*').in('invitation_id', ids).order('created_at', { ascending: false }) : { data: [] }

  const cards = await Promise.all(invitations.map(async (inv) => {
    const order = orders.find((o) => o.invitation_id === inv.id)
    const pkg = packages.find((p) => p.id === (inv.package_id || order?.package_id))
    const url = inv.slug ? home + '/invite/' + inv.slug : ''
    const live = inv.status === 'published' && (!inv.expires_at || Date.parse(inv.expires_at) > Date.now())
    const qr = live ? await QRCode.toDataURL(url, { width: 600, margin: 2 }) : ''
    return { inv, order, pkg, url, live, qr, tpl: templates.find((x) => x.id === inv.template_id), replies: ((rsvps || []) as { id: string; invitation_id: string; name: string; attending: boolean; message: string | null }[]).filter((r) => r.invitation_id === inv.id) }
  }))

  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 900 }}>
        <div className="row between">
          <div><div className="eyebrow">Signed in as {user.email}</div><h1 style={{ fontSize: 'clamp(34px,6vw,50px)', marginTop: 8 }}>My invitations</h1></div>
          <div className="row"><Link className="btn sm" href="/templates">New invitation</Link><form action={signOut}><button className="btn sm ghost">Sign out</button></form></div>
        </div>
        {sp.placed && <div className="alert ok" role="status" style={{ marginTop: 20 }}>Thank you. We have received your order and will confirm your payment shortly. This page will show your link as soon as it is live.</div>}
        {sp.msg && <div className="alert" style={{ marginTop: 20 }}>{sp.msg}</div>}

        {!cards.length && <div className="card center stack" style={{ marginTop: 28, padding: 44 }}><h2 style={{ fontSize: 30 }}>No invitations yet</h2><p className="muted">Choose a design to begin. It is free to customize and preview.</p><p><Link className="btn" href="/templates">Browse designs</Link></p></div>}

        <div className="stack" style={{ marginTop: 28 }}>
          {cards.map(({ inv, order, pkg, url, live, qr, tpl, replies }) => {
            const names = (inv.data.groom?.name || 'Groom') + ' & ' + (inv.data.bride?.name || 'Bride')
            const pending = order?.status === 'pending_review' && inv.status === 'draft'
            const left = pkg ? (pkg.revisions === -1 ? 'Unlimited' : Math.max(0, pkg.revisions - inv.revisions_used)) : 0
            const expired = inv.status === 'published' && !live
            return (
              <div className="card stack" key={inv.id}>
                <div className="row between">
                  <div><h2 style={{ fontSize: 30 }}>{names}</h2><p className="muted small">{tpl?.name} design{pkg ? ' · ' + pkg.name + ' package' : ''}</p></div>
                  {live ? <span className="tag ok">Live</span> : expired ? <span className="tag bad">Expired</span> : inv.status === 'unpublished' ? <span className="tag bad">Offline</span> : pending ? <span className="tag warn">Payment under review</span> : <span className="tag">Draft</span>}
                </div>

                {live && (
                  <>
                    <div className="copy"><span>{url}</span><CopyButton text={url} /></div>
                    <div className="row">
                      <a className="btn sm" href={url} target="_blank" rel="noopener">Open invitation</a>
                      <a className="btn sm wa" target="_blank" rel="noopener" href={'https://wa.me/?text=' + encodeURIComponent('With great joy we invite you to the wedding of ' + names + '.\n\nOpen your invitation: ' + url)}>Share on WhatsApp</a>
                      <a className="btn sm ghost" href={qr} download={inv.slug + '-qr.png'}>Download QR code</a>
                      <Link className="btn sm ghost" href={'/customize/' + inv.id}>Make a correction</Link>
                    </div>
                    <p className="small muted">Online until {day(inv.expires_at)} · Corrections left: {left}</p>
                    {pkg?.guest_links && <details><summary className="link" style={{ cursor: 'pointer' }}>Make a personal link for a guest</summary><div style={{ marginTop: 12 }}><GuestLinks url={url} names={names} /></div></details>}
                    {pkg?.rsvp_tracking && (
                      <details open={replies.length > 0}><summary className="link" style={{ cursor: 'pointer' }}>RSVP replies ({replies.length}) · {replies.filter((r) => r.attending).length} attending</summary>
                        {replies.length ? <div className="scroll"><table className="t" style={{ marginTop: 8 }}><thead><tr><th>Guest</th><th>Reply</th><th>Message</th></tr></thead><tbody>{replies.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.attending ? 'Attending' : 'Cannot attend'}</td><td>{r.message}</td></tr>)}</tbody></table></div> : <p className="small muted" style={{ marginTop: 8 }}>Replies from your guests will appear here.</p>}
                      </details>
                    )}
                  </>
                )}
                {expired && <p className="muted">This invitation went offline on {day(inv.expires_at)}. <Link className="link" href="/contact">Contact us</Link> to extend it.</p>}
                {inv.status === 'unpublished' && <p className="muted">This invitation is currently offline. <Link className="link" href="/contact">Contact us</Link> if you need help.</p>}
                {pending && <><p>We are checking your payment of <b>{rupees(order!.amount)}</b> (transaction ID {order!.utr}). Your link will appear here once it is confirmed, usually within a few hours.</p><div className="row"><a className="btn sm ghost" href={'/preview/' + inv.id} target="_blank" rel="noopener">Preview</a></div></>}
                {inv.status === 'draft' && !pending && (
                  <>
                    {order?.status === 'rejected' && <div className="alert bad">We could not confirm your payment{order.admin_note ? ': ' + order.admin_note : '.'} Please try again or contact us.</div>}
                    {missingFields(inv.data).length > 0 && <p className="muted small">Still needed: {missingFields(inv.data).join(', ')}</p>}
                    <div className="row">
                      <Link className="btn sm" href={'/customize/' + inv.id}>Continue editing</Link>
                      {!missingFields(inv.data).length && <Link className="btn sm gold" href={'/checkout/' + inv.id}>Pay and go live</Link>}
                      <form action={deleteDraft}><input type="hidden" name="id" value={inv.id} /><button className="btn sm ghost">Delete draft</button></form>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {orders.length > 0 && (
          <div style={{ marginTop: 44 }}>
            <h2 style={{ fontSize: 28, marginBottom: 10 }}>Payment history</h2>
            <div className="card scroll" style={{ padding: 8 }}><table className="t"><thead><tr><th>Order</th><th>Date</th><th>Package</th><th>Amount</th><th>Transaction ID</th><th>Status</th></tr></thead>
              <tbody>{orders.map((o) => <tr key={o.id}><td>#{o.order_no}</td><td>{day(o.created_at)}</td><td>{packages.find((p) => p.id === o.package_id)?.name}</td><td>{rupees(o.amount)}</td><td>{o.utr || '–'}</td><td>{{ pending_review: 'Under review', paid: 'Paid', rejected: 'Not confirmed', refunded: 'Refunded' }[o.status]}</td></tr>)}</tbody></table></div>
          </div>
        )}
        <p className="small muted" style={{ marginTop: 26 }}>Need help or a correction? <Link className="link" href="/contact">Contact support</Link>.</p>
      </div>
    </section>
  )
}
