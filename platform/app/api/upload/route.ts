import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getOwnInvitation } from '@/lib/data'
import { db } from '@/lib/supabase'

const SLOTS = ['groom', 'bride', 'couple']
/** Check the real file contents, not the name the browser claims. */
function kind(b: Uint8Array) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' }
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', type: 'image/png' }
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { ext: 'webp', type: 'image/webp' }
  return null
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const form = await req.formData().catch(() => null)
  const file = form?.get('file'), slot = String(form?.get('slot') || '')
  const inv = await getOwnInvitation(String(form?.get('invitation') || ''), user)
  if (!inv || !SLOTS.includes(slot) || !(file instanceof File)) return NextResponse.json({ error: 'Upload not allowed.' }, { status: 400 })
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'Photo is too large (4 MB maximum).' }, { status: 400 })
  const bytes = new Uint8Array(await file.arrayBuffer())
  const k = kind(bytes)
  if (!k) return NextResponse.json({ error: 'Please upload a JPG, PNG or WebP photo.' }, { status: 400 })
  const path = `${inv.user_id}/${inv.id}/${slot}-${crypto.randomUUID().slice(0, 8)}.${k.ext}`
  const { error } = await db().storage.from('photos').upload(path, bytes, { contentType: k.type })
  if (error) return NextResponse.json({ error: 'Could not save the photo. Please try again.' }, { status: 500 })
  const { data } = await db().storage.from('photos').createSignedUrl(path, 3600)
  return NextResponse.json({ path, url: data?.signedUrl || '' })
}
