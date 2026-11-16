import { getUser } from '@/lib/auth'
import { getOwnInvitation, getTemplate, origin } from '@/lib/data'
import { htmlResponse, renderInvitation } from '@/lib/render'

/** Private preview of a customer's own invitation (watermarked until it is live). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await ctx.params
  const inv = user ? await getOwnInvitation(id, user) : null
  if (!inv) return new Response('Not found', { status: 404 })
  const tpl = await getTemplate(inv.template_id)
  if (!tpl) return new Response('Not found', { status: 404 })
  const html = await renderInvitation(tpl, inv.data, { theme: inv.theme, preview: true, slug: null, guestLinks: true, rsvpTracking: false, music: true, origin: await origin() })
  return html ? htmlResponse(html) : new Response('Not found', { status: 404 })
}
