import 'server-only'
import { headers } from 'next/headers'
import { db } from './supabase'
import type { Invitation, Order, Package, Template } from './types'

/* The generated database types are not used; rows are cast to our own types. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const t = (name: string) => (db() as any).from(name)

export async function origin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https')
  return proto + '://' + host
}

export async function getTemplates(all = false): Promise<Template[]> {
  let q = t('templates').select('id,name,category,tier,description,themes,active,sort').order('sort')
  if (!all) q = q.eq('active', true)
  const { data } = await q
  return (data || []) as Template[]
}
export async function getTemplate(id: string): Promise<Template | null> {
  const { data } = await t('templates').select('*').eq('id', id).maybeSingle()
  return data as Template | null
}
export async function getPackages(all = false): Promise<Package[]> {
  let q = t('packages').select('*').order('sort')
  if (!all) q = q.eq('active', true)
  const { data } = await q
  return (data || []) as Package[]
}
export async function getPackage(id: string): Promise<Package | null> {
  const { data } = await t('packages').select('*').eq('id', id).maybeSingle()
  return data as Package | null
}
export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await t('settings').select('*')
  const out: Record<string, string> = {}
  for (const r of (data || []) as { key: string; value: string }[]) out[r.key] = r.value
  return out
}
export async function getInvitation(id: string): Promise<Invitation | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data } = await t('invitations').select('*').eq('id', id).maybeSingle()
  return data as Invitation | null
}
/** An invitation only if it belongs to this user (admins may open any). */
export async function getOwnInvitation(id: string, user: { id: string; isAdmin: boolean }): Promise<Invitation | null> {
  const inv = await getInvitation(id)
  if (!inv || (inv.user_id !== user.id && !user.isAdmin)) return null
  return inv
}
export async function latestOrder(invitationId: string): Promise<Order | null> {
  const { data } = await t('orders').select('*').eq('invitation_id', invitationId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  return data as Order | null
}

export function slugify(a: string, b: string) {
  const c = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const s = [c(a), 'weds', c(b)].filter(Boolean).join('-')
  return s.length > 5 ? s.slice(0, 60) : 'wedding-' + Math.random().toString(36).slice(2, 8)
}
export async function uniqueSlug(base: string): Promise<string> {
  for (let i = 1; i < 50; i++) {
    const slug = i === 1 ? base : base + '-' + i
    const { data } = await t('invitations').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
  }
  return base + '-' + Date.now().toString(36)
}

/** Publish an invitation for a package: gives it a link and an expiry date. */
export async function publishInvitation(inv: Invitation, pkg: Package) {
  const slug = inv.slug || (await uniqueSlug(slugify(inv.data.groom?.name || '', inv.data.bride?.name || '')))
  const expires = new Date(Date.now() + pkg.months * 30 * 86400000).toISOString()
  await t('invitations').update({ status: 'published', slug, package_id: pkg.id, published_at: inv.published_at || new Date().toISOString(), expires_at: expires }).eq('id', inv.id)
  return slug
}
