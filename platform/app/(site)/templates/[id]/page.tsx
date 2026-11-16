import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { startInvitation } from '@/app/actions'
import { getUser } from '@/lib/auth'
import { getPackages, getTemplate, t as table } from '@/lib/data'
import { emptyData, rupees } from '@/lib/types'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const tpl = await getTemplate((await params).id)
  return { title: tpl ? tpl.name + ' wedding invitation' : 'Design' }
}

export default async function TemplatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ theme?: string; start?: string }> }) {
  const { id } = await params
  const { theme = '', start } = await searchParams
  const tpl = await getTemplate(id)
  if (!tpl || !tpl.active) notFound()
  if (start) {
    // returning from sign-in: create the draft straight away
    const user = await getUser()
    const { count } = user ? await table('invitations').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'draft') : { count: 0 }
    if (user && (count || 0) >= 10) redirect('/dashboard')
    if (user) {
      const { data } = await table('invitations').insert({ user_id: user.id, template_id: tpl.id, theme: '', data: emptyData() }).select('id').single()
      if (data) redirect('/customize/' + data.id)
    }
  }
  const packages = await getPackages()
  const from = packages.filter((p) => tpl.tier !== 'premium' || p.premium_templates)[0]
  const th = tpl.themes.some((x) => x.id === theme) ? theme : ''
  return (
    <section className="sec">
      <div className="wrap grid g2" style={{ alignItems: 'center', gap: 44 }}>
        <div className="pframe"><div className="phone"><iframe key={th} src={'/demo/' + tpl.id + (th ? '?theme=' + th : '')} title={tpl.name + ' preview'} /></div></div>
        <div className="stack">
          <div className="row"><span className="eyebrow">{tpl.category}</span>{tpl.tier === 'premium' && <span className="tag gold">Premium</span>}</div>
          <h1 style={{ fontSize: 'clamp(38px,6vw,58px)' }}>{tpl.name}</h1>
          <p className="lead">{tpl.description}</p>
          <p className="muted small">Tap inside the phone to open the invitation. The names shown are samples; yours replace them.</p>
          {tpl.themes.length > 1 && (
            <div>
              <div className="eyebrow" style={{ color: 'var(--soft)' }}>Colour</div>
              <div className="swatches">{tpl.themes.map((x) => <Link key={x.id} scroll={false} className="swatch" aria-pressed={x.id === th} style={{ textDecoration: 'none' }} href={'/templates/' + tpl.id + (x.id ? '?theme=' + x.id : '')}><i style={{ background: x.swatch }} />{x.name}</Link>)}</div>
            </div>
          )}
          <form action={startInvitation} style={{ marginTop: 22 }}>
            <input type="hidden" name="template" value={tpl.id} /><input type="hidden" name="theme" value={th} />
            <button className="btn">Customize this invitation</button>
          </form>
          <p className="small muted">{from ? `Available from the ${from.name} package, ${rupees(from.price_inr)}.` : ''} Free to customize and preview. <Link className="link" href="/pricing">See pricing</Link></p>
          <p><a className="link small" href={'/demo/' + tpl.id + (th ? '?theme=' + th : '')} target="_blank" rel="noopener">Open the preview full screen ↗</a></p>
        </div>
      </div>
    </section>
  )
}
