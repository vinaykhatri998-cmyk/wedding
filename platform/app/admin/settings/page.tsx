import { saveSettings } from '@/app/actions'
import { getSettings } from '@/lib/data'

export default async function Settings({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams
  const s = await getSettings()
  return (
    <div className="stack" style={{ maxWidth: 620 }}>
      <h1 style={{ fontSize: 40 }}>Settings</h1>
      {sp.ok && <div className="alert ok">Saved.</div>}
      {sp.err && <div className="alert bad">{sp.err}</div>}
      <form action={saveSettings} className="card stack">
        <h2 style={{ fontSize: 26 }}>Receiving payments</h2>
        <label className="f">Your UPI ID<input className="in" name="upi_id" defaultValue={s.upi_id} placeholder="yourname@bank" /><span className="help">Recommended. Customers see a QR code with the exact amount already filled in.</span></label>
        <label className="f">Name shown to the payer<input className="in" name="upi_name" defaultValue={s.upi_name} /></label>
        <label className="f">Or upload your QR code image<input className="in" name="qr" type="file" accept="image/png,image/jpeg,image/webp" /><span className="help">Used only when no UPI ID is entered. Customers type the amount themselves.{s.qr_image ? ' A QR image is currently saved.' : ''}</span></label>
        {s.qr_image && <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" name="remove_qr" /> Remove the saved QR image</label>}
        <h2 style={{ fontSize: 26, marginTop: 26 }}>Website</h2>
        <label className="f">WhatsApp support number<input className="in" name="whatsapp" defaultValue={s.whatsapp} placeholder="10-digit mobile number" /><span className="help">Shows a WhatsApp chat button on every page.</span></label>
        <label className="f">Announcement banner<input className="in" name="banner" defaultValue={s.banner} maxLength={160} placeholder="e.g. Wedding season offer: 10% off with code SHAADI10" /><span className="help">Shown at the top of the website. Leave empty to hide it.</span></label>
        <button className="btn">Save settings</button>
      </form>
    </div>
  )
}
