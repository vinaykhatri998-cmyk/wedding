'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser, requireAdmin, requireUser } from '@/lib/auth'
import { getInvitation, getOwnInvitation, getPackage, getTemplate, latestOrder, publishInvitation, t } from '@/lib/data'
import { authClient, db } from '@/lib/supabase'
import { emptyData, missingFields } from '@/lib/types'

const str = (f: FormData, k: string, max = 200) => String(f.get(k) || '').trim().slice(0, max)
const safeNext = (n: string) => (n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard')

/* ------------------------------ login ------------------------------ */
export async function signIn(f: FormData) {
  const next = safeNext(str(f, 'next', 300))
  const sb = await authClient()
  const { error } = await sb.auth.signInWithPassword({ email: str(f, 'email'), password: String(f.get('password') || '') })
  if (error) redirect('/login?mode=in&next=' + encodeURIComponent(next) + '&err=' + encodeURIComponent('That email and password do not match. Please try again.'))
  redirect(next)
}
export async function signUp(f: FormData) {
  const next = safeNext(str(f, 'next', 300))
  const email = str(f, 'email'), password = String(f.get('password') || '')
  const back = (m: string) => redirect('/login?mode=up&next=' + encodeURIComponent(next) + '&err=' + encodeURIComponent(m))
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) back('Please enter a valid email address.')
  if (password.length < 8) back('Please choose a password with at least 8 characters.')
  if (f.get('agree') !== 'on') back('Please accept the terms and privacy policy to continue.')
  const sb = await authClient()
  const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: str(f, 'name', 80) } } })
  if (error) back(/registered/i.test(error.message) ? 'An account with this email already exists. Please sign in instead.' : error.message)
  if (!data.session) back('Account created. Please check your email to confirm it, then sign in.')
  redirect(next)
}
export async function signOut() {
  const sb = await authClient()
  await sb.auth.signOut()
  redirect('/')
}

/* --------------------------- invitations --------------------------- */
export async function startInvitation(f: FormData) {
  const id = str(f, 'template', 40), theme = str(f, 'theme', 30)
  const user = await getUser()
  if (!user) redirect('/login?mode=up&next=' + encodeURIComponent('/templates/' + id + '?start=1'))
  const tpl = await getTemplate(id)
  if (!tpl || !tpl.active) redirect('/templates')
  const { count } = await t('invitations').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'draft')
  if ((count || 0) >= 10) redirect('/dashboard?msg=' + encodeURIComponent('You already have 10 drafts. Please delete one before starting another.'))
  const { data } = await t('invitations').insert({ user_id: user.id, template_id: tpl.id, theme: tpl.themes.some((x) => x.id === theme) ? theme : '', data: emptyData() }).select('id').single()
  redirect('/customize/' + data.id)
}
export async function deleteDraft(f: FormData) {
  const user = await requireUser()
  const inv = await getOwnInvitation(str(f, 'id', 40), user)
  if (inv && inv.status === 'draft') {
    const pending = await latestOrder(inv.id)
    if (!pending || pending.status === 'rejected') {
      const { data: files } = await db().storage.from('photos').list(inv.user_id + '/' + inv.id)
      if (files?.length) await db().storage.from('photos').remove(files.map((x) => inv.user_id + '/' + inv.id + '/' + x.name))
      await t('invitations').delete().eq('id', inv.id)
    }
  }
  revalidatePath('/dashboard')
}

/* ----------------------------- checkout ---------------------------- */
export async function priceFor(packageId: string, couponCode: string) {
  const pkg = await getPackage(packageId)
  if (!pkg || !pkg.active) return null
  let amount = pkg.price_inr, coupon: string | null = null, couponError = ''
  const code = couponCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (code) {
    const { data: c } = await t('coupons').select('*').eq('code', code).maybeSingle()
    if (!c || !c.active || (c.max_uses != null && c.used >= c.max_uses)) couponError = 'This coupon code is not valid.'
    else { coupon = c.code; amount = Math.round(pkg.price_inr * (100 - c.percent_off) / 100) }
  }
  return { pkg, amount, coupon, couponError }
}
export async function placeOrder(f: FormData) {
  const user = await requireUser()
  const invId = str(f, 'invitation', 40)
  const inv = await getOwnInvitation(invId, user)
  const fail = (m: string) => redirect('/checkout/' + invId + '?pkg=' + str(f, 'pkg', 30) + '&coupon=' + encodeURIComponent(str(f, 'coupon', 30)) + '&err=' + encodeURIComponent(m))
  if (!inv || inv.user_id !== user.id) redirect('/dashboard')
  if (inv.status !== 'draft') redirect('/dashboard')
  if (missingFields(inv.data).length) redirect('/customize/' + inv.id)
  const last = await latestOrder(inv.id)
  if (last && last.status === 'pending_review') redirect('/dashboard')
  const price = await priceFor(str(f, 'pkg', 30), str(f, 'coupon', 30))
  if (!price) return fail('Please choose a package.')
  if (price.couponError) return fail(price.couponError)
  const tpl = await getTemplate(inv.template_id)
  if (tpl?.tier === 'premium' && !price.pkg.premium_templates) return fail('This design needs the Premium or Royal package.')
  const free = price.amount === 0
  const utr = str(f, 'utr', 30).replace(/\s/g, '').toUpperCase()
  if (!free && !/^[A-Z0-9]{10,22}$/.test(utr)) return fail('Please enter the UPI transaction ID (UTR) shown in your payment app. It is usually 12 digits.')
  const { error } = await t('orders').insert({ user_id: user.id, invitation_id: inv.id, package_id: price.pkg.id, list_price: price.pkg.price_inr, amount: price.amount, coupon_code: price.coupon, utr: free ? null : utr, status: free ? 'paid' : 'pending_review', reviewed_at: free ? new Date().toISOString() : null })
  if (error) return fail(error.code === '23505' ? 'This transaction ID has already been used for another order.' : 'Could not place the order. Please try again.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (price.coupon) await (db() as any).rpc('use_coupon', { c: price.coupon })
  if (free) await publishInvitation(inv, price.pkg)
  redirect('/dashboard?placed=1')
}

/* ------------------------------ support ---------------------------- */
export async function sendSupport(f: FormData) {
  const user = await getUser()
  const message = str(f, 'message', 2000), email = user?.email || str(f, 'email', 120)
  if (str(f, 'website', 50)) redirect('/contact?sent=1') // hidden field: filled only by bots
  if (message.length < 5 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect('/contact?err=1')
  await t('support_requests').insert({ user_id: user?.id || null, email, message })
  redirect('/contact?sent=1')
}

/* ------------------------------- admin ----------------------------- */
export async function reviewOrder(f: FormData) {
  await requireAdmin()
  const id = str(f, 'id', 40), decision = str(f, 'decision', 20), note = str(f, 'note', 300)
  const { data: order } = await t('orders').select('*').eq('id', id).maybeSingle()
  if (!order) return
  const inv = await getInvitation(order.invitation_id)
  const now = new Date().toISOString()
  if (decision === 'approve' && order.status === 'pending_review' && inv) {
    const pkg = await getPackage(order.package_id)
    if (!pkg) return
    await t('orders').update({ status: 'paid', reviewed_at: now, admin_note: note || null }).eq('id', id).eq('status', 'pending_review')
    await publishInvitation(inv, pkg)
  } else if (decision === 'reject' && order.status === 'pending_review') {
    await t('orders').update({ status: 'rejected', reviewed_at: now, admin_note: note || 'We could not find this payment.' }).eq('id', id)
  } else if (decision === 'refund' && order.status === 'paid') {
    await t('orders').update({ status: 'refunded', reviewed_at: now, admin_note: note || null }).eq('id', id)
    if (inv) await t('invitations').update({ status: 'unpublished' }).eq('id', inv.id)
  }
  revalidatePath('/admin', 'layout')
}
export async function adminInvitation(f: FormData) {
  await requireAdmin()
  const inv = await getInvitation(str(f, 'id', 40)), act = str(f, 'act', 20)
  if (!inv) return
  if (act === 'unpublish' && inv.status === 'published') await t('invitations').update({ status: 'unpublished' }).eq('id', inv.id)
  if (act === 'publish') {
    const pkg = await getPackage(inv.package_id || str(f, 'pkg', 30) || 'basic')
    if (pkg && !missingFields(inv.data).length) {
      if (inv.status === 'unpublished' && inv.expires_at && Date.parse(inv.expires_at) > Date.now()) await t('invitations').update({ status: 'published' }).eq('id', inv.id)
      else await publishInvitation(inv, pkg)
    }
  }
  if (act === 'extend') {
    const months = Math.max(1, Math.min(24, Number(f.get('months')) || 1))
    const from = Math.max(Date.now(), inv.expires_at ? Date.parse(inv.expires_at) : 0)
    await t('invitations').update({ expires_at: new Date(from + months * 30 * 86400000).toISOString() }).eq('id', inv.id)
  }
  if (act === 'revisions') await t('invitations').update({ revisions_used: 0 }).eq('id', inv.id)
  revalidatePath('/admin', 'layout')
}
export async function saveTemplate(f: FormData) {
  await requireAdmin()
  const id = str(f, 'id', 40).toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (!id) return
  const row: Record<string, unknown> = { name: str(f, 'name', 60) || id, category: str(f, 'category', 40) || 'Traditional', tier: f.get('tier') === 'premium' ? 'premium' : 'standard', description: str(f, 'description', 300), active: f.get('active') === 'on', sort: Number(f.get('sort')) || 100 }
  const file = f.get('file')
  if (file instanceof File && file.size > 0) {
    if (file.size > 2_000_000) redirect('/admin/templates?err=' + encodeURIComponent('The design file is larger than 2 MB.'))
    const html = await file.text()
    if (!/<html[\s>]/i.test(html) || !html.includes('{{')) redirect('/admin/templates?err=' + encodeURIComponent('This does not look like a Shubh Nimantran design file.'))
    row.html = html
  }
  const { data: existing } = await t('templates').select('id').eq('id', id).maybeSingle()
  if (existing) await t('templates').update(row).eq('id', id)
  else if (row.html) await t('templates').insert({ id, ...row, themes: [{ id: '', name: 'Original', swatch: '#a8834a' }] })
  else redirect('/admin/templates?err=' + encodeURIComponent('Please attach the design file for a new template.'))
  revalidatePath('/', 'layout')
  redirect('/admin/templates?ok=1')
}
export async function deleteTemplate(f: FormData) {
  await requireAdmin()
  const id = str(f, 'id', 40)
  const { count } = await t('invitations').select('id', { count: 'exact', head: true }).eq('template_id', id)
  if (count) await t('templates').update({ active: false }).eq('id', id) // in use by customers: hide instead of deleting
  else await t('templates').delete().eq('id', id).not('html', 'is', null)
  revalidatePath('/', 'layout')
}
export async function savePackage(f: FormData) {
  await requireAdmin()
  const on = (k: string) => f.get(k) === 'on'
  await t('packages').update({ name: str(f, 'name', 40), price_inr: Math.max(0, Math.round(Number(f.get('price')) || 0)), months: Math.max(1, Number(f.get('months')) || 1), revisions: Math.max(-1, Math.round(Number(f.get('revisions')) || 0)), premium_templates: on('premium_templates'), music: on('music'), guest_links: on('guest_links'), rsvp_tracking: on('rsvp_tracking'), tagline: str(f, 'tagline', 120), active: on('active') }).eq('id', str(f, 'id', 30))
  revalidatePath('/', 'layout')
}
export async function saveCoupon(f: FormData) {
  await requireAdmin()
  const code = str(f, 'code', 20).toUpperCase().replace(/[^A-Z0-9]/g, '')
  const pct = Math.round(Number(f.get('percent')) || 0)
  if (!code || pct < 1 || pct > 100) return
  const max = Number(f.get('max'))
  await t('coupons').upsert({ code, percent_off: pct, max_uses: max > 0 ? Math.round(max) : null, active: true })
  revalidatePath('/admin', 'layout')
}
export async function toggleCoupon(f: FormData) {
  await requireAdmin()
  const code = str(f, 'code', 20)
  if (f.get('act') === 'delete') await t('coupons').delete().eq('code', code)
  else await t('coupons').update({ active: f.get('act') === 'on' }).eq('code', code)
  revalidatePath('/admin', 'layout')
}
export async function saveSettings(f: FormData) {
  await requireAdmin()
  const upi = str(f, 'upi_id', 80)
  if (upi && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi)) redirect('/admin/settings?err=' + encodeURIComponent('That UPI ID does not look right. It should look like name@bank.'))
  const rows = [['upi_id', upi], ['upi_name', str(f, 'upi_name', 60)], ['whatsapp', str(f, 'whatsapp', 20).replace(/\D/g, '')], ['banner', str(f, 'banner', 160)]]
  const file = f.get('qr')
  if (file instanceof File && file.size > 0) {
    if (file.size > 2_000_000 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) redirect('/admin/settings?err=' + encodeURIComponent('The QR image must be a JPG or PNG under 2 MB.'))
    const path = 'site/qr-' + Date.now() + '.' + (file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg')
    const { error } = await db().storage.from('photos').upload(path, file, { contentType: file.type })
    if (!error) rows.push(['qr_image', path])
  }
  if (f.get('remove_qr') === 'on') rows.push(['qr_image', ''])
  await t('settings').upsert(rows.map(([key, value]) => ({ key, value })))
  revalidatePath('/', 'layout')
  redirect('/admin/settings?ok=1')
}
export async function closeSupport(f: FormData) {
  await requireAdmin()
  await t('support_requests').update({ status: f.get('act') === 'open' ? 'open' : 'closed' }).eq('id', str(f, 'id', 40))
  revalidatePath('/admin', 'layout')
}
