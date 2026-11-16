export type Person = { name: string; parents: string; grandparents: string; photo: string }
export type EventItem = { name: string; date: string; time: string; venue: string }
export type FamilyGroup = { title: string; names: string }

export type InviteData = {
  groom: Person
  bride: Person
  blessing: string
  hostLine: string
  date: string // YYYY-MM-DD
  time: string // HH:MM (24h)
  venueName: string
  venueAddress: string
  mapUrl: string
  note: string
  phone: string
  message: string
  couplePhoto: string
  events: EventItem[]
  family: FamilyGroup[]
  music: boolean
  show: { countdown: boolean; family: boolean; rsvp: boolean }
}

export type Theme = { id: string; name: string; swatch: string }
export type Template = {
  id: string; name: string; category: string; tier: 'standard' | 'premium'; description: string
  themes: Theme[]; html: string | null; active: boolean; sort: number
}
export type Package = {
  id: string; name: string; price_inr: number; months: number; revisions: number
  premium_templates: boolean; music: boolean; guest_links: boolean; rsvp_tracking: boolean
  tagline: string; active: boolean; sort: number
}
export type Invitation = {
  id: string; user_id: string; template_id: string; theme: string; data: InviteData
  slug: string | null; status: 'draft' | 'published' | 'unpublished'; package_id: string | null
  revisions_used: number; published_at: string | null; expires_at: string | null
  created_at: string; updated_at: string
}
export type Order = {
  id: string; order_no: number; user_id: string; invitation_id: string; package_id: string
  list_price: number; amount: number; coupon_code: string | null; utr: string | null
  status: 'pending_review' | 'paid' | 'rejected' | 'refunded'; admin_note: string | null
  created_at: string; reviewed_at: string | null
}

const person = (): Person => ({ name: '', parents: '', grandparents: '', photo: '' })
export function emptyData(): InviteData {
  return {
    groom: person(), bride: person(),
    blessing: '॥ श्री गणेशाय नमः ॥',
    hostLine: 'Together with their families, request the pleasure of your company at the wedding of',
    date: '', time: '19:00', venueName: '', venueAddress: '', mapUrl: '', note: '', phone: '', message: '',
    couplePhoto: '', events: [], family: [], music: true,
    show: { countdown: true, family: true, rsvp: true },
  }
}

/** Sample content used for template previews. Clearly fictional. */
export function sampleData(): InviteData {
  return {
    groom: { name: 'Aarav', parents: 'Mrs. Sunita & Mr. Rajesh Mehra', grandparents: 'Mrs. Kamla & Mr. Om Prakash Mehra', photo: '' },
    bride: { name: 'Ananya', parents: 'Mrs. Kavita & Mr. Sanjay Kapoor', grandparents: 'Mrs. Shanti & Mr. Mohan Lal Kapoor', photo: '' },
    blessing: '॥ श्री गणेशाय नमः ॥',
    hostLine: 'Together with their families, request the pleasure of your company at the wedding of',
    date: sampleDate(), time: '19:00',
    venueName: 'The Grand Palace', venueAddress: 'MG Road, Jaipur, Rajasthan', mapUrl: '',
    note: 'Barat assembles at the main gate at 6:00 PM', phone: '', message: 'Your presence is the greatest gift.',
    couplePhoto: '',
    events: [
      { name: 'Haldi', date: sampleDate(-1), time: '10:00', venue: 'The Grand Palace, Jaipur' },
      { name: 'Mehndi & Sangeet', date: sampleDate(-1), time: '18:30', venue: 'The Grand Palace, Jaipur' },
      { name: 'Wedding Ceremony', date: sampleDate(), time: '19:00', venue: 'The Grand Palace, Jaipur' },
      { name: 'Reception & Dinner', date: sampleDate(), time: '21:00', venue: 'The Grand Palace, Jaipur' },
    ],
    family: [
      { title: 'Awaiting your presence', names: 'Mehra Family, Relatives & Friends' },
      { title: 'With best compliments', names: 'Kapoor Family' },
    ],
    music: true, show: { countdown: true, family: true, rsvp: true },
  }
}
function sampleDate(offset = 0) {
  const d = new Date(Date.now() + (60 + offset) * 86400000)
  return d.toISOString().slice(0, 10)
}

/** Clean and bound anything a customer sends before it is stored. */
export function sanitizeData(raw: unknown): InviteData {
  const b = emptyData()
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const s = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max) : '')
  const p = (v: unknown): Person => {
    const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
    return { name: s(o.name, 40), parents: s(o.parents, 120), grandparents: s(o.grandparents, 160), photo: s(o.photo, 200) }
  }
  const sh = (r.show && typeof r.show === 'object' ? r.show : {}) as Record<string, unknown>
  const url = s(r.mapUrl, 400)
  return {
    groom: p(r.groom), bride: p(r.bride),
    blessing: s(r.blessing, 80), hostLine: s(r.hostLine, 220),
    date: /^\d{4}-\d{2}-\d{2}$/.test(s(r.date, 10)) ? s(r.date, 10) : '',
    time: /^\d{2}:\d{2}$/.test(s(r.time, 5)) ? s(r.time, 5) : b.time,
    venueName: s(r.venueName, 80), venueAddress: s(r.venueAddress, 200),
    mapUrl: /^https:\/\//i.test(url) ? url : '',
    note: s(r.note, 200), phone: s(r.phone, 20).replace(/[^\d+]/g, ''), message: s(r.message, 400),
    couplePhoto: s(r.couplePhoto, 200),
    events: (Array.isArray(r.events) ? r.events : []).slice(0, 10).map((e) => {
      const o = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>
      return { name: s(o.name, 50), date: /^\d{4}-\d{2}-\d{2}$/.test(s(o.date, 10)) ? s(o.date, 10) : '', time: /^\d{2}:\d{2}$/.test(s(o.time, 5)) ? s(o.time, 5) : '', venue: s(o.venue, 120) }
    }).filter((e) => e.name),
    family: (Array.isArray(r.family) ? r.family : []).slice(0, 6).map((e) => {
      const o = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>
      return { title: s(o.title, 50), names: s(o.names, 600) }
    }).filter((e) => e.names),
    music: r.music !== false,
    show: { countdown: sh.countdown !== false, family: sh.family !== false, rsvp: sh.rsvp !== false },
  }
}

export function missingFields(d: InviteData): string[] {
  const m: string[] = []
  if (!d.groom.name) m.push("Groom's name")
  if (!d.bride.name) m.push("Bride's name")
  if (!d.date) m.push('Wedding date')
  if (!d.venueName) m.push('Venue name')
  return m
}

export const rupees = (n: number) => '₹' + n.toLocaleString('en-IN')
