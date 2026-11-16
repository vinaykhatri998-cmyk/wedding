import Link from 'next/link'
import { Faq } from '@/components/ui'
export const metadata = { title: 'Frequently asked questions' }
export default function Page() {
  return (
    <section className="sec"><div className="narrow">
      <div className="eyebrow">Help</div>
      <h1 style={{ fontSize: 'clamp(34px,6vw,52px)', margin: '10px 0 20px' }}>Frequently asked questions</h1>
      <Faq />
      <p style={{ marginTop: 26 }}>Still unsure? <Link className="link" href="/contact">Ask us anything</Link>.</p>
    </div></section>
  )
}
