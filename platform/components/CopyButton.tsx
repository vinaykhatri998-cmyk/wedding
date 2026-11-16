'use client'
import { useState } from 'react'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button type="button" className="btn sm ghost" onClick={async () => {
      try { await navigator.clipboard.writeText(text) } catch {
        const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove()
      }
      setDone(true); setTimeout(() => setDone(false), 1600)
    }}>{done ? 'Copied ✓' : label}</button>
  )
}

/** Builds a personal link for one guest, e.g. ?to=Mama ji */
export function GuestLinks({ url, names }: { url: string; names: string }) {
  const [name, setName] = useState('')
  const link = url + (name.trim() ? '?to=' + encodeURIComponent(name.trim()) : '')
  const msg = (name.trim() ? 'Dear ' + name.trim() + ',\n' : '') + 'With great joy we invite you to the wedding of ' + names + '.\n\nOpen your invitation: ' + link
  return (
    <div className="stack">
      <label className="f">Guest name<input className="in" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Mama ji & Mami ji" /></label>
      <div className="copy"><span>{link}</span><CopyButton text={link} /></div>
      <a className="btn wa sm" target="_blank" rel="noopener" href={'https://wa.me/?text=' + encodeURIComponent(msg)}>Send on WhatsApp</a>
    </div>
  )
}
