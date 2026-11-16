import Link from 'next/link'
import { hasThumb } from '@/lib/catalog'
import type { Package, Template } from '@/lib/types'
import { rupees } from '@/lib/types'

export function TemplateCard({ t }: { t: Template }) {
  return (
    <Link className="tcard" href={'/templates/' + t.id}>
      <div className="img">
        {hasThumb(t.id)
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={'/thumbs/' + t.id + '.jpg'} alt={t.name + ' wedding invitation design'} loading="lazy" />
          : <iframe src={'/demo/' + t.id} title={t.name} loading="lazy" tabIndex={-1} style={{ width: '390px', height: '488px', border: 0, transform: 'scale(var(--s,.9))', transformOrigin: '0 0', pointerEvents: 'none' }} />}
        {t.tier === 'premium' && <span className="tag gold">Premium</span>}
      </div>
      <div className="body">
        <div className="eyebrow">{t.category}</div>
        <h3>{t.name}</h3>
        <p className="muted small" style={{ marginTop: 6 }}>{t.description}</p>
      </div>
    </Link>
  )
}

export function packageFeatures(p: Package): { text: string; on: boolean }[] {
  return [
    { text: p.premium_templates ? 'All designs, including Premium' : 'All Standard designs', on: true },
    { text: `Online for ${p.months} months`, on: true },
    { text: p.revisions === -1 ? 'Unlimited corrections after going live' : `${p.revisions} correction${p.revisions === 1 ? '' : 's'} after going live`, on: true },
    { text: 'Countdown, maps, calendar & WhatsApp sharing', on: true },
    { text: 'Background music', on: p.music },
    { text: 'Personal link for each guest', on: p.guest_links },
    { text: 'RSVP replies collected in your dashboard', on: p.rsvp_tracking },
  ]
}

export function PriceCards({ packages, cta }: { packages: Package[]; cta?: (p: Package) => React.ReactNode }) {
  const mid = packages[Math.floor(packages.length / 2)]?.id
  return (
    <div className="grid g3">
      {packages.map((p) => (
        <div key={p.id} className={'card price' + (p.id === mid ? ' pop' : '')}>
          {p.id === mid && <span className="tag gold poptag">Most chosen</span>}
          <div className="eyebrow">{p.name}</div>
          <div className="amt">{rupees(p.price_inr)}</div>
          <p className="muted small">{p.tagline}</p>
          <ul>{packageFeatures(p).map((f) => <li key={f.text} className={f.on ? '' : 'no'}>{f.text}</li>)}</ul>
          {cta ? cta(p) : <Link className={'btn' + (p.id === mid ? '' : ' ghost')} href="/templates">Choose a design</Link>}
        </div>
      ))}
    </div>
  )
}

export const FAQS: [string, string][] = [
  ['What exactly do I get?', 'Your own wedding invitation website with a personal link, for example shubhnimantran.com/invite/rahul-weds-priya. Guests open it on their phone and see an animated invitation with your names, photos, functions, venue map and more.'],
  ['How do I pay?', 'At checkout you scan our UPI QR code with any UPI app (GPay, PhonePe, Paytm and others), pay, and enter the transaction ID. We check the payment and your invitation goes live, usually within a few hours.'],
  ['Can I see my invitation before paying?', 'Yes. You can fill in every detail and see a full preview with a watermark. You pay only when you are happy with it.'],
  ['Can I change details after it goes live?', 'Yes. Each package includes a number of corrections after going live. Changes appear on the same link, so you never need to resend it.'],
  ['How long does the invitation stay online?', 'From 3 to 12 months depending on your package. After that it is taken offline and your photos are removed.'],
  ['Are my photos safe?', 'Photos are kept in private storage. They are shown only inside your invitation and are never listed publicly or used in our marketing without your permission.'],
  ['Do guests need an app?', 'No. The invitation opens in any phone browser straight from WhatsApp.'],
]
export function Faq({ limit }: { limit?: number }) {
  return <div>{FAQS.slice(0, limit).map(([q, a]) => <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
}
