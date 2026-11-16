import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signIn, signUp } from '@/app/actions'
import { getUser } from '@/lib/auth'

export const metadata = { title: 'Sign in' }
export default async function Login({ searchParams }: { searchParams: Promise<{ mode?: string; next?: string; err?: string }> }) {
  const { mode, next = '/dashboard', err } = await searchParams
  if (await getUser()) redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')
  const up = mode === 'up'
  const q = '&next=' + encodeURIComponent(next)
  return (
    <section className="sec">
      <div className="narrow" style={{ maxWidth: 440 }}>
        <div className="card stack">
          <h1 style={{ fontSize: 38 }}>{up ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">{up ? 'Your invitation is saved to your account so you can return any time.' : 'Sign in to see your invitations.'}</p>
          {err && <div className="alert bad" role="alert">{err}</div>}
          <form action={up ? signUp : signIn} className="stack">
            <input type="hidden" name="next" value={next} />
            {up && <label className="f">Your name<input className="in" name="name" autoComplete="name" maxLength={80} required /></label>}
            <label className="f">Email<input className="in" name="email" type="email" autoComplete="email" required /></label>
            <label className="f">Password<input className="in" name="password" type="password" autoComplete={up ? 'new-password' : 'current-password'} minLength={up ? 8 : undefined} required />{up && <span className="help">At least 8 characters.</span>}</label>
            {up && <label className="small" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><input type="checkbox" name="agree" required style={{ marginTop: 4 }} /><span>I agree to the <Link className="link" href="/terms" target="_blank">terms</Link> and <Link className="link" href="/privacy" target="_blank">privacy policy</Link>, and I have permission to use the photos I upload.</span></label>}
            <button className="btn block">{up ? 'Create account' : 'Sign in'}</button>
          </form>
          <p className="small center">{up ? <>Already have an account? <Link className="link" href={'/login?mode=in' + q}>Sign in</Link></> : <>New here? <Link className="link" href={'/login?mode=up' + q}>Create an account</Link></>}</p>
        </div>
      </div>
    </section>
  )
}
