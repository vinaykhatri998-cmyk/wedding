import { NextResponse } from 'next/server'
import { getPackage, t } from '@/lib/data'

/** Guests reply from a published invitation (Royal package). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null)
  const slug = typeof b?.slug === 'string' ? b.slug.slice(0, 80) : ''
  const name = typeof b?.name === 'string' ? b.name.trim().slice(0, 60) : ''
  if (!slug || !name) return NextResponse.json({ error: 'Missing details' }, { status: 400 })
  const { data: inv } = await t('invitations').select('id,status,package_id,expires_at').eq('slug', slug).maybeSingle()
  if (!inv || inv.status !== 'published' || (inv.expires_at && Date.parse(inv.expires_at) < Date.now())) return NextResponse.json({ error: 'Not available' }, { status: 404 })
  const pkg = inv.package_id ? await getPackage(inv.package_id) : null
  if (!pkg?.rsvp_tracking) return NextResponse.json({ error: 'Not available' }, { status: 404 })
  const { count } = await t('rsvps').select('id', { count: 'exact', head: true }).eq('invitation_id', inv.id)
  if ((count || 0) >= 1000) return NextResponse.json({ error: 'Full' }, { status: 429 })
  await t('rsvps').insert({ invitation_id: inv.id, name, attending: b.attending !== false, message: typeof b.message === 'string' ? b.message.trim().slice(0, 500) : null })
  return NextResponse.json({ ok: true })
}
