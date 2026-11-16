import { getPackage, getTemplate, origin, t } from '@/lib/data'
import { htmlResponse, renderInvitation } from '@/lib/render'
import type { Invitation } from '@/lib/types'

const notice = (title: string, text: string, home: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#faf6ef;color:#231a16;font-family:Georgia,serif;text-align:center;padding:24px}h1{font-weight:400;font-size:34px;margin:0 0 10px}p{color:#6b5d54;max-width:34ch;margin:0 auto 22px;line-height:1.6}a{color:#6d1f2f}</style></head>
<body><div><h1>${title}</h1><p>${text}</p><a href="${home}/">Shubh Nimantran</a></div></body></html>`

/** The public invitation page that guests open. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const home = await origin()
  const { data } = await t('invitations').select('*').eq('slug', slug.toLowerCase()).maybeSingle()
  const inv = data as Invitation | null
  if (!inv || inv.status !== 'published') return htmlResponse(notice('Invitation not available', 'This invitation link is not active. Please check the link with the family who invited you.', home), 404)
  if (inv.expires_at && Date.parse(inv.expires_at) < Date.now()) return htmlResponse(notice('This invitation has ended', 'The celebration has passed and this invitation is no longer online. Thank you for being part of it.', home), 410)
  const [tpl, pkg] = await Promise.all([getTemplate(inv.template_id), inv.package_id ? getPackage(inv.package_id) : null])
  if (!tpl) return htmlResponse(notice('Invitation not available', 'This invitation could not be shown.', home), 404)
  const html = await renderInvitation(tpl, inv.data, { theme: inv.theme, preview: false, slug: inv.slug, guestLinks: !!pkg?.guest_links, rsvpTracking: !!pkg?.rsvp_tracking, music: !!pkg?.music, origin: home })
  return html ? htmlResponse(html) : htmlResponse(notice('Invitation not available', 'This invitation could not be shown.', home), 404)
}
