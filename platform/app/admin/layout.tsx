import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { t } from '@/lib/data'

export const metadata = { title: 'Admin' }
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const [{ count: pending }, { count: open }] = await Promise.all([
    t('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    t('support_requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ])
  const nav: [string, string][] = [['/admin', 'Overview'], ['/admin/orders', `Orders${pending ? ' (' + pending + ')' : ''}`], ['/admin/invitations', 'Invitations'], ['/admin/customers', 'Customers'], ['/admin/templates', 'Designs'], ['/admin/packages', 'Packages'], ['/admin/coupons', 'Coupons'], ['/admin/support', `Support${open ? ' (' + open + ')' : ''}`], ['/admin/settings', 'Settings']]
  return (
    <>
      <header className="hdr"><div className="wrap" style={{ maxWidth: 1240 }}><Link className="logo" href="/admin">Shubh <i>Nimantran</i> <span className="tag" style={{ verticalAlign: 'middle' }}>Admin</span></Link><Link className="link small" href="/">View website</Link></div></header>
      <div className="wrap" style={{ maxWidth: 1240, padding: '18px 20px 80px' }}>
        <nav className="row" style={{ gap: 8, marginBottom: 26 }}>{nav.map(([h, l]) => <Link key={h} className="tag" style={{ textDecoration: 'none', padding: '9px 14px' }} href={h}>{l}</Link>)}</nav>
        {children}
      </div>
    </>
  )
}
