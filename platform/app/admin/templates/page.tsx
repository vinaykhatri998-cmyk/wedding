import { addBuiltinTemplate, deleteTemplate, saveTemplate } from '@/app/actions'
import { CATALOG } from '@/lib/catalog'
import { getTemplates, t } from '@/lib/data'

export default async function Templates({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams
  const templates = await getTemplates(true)
  const { data: custom } = await t('templates').select('id').not('html', 'is', null)
  const customIds = ((custom || []) as { id: string }[]).map((x) => x.id)
  const fields = (x?: (typeof templates)[number]) => (
    <>
      <div className="pair"><label className="f">Name<input className="in" name="name" defaultValue={x?.name} required maxLength={60} /></label><label className="f">Style category<input className="in" name="category" defaultValue={x?.category || 'Traditional'} maxLength={40} /></label></div>
      <label className="f">Short description<input className="in" name="description" defaultValue={x?.description} maxLength={300} /></label>
      <div className="pair"><label className="f">Level<select className="in" name="tier" defaultValue={x?.tier || 'standard'}><option value="standard">Standard (all packages)</option><option value="premium">Premium (Premium and Royal only)</option></select></label><label className="f">Position in list<input className="in" name="sort" type="number" defaultValue={x?.sort ?? 100} /></label></div>
      <label className="f">Design file (.html){x ? ' · leave empty to keep the current one' : ''}<input className="in" name="file" type="file" accept=".html,text/html" /></label>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" name="active" defaultChecked={x ? x.active : true} /> Visible to customers</label>
    </>
  )
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Designs</h1>
      {sp.ok && <div className="alert ok">Saved.</div>}
      {sp.err && <div className="alert bad">{sp.err}</div>}
      {Object.entries(CATALOG).filter(([id]) => !templates.some((x) => x.id === id)).map(([id, c]) => (
        <div className="card row between" key={id} style={{ borderColor: 'var(--gold)' }}>
          <div><span className="tag gold">New design ready</span><h2 style={{ fontSize: 26, marginTop: 8 }}>{c.name}</h2><p className="muted small">{c.description}</p></div>
          <div className="row"><a className="btn sm ghost" href={'/demo/' + id} target="_blank" rel="noopener">Preview ↗</a><form action={addBuiltinTemplate}><input type="hidden" name="id" value={id} /><button className="btn sm">Add to website</button></form></div>
        </div>
      ))}
      <p className="muted">Rename, hide, reorder or change the level of any design. To add a new design, upload its design file below; it appears on the website immediately.</p>
      <div className="grid g2">
        {templates.map((x) => (
          <div className="card stack" key={x.id}>
            <div className="row between"><h2 style={{ fontSize: 26 }}>{x.name}</h2><a className="link small" href={'/demo/' + x.id} target="_blank" rel="noopener">Preview ↗</a></div>
            <form action={saveTemplate} className="stack"><input type="hidden" name="id" value={x.id} />{fields(x)}<button className="btn sm">Save</button></form>
            {customIds.includes(x.id) && <form action={deleteTemplate}><input type="hidden" name="id" value={x.id} /><button className="btn sm ghost">Delete (hides it instead if customers use it)</button></form>}
          </div>
        ))}
        <div className="card stack" style={{ borderStyle: 'dashed' }}>
          <h2 style={{ fontSize: 26 }}>Add a new design</h2>
          <form action={saveTemplate} className="stack">
            <label className="f">Short ID (letters and dashes, used in links)<input className="in" name="id" required pattern="[a-z0-9\-]+" maxLength={40} placeholder="e.g. south-temple" /></label>
            {fields()}
            <button className="btn sm">Add design</button>
          </form>
        </div>
      </div>
    </div>
  )
}
