import Link from 'next/link'
import { TemplateCard } from '@/components/ui'
import { getTemplates } from '@/lib/data'

export const metadata = { title: 'Wedding invitation designs' }

export default async function Templates({ searchParams }: { searchParams: Promise<{ style?: string }> }) {
  const { style } = await searchParams
  const all = await getTemplates()
  const cats = [...new Set(all.map((t) => t.category))]
  const list = style ? all.filter((t) => t.category === style) : all
  return (
    <section className="sec">
      <div className="wrap">
        <div className="eyebrow">The collection</div>
        <h1 style={{ marginTop: 10, fontSize: 'clamp(36px,6vw,56px)' }}>Choose your design</h1>
        <p className="lead" style={{ marginTop: 10 }}>Every design is animated, made for phones and filled with your own details.</p>
        <div className="row" style={{ margin: '26px 0' }}>
          <Link className={'tag' + (!style ? ' gold' : '')} style={{ textDecoration: 'none' }} href="/templates">All</Link>
          {cats.map((c) => <Link key={c} className={'tag' + (style === c ? ' gold' : '')} style={{ textDecoration: 'none' }} href={'/templates?style=' + encodeURIComponent(c)}>{c}</Link>)}
        </div>
        {list.length ? <div className="grid g3">{list.map((t) => <TemplateCard key={t.id} t={t} />)}</div> : <p className="muted">No designs in this style yet.</p>}
      </div>
    </section>
  )
}
