'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EventItem, FamilyGroup, InviteData, Person, Theme } from '@/lib/types'
import { missingFields } from '@/lib/types'

type Props = {
  id: string; initial: InviteData; initialTheme: string; themes: Theme[]; templateName: string
  photoUrls: Record<string, string>; live: boolean; correctionsLeft: number | null; locked: boolean
}

/** Shrinks a phone photo in the browser before upload, so uploads are fast and small. */
async function shrink(file: File): Promise<Blob> {
  const img = await createImageBitmap(file).catch(() => null)
  if (!img) throw new Error('This file could not be read as a photo.')
  const scale = Math.min(1, 1600 / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not prepare the photo.'))), 'image/jpeg', 0.86))
}

export function Editor(p: Props) {
  const router = useRouter()
  const [d, setD] = useState<InviteData>(p.initial)
  const [theme, setTheme] = useState(p.initialTheme)
  const [urls, setUrls] = useState(p.photoUrls)
  const [state, setState] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
  const [msg, setMsg] = useState('')
  const [sheet, setSheet] = useState(false)
  const [tick, setTick] = useState(0)
  const [busy, setBusy] = useState('')
  const first = useRef(true)
  const latest = useRef({ d, theme })
  latest.current = { d, theme }

  const save = useCallback(async () => {
    setState('saving')
    try {
      const r = await fetch('/api/invitation/' + p.id, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: latest.current.d, theme: latest.current.theme }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setState('error'); setMsg(j.error || 'Could not save.'); return false }
      setState('saved'); setMsg(''); setTick((n) => n + 1); return true
    } catch { setState('error'); setMsg('No internet connection. Your changes are not saved yet.'); return false }
  }, [p.id])

  // drafts save themselves a moment after you stop typing; live invitations save only when asked
  useEffect(() => {
    if (first.current) { first.current = false; return }
    setState('dirty')
    if (p.live || p.locked) return
    const h = setTimeout(save, 1400)
    return () => clearTimeout(h)
  }, [d, theme, p.live, p.locked, save])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (state === 'dirty' || state === 'saving') e.preventDefault() }
    addEventListener('beforeunload', warn); return () => removeEventListener('beforeunload', warn)
  }, [state])

  const set = <K extends keyof InviteData>(k: K, v: InviteData[K]) => setD((x) => ({ ...x, [k]: v }))
  const setPerson = (who: 'groom' | 'bride', k: keyof Person, v: string) => setD((x) => ({ ...x, [who]: { ...x[who], [k]: v } }))
  const setEvent = (i: number, k: keyof EventItem, v: string) => setD((x) => ({ ...x, events: x.events.map((e, j) => (j === i ? { ...e, [k]: v } : e)) }))
  const setFam = (i: number, k: keyof FamilyGroup, v: string) => setD((x) => ({ ...x, family: x.family.map((e, j) => (j === i ? { ...e, [k]: v } : e)) }))
  const move = (i: number, by: number) => setD((x) => { const a = [...x.events]; const j = i + by; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, events: a } })

  async function upload(slot: 'groom' | 'bride' | 'couple', file: File | undefined) {
    if (!file) return
    setBusy(slot); setMsg('')
    try {
      const blob = await shrink(file)
      const f = new FormData(); f.set('file', blob, 'photo.jpg'); f.set('slot', slot); f.set('invitation', p.id)
      const r = await fetch('/api/upload', { method: 'POST', body: f })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Upload failed.')
      setUrls((u) => ({ ...u, [j.path]: j.url }))
      if (slot === 'couple') set('couplePhoto', j.path); else setPerson(slot, 'photo', j.path)
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Upload failed.'); setState('error') }
    setBusy('')
  }

  const Photo = ({ slot, path, label }: { slot: 'groom' | 'bride' | 'couple'; path: string; label: string }) => (
    <div className="f" style={{ marginTop: 14 }}>
      <span style={{ font: '500 12px var(--sans)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--soft)' }}>{label}</span>
      <div className="upl">
        <div className="th" style={path && urls[path] ? { backgroundImage: `url("${urls[path]}")` } : undefined} />
        <label className="btn sm ghost" style={{ cursor: 'pointer' }}>{busy === slot ? 'Uploading…' : path ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={!!busy || p.locked} onChange={(e) => { upload(slot, e.target.files?.[0]); e.target.value = '' }} />
        </label>
        {path && <button type="button" className="btn sm ghost" disabled={p.locked} onClick={() => (slot === 'couple' ? set('couplePhoto', '') : setPerson(slot, 'photo', ''))}>Remove</button>}
      </div>
    </div>
  )
  const person = (who: 'groom' | 'bride', title: string) => (
    <fieldset disabled={p.locked}>
      <legend>{title}</legend>
      <label className="f">Name *<input className="in" value={d[who].name} maxLength={40} onChange={(e) => setPerson(who, 'name', e.target.value)} placeholder={who === 'groom' ? 'e.g. Rahul' : 'e.g. Priya'} /></label>
      <label className="f">Parents&apos; names<input className="in" value={d[who].parents} maxLength={120} onChange={(e) => setPerson(who, 'parents', e.target.value)} placeholder="e.g. Mrs. Sunita & Mr. Rajesh Sharma" /></label>
      <label className="f">Grandparents&apos; names<input className="in" value={d[who].grandparents} maxLength={160} onChange={(e) => setPerson(who, 'grandparents', e.target.value)} placeholder="Optional" /></label>
      <Photo slot={who} path={d[who].photo} label="Photo (optional)" />
    </fieldset>
  )

  const miss = missingFields(d)
  async function finish() {
    if (miss.length) { setMsg('Please fill in: ' + miss.join(', ')); setState('error'); scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (p.live) {
      if (p.correctionsLeft === 0) { setMsg('You have used all the corrections in your package. Please contact support.'); setState('error'); return }
      if (p.correctionsLeft !== -1 && !confirm(`Publish these changes to your live invitation? This uses 1 of your ${p.correctionsLeft} remaining correction${p.correctionsLeft === 1 ? '' : 's'}.`)) return
      if (await save()) router.push('/dashboard')
    } else if (await save()) router.push('/checkout/' + p.id)
  }

  const status = state === 'saving' ? 'Saving…' : state === 'dirty' ? (p.live ? 'Changes not published yet' : 'Unsaved changes') : state === 'error' ? 'Not saved' : p.live ? 'Live' : 'All changes saved'
  const src = '/preview/' + p.id + '?v=' + tick

  return (
    <div className="ed">
      <div className="ed-top">
        <Link className="link small" href="/dashboard">← My invitations</Link>
        <span className="small muted" aria-live="polite">{status}</span>
      </div>
      <div className="ed-form">
        <div className="eyebrow">{p.templateName} design</div>
        <h1 style={{ fontSize: 38, margin: '6px 0 16px' }}>{p.live ? 'Make a correction' : 'Your invitation details'}</h1>
        {p.locked && <div className="alert" style={{ marginBottom: 16 }}>Your payment is being checked, so details are locked for now. You can make corrections once your invitation is live.</div>}
        {p.live && <div className="alert" style={{ marginBottom: 16 }}>{p.correctionsLeft === -1 ? 'Your package includes unlimited corrections.' : `Corrections left in your package: ${p.correctionsLeft}. Make all your changes, then publish them together.`}</div>}
        {msg && <div className="alert bad" role="alert" style={{ marginBottom: 16 }}>{msg}</div>}

        {p.themes.length > 1 && (
          <fieldset disabled={p.locked}><legend>Colour</legend>
            <div className="swatches">{p.themes.map((t) => <button type="button" key={t.id} className="swatch" aria-pressed={theme === t.id} onClick={() => setTheme(t.id)}><i style={{ background: t.swatch }} />{t.name}</button>)}</div>
          </fieldset>
        )}
        {person('groom', 'Groom')}
        {person('bride', 'Bride')}

        <fieldset disabled={p.locked}><legend>Wedding day</legend>
          <div className="pair">
            <label className="f">Date *<input className="in" type="date" value={d.date} onChange={(e) => set('date', e.target.value)} /></label>
            <label className="f">Time<input className="in" type="time" value={d.time} onChange={(e) => set('time', e.target.value)} /></label>
          </div>
          <label className="f">Venue name *<input className="in" value={d.venueName} maxLength={80} onChange={(e) => set('venueName', e.target.value)} placeholder="e.g. Hotel Grand Palace" /></label>
          <label className="f">Full address<input className="in" value={d.venueAddress} maxLength={200} onChange={(e) => set('venueAddress', e.target.value)} placeholder="Area, city, state" /></label>
          <label className="f">Google Maps link<input className="in" type="url" value={d.mapUrl} maxLength={400} onChange={(e) => set('mapUrl', e.target.value)} placeholder="Optional. Paste the share link from Google Maps" /><span className="help">Leave empty and we will search the venue name and address on Google Maps.</span></label>
          <label className="f">Extra note<input className="in" value={d.note} maxLength={200} onChange={(e) => set('note', e.target.value)} placeholder="Optional. e.g. Barat leaves the hotel at 6 PM, dress code, stay details" /></label>
        </fieldset>

        <fieldset disabled={p.locked}><legend>Functions</legend>
          <p className="help" style={{ marginTop: 0 }}>Add each ceremony, such as Haldi, Mehndi, Sangeet, Wedding and Reception.</p>
          {d.events.map((e, i) => (
            <div className="item" key={i}>
              <label className="f">Function name<input className="in" value={e.name} maxLength={50} onChange={(x) => setEvent(i, 'name', x.target.value)} placeholder="e.g. Haldi" /></label>
              <div className="pair" style={{ marginTop: 10 }}>
                <label className="f">Date<input className="in" type="date" value={e.date} onChange={(x) => setEvent(i, 'date', x.target.value)} /></label>
                <label className="f">Time<input className="in" type="time" value={e.time} onChange={(x) => setEvent(i, 'time', x.target.value)} /></label>
              </div>
              <label className="f" style={{ marginTop: 10 }}>Venue<input className="in" value={e.venue} maxLength={120} onChange={(x) => setEvent(i, 'venue', x.target.value)} placeholder="Optional" /></label>
              <div className="row" style={{ marginTop: 10 }}>
                <button type="button" className="btn sm ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button type="button" className="btn sm ghost" onClick={() => move(i, 1)} disabled={i === d.events.length - 1} aria-label="Move down">↓</button>
                <button type="button" className="btn sm ghost" onClick={() => set('events', d.events.filter((_, j) => j !== i))}>Remove</button>
              </div>
            </div>
          ))}
          {d.events.length < 10 && <button type="button" className="btn sm ghost" style={{ marginTop: 12 }} onClick={() => set('events', [...d.events, { name: '', date: d.date, time: '', venue: d.venueName }])}>+ Add a function</button>}
        </fieldset>

        <fieldset disabled={p.locked}><legend>Photo &amp; wording</legend>
          <Photo slot="couple" path={d.couplePhoto} label="Couple photo (optional)" />
          <label className="f" style={{ marginTop: 14 }}>Blessing line<input className="in" value={d.blessing} maxLength={80} onChange={(e) => set('blessing', e.target.value)} /><span className="help">Shown at the top. You can type in Hindi or any language.</span></label>
          <label className="f">Invitation line<textarea className="in" value={d.hostLine} maxLength={220} onChange={(e) => set('hostLine', e.target.value)} /><span className="help">The sentence that appears before the couple&apos;s names.</span></label>
          <label className="f">Personal message<textarea className="in" value={d.message} maxLength={400} onChange={(e) => set('message', e.target.value)} placeholder="Optional" /></label>
        </fieldset>

        <fieldset disabled={p.locked}><legend>Family names</legend>
          <p className="help" style={{ marginTop: 0 }}>Optional lists shown at the end, such as “Awaiting your presence”.</p>
          {d.family.map((g, i) => (
            <div className="item" key={i}>
              <label className="f">Heading<input className="in" value={g.title} maxLength={50} onChange={(x) => setFam(i, 'title', x.target.value)} placeholder="e.g. Awaiting your presence" /></label>
              <label className="f" style={{ marginTop: 10 }}>Names<textarea className="in" value={g.names} maxLength={600} onChange={(x) => setFam(i, 'names', x.target.value)} placeholder="Names separated by commas" /></label>
              <button type="button" className="btn sm ghost" style={{ marginTop: 10 }} onClick={() => set('family', d.family.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          {d.family.length < 6 && <button type="button" className="btn sm ghost" style={{ marginTop: 12 }} onClick={() => set('family', [...d.family, { title: '', names: '' }])}>+ Add a list</button>}
        </fieldset>

        <fieldset disabled={p.locked}><legend>Contact &amp; options</legend>
          <label className="f">WhatsApp number for guests<input className="in" type="tel" inputMode="tel" value={d.phone} maxLength={15} onChange={(e) => set('phone', e.target.value)} placeholder="10-digit mobile number" /><span className="help">Guests can call, message and send their RSVP to this number.</span></label>
          {([['music', 'Play background music (Premium and Royal packages)', d.music, (v: boolean) => set('music', v)],
            ['countdown', 'Show countdown to the wedding', d.show.countdown, (v: boolean) => set('show', { ...d.show, countdown: v })],
            ['family', 'Show family names', d.show.family, (v: boolean) => set('show', { ...d.show, family: v })],
            ['rsvp', 'Let guests send an RSVP and wishes', d.show.rsvp, (v: boolean) => set('show', { ...d.show, rsvp: v })]] as const).map(([k, label, on, fn]) => (
            <label key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}><input type="checkbox" checked={on} onChange={(e) => fn(e.target.checked)} style={{ width: 20, height: 20 }} /><span>{label}</span></label>
          ))}
        </fieldset>
      </div>

      <aside className="ed-prev" aria-label="Preview"><div className="phone"><iframe key={tick} src={src} title="Invitation preview" /></div></aside>

      <div className="ed-bar">
        <button type="button" className="btn ghost only-m" onClick={async () => { if (!p.live && !p.locked && state !== 'saved') await save(); setSheet(true) }}>Preview</button>
        {!p.locked && <button type="button" className="btn" onClick={finish} disabled={state === 'saving' || !!busy}>{p.live ? 'Publish changes' : 'Save and continue'}</button>}
      </div>
      <div className={'sheet' + (sheet ? ' on' : '')} role="dialog" aria-label="Preview">
        <div className="x"><span>{p.live && state === 'dirty' ? 'Showing the live version' : 'Preview'}</span><button type="button" className="btn sm" onClick={() => setSheet(false)}>Close</button></div>
        {sheet && <iframe src={src} title="Invitation preview" />}
      </div>
    </div>
  )
}
