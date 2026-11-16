import { Faq, PriceCards } from '@/components/ui'
import { getPackages } from '@/lib/data'

export const metadata = { title: 'Pricing' }
export default async function Pricing() {
  const packages = await getPackages()
  return (
    <section className="sec">
      <div className="wrap">
        <div className="center" style={{ marginBottom: 44 }}>
          <div className="eyebrow">Pricing</div>
          <h1 style={{ marginTop: 10, fontSize: 'clamp(36px,6vw,56px)' }}>Simple, one-time pricing</h1>
          <p className="lead" style={{ marginTop: 10 }}>Customize and preview for free. Pay once by UPI when you are ready to go live.</p>
        </div>
        <PriceCards packages={packages} />
        <div className="narrow" style={{ marginTop: 64 }}><h2 className="center" style={{ marginBottom: 16 }}>Common questions</h2><Faq /></div>
      </div>
    </section>
  )
}
