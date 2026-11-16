import { savePackage } from '@/app/actions'
import { getPackages } from '@/lib/data'

export default async function Packages() {
  const packages = await getPackages(true)
  const box = (name: string, label: string, on: boolean) => <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" name={name} defaultChecked={on} /> {label}</label>
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Packages</h1>
      <p className="muted">Changes apply to new orders straight away. Existing customers keep what they bought.</p>
      <div className="grid g3">
        {packages.map((p) => (
          <form action={savePackage} className="card stack" key={p.id}>
            <input type="hidden" name="id" value={p.id} />
            <label className="f">Name<input className="in" name="name" defaultValue={p.name} required /></label>
            <label className="f">Price (₹)<input className="in" name="price" type="number" min={0} defaultValue={p.price_inr} required /></label>
            <label className="f">Tagline<input className="in" name="tagline" defaultValue={p.tagline} /></label>
            <div className="pair"><label className="f">Months online<input className="in" name="months" type="number" min={1} defaultValue={p.months} /></label><label className="f">Corrections<input className="in" name="revisions" type="number" min={-1} defaultValue={p.revisions} /><span className="help">-1 means unlimited</span></label></div>
            {box('premium_templates', 'Premium designs', p.premium_templates)}{box('music', 'Background music', p.music)}{box('guest_links', 'Personal guest links', p.guest_links)}{box('rsvp_tracking', 'RSVP tracking', p.rsvp_tracking)}{box('active', 'On sale', p.active)}
            <button className="btn sm">Save</button>
          </form>
        ))}
      </div>
    </div>
  )
}
