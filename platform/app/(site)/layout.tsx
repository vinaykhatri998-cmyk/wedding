import Link from 'next/link'
import { signOut } from '@/app/actions'
import { getUser } from '@/lib/auth'
import { getSettings } from '@/lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([getUser(), getSettings()])
  const links = (
    <>
      <Link href="/templates">Designs</Link>
      <Link href="/pricing">Pricing</Link>
      <Link href="/faq">FAQ</Link>
      <Link href="/contact">Contact</Link>
      {user?.isAdmin && <Link href="/admin">Admin</Link>}
      {user ? <Link href="/dashboard">My invitations</Link> : <Link href="/login">Sign in</Link>}
      <Link className="btn sm" href="/templates">Create invitation</Link>
    </>
  )
  return (
    <>
      {s.banner && <div className="banner">{s.banner}</div>}
      <header className="hdr">
        <div className="wrap">
          <Link className="logo" href="/">Shubh <i>Nimantran</i></Link>
          <nav className="nav desk">{links}</nav>
          <details className="menu">
            <summary aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg></summary>
            <nav className="nav">{links}</nav>
          </details>
        </div>
      </header>
      <main>{children}</main>
      <footer className="ftr">
        <div className="wrap grid g4">
          <div><Link className="logo" href="/">Shubh <i>Nimantran</i></Link><p style={{ marginTop: 10 }}>Digital wedding invitations, crafted with care in India.</p></div>
          <div><h4>Explore</h4><Link href="/templates">Designs</Link><Link href="/pricing">Pricing</Link><Link href="/faq">FAQ</Link><Link href="/about">About us</Link></div>
          <div><h4>Help</h4><Link href="/contact">Contact us</Link><Link href="/dashboard">My invitations</Link>{user && <form action={signOut}><button style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', padding: '4px 0', cursor: 'pointer' }}>Sign out</button></form>}</div>
          <div><h4>Legal</h4><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms &amp; conditions</Link><Link href="/refunds">Refunds &amp; cancellation</Link></div>
        </div>
        <div className="wrap small" style={{ marginTop: 32, opacity: .6 }}>© {new Date().getFullYear()} Shubh Nimantran</div>
      </footer>
      {s.whatsapp && (
        <a className="wa-float" aria-label="Chat with us on WhatsApp" target="_blank" rel="noopener" href={'https://wa.me/' + (s.whatsapp.length === 10 ? '91' : '') + s.whatsapp}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.1c-.2.7-1.400 1.300-2 1.400-.5.1-1.200.1-1.900-.1a17 17 0 0 1-1.700-.6c-3-1.300-5-4.300-5.100-4.500-.2-.2-1.200-1.600-1.200-3s.8-2.200 1-2.500c.3-.3.600-.3.800-.3h.6c.2 0 .4 0 .7.500l.9 2.200c.1.200.1.400 0 .6l-.3.500-.5.500c-.2.200-.3.400-.1.700.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.400 2.400 1.500.3.100.5.100.7-.1l.9-1.100c.2-.3.400-.2.700-.1l2.100 1c.3.100.5.200.6.300.1.200.1.800-.1 1.500z" /></svg>
        </a>
      )}
    </>
  )
}
