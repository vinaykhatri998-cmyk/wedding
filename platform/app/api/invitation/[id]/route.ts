import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getOwnInvitation, getPackage, getTemplate, t } from '@/lib/data'
import { missingFields, sanitizeData } from '@/lib/types'

/** Saves the customer's invitation details. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const { id } = await ctx.params
  const inv = await getOwnInvitation(id, user)
  if (!inv) return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })
  const data = sanitizeData(body.data)
  // photos must live in this invitation's own private folder
  const own = (p: string) => (p && p.startsWith(`${inv.user_id}/${inv.id}/`) && !p.includes('..') ? p : '')
  data.groom.photo = own(data.groom.photo); data.bride.photo = own(data.bride.photo); data.couplePhoto = own(data.couplePhoto)
  const tpl = await getTemplate(inv.template_id)
  const theme = tpl?.themes.some((x) => x.id === body.theme) ? String(body.theme) : ''
  const patch: Record<string, unknown> = { data, theme, updated_at: new Date().toISOString() }

  if (inv.status !== 'draft') {
    // a live invitation: each saved correction counts against the package allowance
    const miss = missingFields(data)
    if (miss.length) return NextResponse.json({ error: 'Please fill in: ' + miss.join(', ') }, { status: 400 })
    if (!user.isAdmin || inv.user_id === user.id) {
      const pkg = inv.package_id ? await getPackage(inv.package_id) : null
      const limit = pkg ? pkg.revisions : 0
      if (limit !== -1 && inv.revisions_used >= limit) return NextResponse.json({ error: 'You have used all the corrections included in your package. Please contact support.' }, { status: 403 })
      patch.revisions_used = inv.revisions_used + 1
    }
  }
  const { error } = await t('invitations').update(patch).eq('id', inv.id)
  if (error) return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
