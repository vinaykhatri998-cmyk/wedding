import Link from 'next/link'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { placeOrder, priceFor } from '@/app/actions'
import { packageFeatures } from '@/components/ui'
import { requireUser } from '@/lib/auth'
import { getOwnInvitation, getPackages, getSettings, getTemplate, latestOrder } from '@/lib/data'
import { db } from '@/lib/supabase'
import { missingFields, rupees } from '@/lib/types'

export const metadata = { title: 'Checkout' }

export default async function Checkout({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pkg?: string; coupon?: string; err?: string }> }) {
  const { id } = await params
  const sp = await searchParams
  const user = await requireUser('/checkout/' + id)
  const inv = await getOwnInvitation(id, user)
  if (!inv || inv.user_id !== user.id || inv.status !== 'draft') redirect('/dashboard')
  if (missingFields(inv.data).length) redirect('/customize/' + inv.id)
  const last = await latestOrder(inv.id)
  if (last?.status === 'pending_review') redirect('/dashboard')

  const [tpl, all, s] = await Promise.all([getTemplate(inv.template_id), getPackages(), getSettings()])
  const allowed = all.filter((p) => tpl?.tier !== 'premium' || p.premium_templates)
  const chosen = allowed.find((p) => p.id === sp.pkg) || allowed[allowed.length === all.length ? Math.min(1, allowed.length - 1) : 0]
  if (!chosen) redirect('/dashboard')
  const coupon = (sp.coupon || '').trim()
  const price = (await priceFor(chosen.id, coupon))!
  const amount = price.amount
  const base = '/checkout/' + inv.id

  let qr = '', qrIsImage = false
  if (amount > 0) {
    if (s.upi_id) {
      const upi = 'upi://pay?pa=' + encodeURIComponent(s.upi_id) + '&pn=' + encodeURIComponent(s.upi_name || 'Shubh Nimantran') + '&am=' + amount + '.00&cu=INR&tn=' + encodeURIComponent('Invitation ' + inv.id.slice(0, 8))
      qr = await QRCode.toDataURL(upi, { width: 520, margin: 2, color: { dark: '#231a16', light: '#ffffff' } })
    } else if (s.qr_image) {
      const { data } = await db().storage.from('photos').createSignedUrl(s.qr_image, 3600)
      qr = data?.signedUrl || ''; qrIsImage = true
    }
  }

  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 900 }}>
        <div className="eyebrow">Checkout</div>
        <h1 style={{ fontSize: 'clamp(34px,6vw,50px)', margin: '10px 0 6px' }}>{inv.data.groom.name} &amp; {inv.data.bride.name}</h1>
        <p className="muted">{tpl?.name} design · <Link className="link" href={'/customize/' + inv.id}>Edit details</Link></p>
        {sp.err && <div className="alert bad" role="alert" style={{ marginTop: 18 }}>{sp.err}</div>}
        {last?.status === 'rejected' && <div className="alert bad" style={{ marginTop: 18 }}>Your earlier payment could not be confirmed{last.admin_note ? ': ' + last.admin_note : '.'} You can try again below.</div>}

        <h2 style={{ fontSize: 28, margin: '34px 0 14px' }}>1. Choose your package</h2>
        <div className="grid g3">
          {allowed.map((p) => (
            <Link key={p.id} scroll={false} href={base + '?pkg=' + p.id + (coupon ? '&coupon=' + encodeURIComponent(coupon) : '')} className={'card price' + (p.id === chosen.id ? ' pop' : '')} style={{ textDecoration: 'none', padding: 18 }} aria-current={p.id === chosen.id}>
              <div className="row between"><span className="eyebrow">{p.name}</span>{p.id === chosen.id && <span className="tag ok">Selected</span>}</div>
              <div className="amt" style={{ fontSize: 40 }}>{rupees(p.price_inr)}</div>
              <ul style={{ margin: '10px 0 0' }}>{packageFeatures(p).filter((f) => f.on).map((f) => <li key={f.text} style={{ fontSize: 13.5, padding: '4px 0 4px 24px' }}>{f.text}</li>)}</ul>
            </Link>
          ))}
        </div>
        {tpl?.tier === 'premium' && <p className="small muted" style={{ marginTop: 10 }}>This is a Premium design, so the Basic package is not available for it.</p>}

        <div className="grid g2" style={{ marginTop: 34, alignItems: 'start' }}>
          <div className="card stack">
            <h2 style={{ fontSize: 28 }}>2. Order summary</h2>
            <div className="row between"><span>{chosen.name} package</span><span>{rupees(chosen.price_inr)}</span></div>
            {price.coupon && <div className="row between" style={{ color: 'var(--ok)' }}><span>Coupon {price.coupon}</span><span>− {rupees(chosen.price_inr - amount)}</span></div>}
            <div className="row between" style={{ borderTop: '1px solid var(--line)', paddingTop: 12, fontWeight: 600, fontSize: 19 }}><span>To pay</span><span>{rupees(amount)}</span></div>
            <form method="get" action={base} className="row" style={{ alignItems: 'flex-end' }}>
              <input type="hidden" name="pkg" value={chosen.id} />
              <label className="f" style={{ flex: 1 }}>Coupon code<input className="in" name="coupon" defaultValue={coupon} maxLength={20} style={{ textTransform: 'uppercase' }} /></label>
              <button className="btn ghost sm" style={{ minHeight: 48 }}>Apply</button>
            </form>
            {price.couponError && <p className="small" style={{ color: 'var(--bad)' }}>{price.couponError}</p>}
          </div>

          <div className="card stack">
            <h2 style={{ fontSize: 28 }}>3. Pay by UPI</h2>
            {amount === 0 ? (
              <>
                <p>Your coupon covers the full amount. No payment is needed.</p>
                <form action={placeOrder}><input type="hidden" name="invitation" value={inv.id} /><input type="hidden" name="pkg" value={chosen.id} /><input type="hidden" name="coupon" value={price.coupon || ''} /><button className="btn block">Publish my invitation</button></form>
              </>
            ) : !qr ? (
              <div className="alert">Payments are not set up yet. Please contact us and we will help you complete your order.</div>
            ) : (
              <>
                <p className="muted">Scan with GPay, PhonePe, Paytm or any UPI app and pay <b style={{ color: 'var(--ink)' }}>{rupees(amount)}</b>.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="UPI payment QR code" width={260} height={260} style={{ margin: '0 auto', borderRadius: 12, border: '1px solid var(--line)', height: 'auto' }} />
                {qrIsImage ? <p className="small center muted">Please enter the amount {rupees(amount)} yourself in your UPI app.</p> : <p className="small center muted">Paying to {s.upi_name} · {s.upi_id}</p>}
                <form action={placeOrder} className="stack">
                  <input type="hidden" name="invitation" value={inv.id} /><input type="hidden" name="pkg" value={chosen.id} /><input type="hidden" name="coupon" value={price.coupon || ''} />
                  <label className="f">UPI transaction ID (UTR)<input className="in" name="utr" required minLength={10} maxLength={22} inputMode="text" autoComplete="off" placeholder="12-digit number from your UPI app" /><span className="help">After paying, open the payment in your UPI app and copy the “UPI transaction ID” or “UTR”.</span></label>
                  <button className="btn block">I have paid · Submit</button>
                </form>
                <p className="small muted">We check every payment by hand. Your invitation goes live once we confirm it, usually within a few hours.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
