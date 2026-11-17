import fs from 'node:fs'
import path from 'node:path'
import { getTemplate, origin } from '@/lib/data'
import { htmlResponse, renderInvitation } from '@/lib/render'
import { sampleData } from '@/lib/types'
import { CATALOG } from '@/lib/catalog'

/** Sample couple photos in public/samples/, used only when the file exists. */
function samplePhoto(name: string) {
  for (const ext of ['webp', 'jpg']) if (fs.existsSync(path.join(process.cwd(), 'public', 'samples', name + '.' + ext))) return '/samples/' + name + '.' + ext
  return ''
}

/** Public preview of a template filled with fictional sample details. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  // a built-in design can be previewed before the admin adds it to the website
  const tpl = (await getTemplate(id)) || (CATALOG[id] ? { id, html: null, active: true, themes: CATALOG[id].themes } : null)
  if (!tpl || !tpl.active) return new Response('Not found', { status: 404 })
  const theme = new URL(req.url).searchParams.get('theme') || ''
  const ok = tpl.themes.some((x) => x.id === theme) ? theme : ''
  const data = sampleData()
  data.couplePhoto = samplePhoto('couple'); data.groom.photo = samplePhoto('groom'); data.bride.photo = samplePhoto('bride')
  const html = await renderInvitation(tpl, data, { theme: ok, preview: true, slug: null, guestLinks: true, rsvpTracking: false, music: true, origin: await origin() })
  return html ? htmlResponse(html) : new Response('Not found', { status: 404 })
}
