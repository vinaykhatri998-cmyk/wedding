import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import Mustache from 'mustache'
import { db } from './supabase'
import type { InviteData, Template } from './types'

const cache = new Map<string, string>()
export function builtinHtml(id: string): string | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null
  if (cache.has(id) && process.env.NODE_ENV === 'production') return cache.get(id)!
  try {
    const html = fs.readFileSync(path.join(process.cwd(), 'templates', id + '.html'), 'utf8')
    cache.set(id, html)
    return html
  } catch { return null }
}

const ord = (n: number) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th')
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function parts(date: string) {
  if (!date) return null
  const [y, m, d] = date.split('-').map(Number)
  const wd = WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return { y, m, d, wd, month: MN[m - 1] }
}
function time12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return ((h + 11) % 12) + 1 + ':' + String(m).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM')
}

export type RenderOpts = {
  theme: string
  preview: boolean          // unpaid or demo: shows a watermark
  slug: string | null
  guestLinks: boolean
  rsvpTracking: boolean
  music: boolean
  origin: string
}

async function signed(pathsIn: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  // sample photos for design previews are ordinary public files, not private uploads
  for (const p of pathsIn) if (p && p.startsWith('/samples/')) out[p] = p
  const paths = pathsIn.filter((p) => p && !p.startsWith('/samples/'))
  if (!paths.length) return out
  const { data } = await db().storage.from('photos').createSignedUrls(paths, 60 * 60 * 12)
  for (const r of data || []) if (r.path && r.signedUrl) out[r.path] = r.signedUrl
  return out
}

export async function renderInvitation(tpl: Pick<Template, 'id' | 'html'>, d: InviteData, o: RenderOpts): Promise<string | null> {
  const html = tpl.html || builtinHtml(tpl.id)
  if (!html) return null
  const urls = await signed([d.groom.photo, d.bride.photo, d.couplePhoto])
  const p = parts(d.date)
  const gName = d.groom.name || 'Groom', bName = d.bride.name || 'Bride'
  const phone = d.phone ? (d.phone.startsWith('+') ? d.phone.slice(1) : d.phone.length === 10 ? '91' + d.phone : d.phone) : ''
  const ts = d.date ? Date.parse(d.date + 'T' + (d.time || '19:00') + ':00+05:30') : 0
  const where = [d.venueName, d.venueAddress].filter(Boolean).join(', ')
  const mapUrl = d.mapUrl || (where ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(where) : '')
  const stamp = (t: number) => new Date(t).toISOString().replace(/[-:]|\.\d{3}/g, '')
  const calUrl = ts ? 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(gName + ' & ' + bName + ' Wedding') +
    '&dates=' + stamp(ts) + '/' + stamp(ts + 4 * 3600000) + '&location=' + encodeURIComponent(where) : ''

  const evs = d.events.map((e) => {
    const ep = parts(e.date)
    return { name: e.name, time: time12(e.time), venue: e.venue, day: ep ? ep.wd + ' · ' + ord(ep.d) + ' ' + ep.month : '' }
  })
  const days: { label: string; events: typeof evs }[] = []
  for (const e of evs) {
    const last = days[days.length - 1]
    if (last && last.label === e.day) last.events.push(e); else days.push({ label: e.day, events: [e] })
  }
  const photoG = urls[d.groom.photo] || '', photoB = urls[d.bride.photo] || '', photoC = urls[d.couplePhoto] || ''
  const json = { ts, phone, names: gName + ' & ' + bName, events: evs, slug: o.slug, guestLinks: o.guestLinks, rsvpTracking: o.rsvpTracking && !!o.slug && !o.preview, music: o.music && d.music }

  const view = {
    theme: o.theme, groom: { ...d.groom, name: gName, photo: photoG }, bride: { ...d.bride, name: bName, photo: photoB },
    gi: gName[0], bi: bName[0],
    blessing: d.blessing, hostLine: d.hostLine, message: d.message, note: d.note,
    hasDate: !!p, weekday: p?.wd || '', dayNum: p?.d || '', dayPad: p ? String(p.d).padStart(2, '0') : '', dayOrd: p ? ord(p.d) : '',
    month: p?.month || '', monthShort: p ? p.month.slice(0, 3).toUpperCase() : '', year: p?.y || '',
    dateLong: p ? p.wd + ' · ' + ord(p.d) + ' ' + p.month + ' ' + p.y : 'Date to be announced',
    dateShort: p ? p.d + ' · ' + p.m + ' · ' + p.y : '',
    timeText: time12(d.time),
    venueName: d.venueName || 'Venue to be announced', venueAddress: d.venueAddress, mapUrl, calUrl,
    hasPhone: !!phone, phone, phoneDisplay: d.phone,
    hasEvents: evs.length > 0, events: evs, days,
    hasFamily: d.show.family && d.family.length > 0, family: d.family,
    showCountdown: d.show.countdown && !!ts, showRsvp: d.show.rsvp && (!!phone || json.rsvpTracking),
    hasCouplePhoto: !!photoC, couplePhoto: photoC, hasPortraits: !!(photoG && photoB), hasAnyPhoto: !!(photoC || (photoG && photoB)),
    ogImage: photoC || photoG || '',
    json: JSON.stringify(json).replace(/</g, '\\u003c'),
  }
  let out = Mustache.render(html, view)

  const platform = `<script>window.SN={post:function(b){return fetch(${JSON.stringify(o.origin + '/api/rsvp')},{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.ok})}};</script>` +
    (o.preview ? `<style>#sn-wm{position:fixed;inset:0;z-index:2147483000;pointer-events:none;display:grid;place-items:center;overflow:hidden}#sn-wm span{font:600 15px/1 system-ui,sans-serif;letter-spacing:.5em;color:rgba(120,120,120,.2);transform:rotate(-32deg);white-space:pre;text-align:center;line-height:9}</style>` : '')
  out = out.replace('</head>', platform + '</head>')
  const wm = o.preview ? `<div id="sn-wm" aria-hidden="true"><span>${Array(7).fill('PREVIEW · SHUBH NIMANTRAN · PREVIEW · SHUBH NIMANTRAN').join('\n')}</span></div>` : ''
  const credit = `<a href="${o.origin}/" target="_blank" rel="noopener" style="display:block;text-align:center;padding:14px 10px 18px;background:#191513;color:#cbb994;font:12px/1.4 system-ui,sans-serif;letter-spacing:.14em;text-decoration:none">CRAFTED WITH ♥ · SHUBH NIMANTRAN</a>`
  out = out.replace('</body>', credit + wm + '</body>')
  return out
}

export const htmlResponse = (html: string, status = 200) =>
  new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' } })
