import { getTemplate, origin } from '@/lib/data'
import { htmlResponse, renderInvitation } from '@/lib/render'
import { sampleData } from '@/lib/types'

/** Public preview of a template filled with fictional sample details. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const tpl = await getTemplate(id)
  if (!tpl || !tpl.active) return new Response('Not found', { status: 404 })
  const theme = new URL(req.url).searchParams.get('theme') || ''
  const ok = tpl.themes.some((x) => x.id === theme) ? theme : ''
  const html = await renderInvitation(tpl, sampleData(), { theme: ok, preview: true, slug: null, guestLinks: true, rsvpTracking: false, music: true, origin: await origin() })
  return html ? htmlResponse(html) : new Response('Not found', { status: 404 })
}
