import 'server-only'
import { redirect } from 'next/navigation'
import { authClient } from './supabase'

export type User = { id: string; email: string; isAdmin: boolean }

function admins() {
  return (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
}

export async function getUser(): Promise<User | null> {
  const sb = await authClient()
  const { data } = await sb.auth.getUser()
  const u = data.user
  if (!u || !u.email) return null
  return { id: u.id, email: u.email, isAdmin: admins().includes(u.email.toLowerCase()) }
}

export async function requireUser(next = '/dashboard'): Promise<User> {
  const u = await getUser()
  if (!u) redirect('/login?next=' + encodeURIComponent(next))
  return u
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser('/admin')
  if (!u.isAdmin) redirect('/dashboard')
  return u
}
