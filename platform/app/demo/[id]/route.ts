import { getTemplate, origin } from '@/lib/data'
import { htmlResponse, renderInvitation } from '@/lib/render'
import { sampleData } from '@/lib/types'
import { CATALOG } from '@/lib/catalog'

/** Public preview of a template filled with fictional sample details. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  // a built-in design can be previewed before the admin adds it to the website
  const tpl = (await getTemplate(id)) || (CATALOG[id] ? { id, html: null, active: true, themes: CATALOG[id].themes } : null)
  if (!tpl || !tpl.active) return new Response('Not found', { status: 404 })
  const theme = new URL(req.url).searchParams.get('theme') || ''
  const ok = tpl.themes.some((x) => x.id === theme) ? theme : ''
  const html = await renderInvitation(tpl, sampleData(), { theme: ok, preview: true, slug: null, guestLinks: true, rsvpTracking: false, music: true, origin: await origin() })
  return html ? htmlResponse(html) : new Response('Not found', { status: 404 })
}
