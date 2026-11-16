import { sendSupport } from '@/app/actions'
import { getUser } from '@/lib/auth'
import { getSettings } from '@/lib/data'

export const metadata = { title: 'Contact us' }
export default async function Contact({ searchParams }: { searchParams: Promise<{ sent?: string; err?: string }> }) {
  const { sent, err } = await searchParams
  const [user, s] = await Promise.all([getUser(), getSettings()])
  return (
    <section className="sec"><div className="narrow" style={{ maxWidth: 560 }}>
      <div className="eyebrow">We are here to help</div>
      <h1 style={{ fontSize: 'clamp(34px,6vw,52px)', margin: '10px 0 14px' }}>Contact us</h1>
      <p className="lead">Questions, corrections or a request to delete your data: send us a message and we will reply by email.</p>
      {s.whatsapp && <p style={{ marginTop: 16 }}><a className="btn wa sm" target="_blank" rel="noopener" href={'https://wa.me/' + (s.whatsapp.length === 10 ? '91' : '') + s.whatsapp}>Chat on WhatsApp</a></p>}
      <div className="card stack" style={{ marginTop: 24 }}>
        {sent && <div className="alert ok" role="status">Thank you. Your message has been received.</div>}
        {err && <div className="alert bad" role="alert">Please enter a valid email and a message.</div>}
        <form action={sendSupport} className="stack">
          {!user && <label className="f">Your email<input className="in" name="email" type="email" autoComplete="email" required /></label>}
          <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: -9999 }} aria-hidden="true" />
          <label className="f">Message<textarea className="in" name="message" required minLength={5} maxLength={2000} style={{ minHeight: 140 }} /></label>
          <button className="btn">Send message</button>
        </form>
      </div>
    </div></section>
  )
}
