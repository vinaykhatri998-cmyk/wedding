import Link from 'next/link'
import { Faq, PriceCards, TemplateCard } from '@/components/ui'
import { getPackages, getTemplates } from '@/lib/data'

export default async function Home() {
  const [templates, packages] = await Promise.all([getTemplates(), getPackages()])
  const show = templates.slice(0, 3)
  const cats = [...new Set(templates.map((t) => t.category))]
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <div className="eyebrow">Digital wedding invitations</div>
            <h1 style={{ marginTop: 14 }}>An invitation as <em>beautiful</em> as the day itself</h1>
            <p className="lead">Choose a design, add your names, photos and functions, and share one elegant link with every guest on WhatsApp.</p>
            <div className="row" style={{ marginTop: 28 }}>
              <Link className="btn" href="/templates">Browse designs</Link>
              <Link className="btn ghost" href="#how">How it works</Link>
            </div>
            <div className="ticks"><span>Ready in minutes</span><span>Preview before you pay</span><span>From ₹{packages[0]?.price_inr ?? 300}</span></div>
          </div>
          <div className="phones" aria-hidden="true">
            {[show[1], show[0], show[2]].filter(Boolean).map((t) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div className="phone" key={t.id}><img src={'/thumbs/' + t.id + (t === show[0] ? '.jpg' : '-cover.jpg')} alt="" /></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <div className="row between" style={{ marginBottom: 28 }}>
            <div><div className="eyebrow">Most loved</div><h2 style={{ marginTop: 8 }}>Designs that feel like an occasion</h2></div>
            <Link className="btn ghost sm" href="/templates">View all designs</Link>
          </div>
          <div className="grid g3">{show.map((t) => <TemplateCard key={t.id} t={t} />)}</div>
          {cats.length > 1 && <div className="row" style={{ marginTop: 26 }}><span className="muted small">Browse by style:</span>{cats.map((c) => <Link key={c} className="tag" style={{ textDecoration: 'none' }} href={'/templates?style=' + encodeURIComponent(c)}>{c}</Link>)}</div>}
        </div>
      </section>

      <section className="sec" id="how">
        <div className="wrap">
          <div className="center"><div className="eyebrow">How it works</div><h2 style={{ marginTop: 8 }}>From design to guests in four steps</h2></div>
          <div className="grid g4 steps" style={{ marginTop: 44 }}>
            <div className="step"><h3>Choose a design</h3><p className="muted">Open any design and see it move, exactly as your guests will.</p></div>
            <div className="step"><h3>Add your details</h3><p className="muted">Names, photos, functions, venue and a personal message. No design skills needed.</p></div>
            <div className="step"><h3>Preview and pay</h3><p className="muted">See your finished invitation first. Pay by UPI only when you love it.</p></div>
            <div className="step"><h3>Share your link</h3><p className="muted">Get your own link and QR code, ready for WhatsApp and Instagram.</p></div>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 40 }}><div className="eyebrow">Pricing</div><h2 style={{ marginTop: 8 }}>One payment. No hidden charges.</h2></div>
          <PriceCards packages={packages} />
        </div>
      </section>

      <section className="sec">
        <div className="narrow">
          <div className="center" style={{ marginBottom: 24 }}><div className="eyebrow">Questions</div><h2 style={{ marginTop: 8 }}>Good to know</h2></div>
          <Faq limit={5} />
          <p className="center" style={{ marginTop: 22 }}><Link className="link" href="/faq">See all questions</Link></p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap"><div className="cta"><h2>Your guests are waiting</h2><p style={{ marginTop: 10, opacity: .85 }}>Create your invitation today and preview it free.</p><Link className="btn" href="/templates">Create my invitation</Link></div></div>
      </section>
    </>
  )
}
