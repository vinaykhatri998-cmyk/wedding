import { redirect } from 'next/navigation'
import { Editor } from '@/components/Editor'
import { requireUser } from '@/lib/auth'
import { getOwnInvitation, getPackage, getTemplate, latestOrder } from '@/lib/data'
import { db } from '@/lib/supabase'
import { emptyData } from '@/lib/types'

export const metadata = { title: 'Customize your invitation' }

export default async function Customize({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser('/customize/' + id)
  const inv = await getOwnInvitation(id, user)
  if (!inv) redirect('/dashboard')
  const [tpl, pkg, order] = await Promise.all([getTemplate(inv.template_id), inv.package_id ? getPackage(inv.package_id) : null, latestOrder(inv.id)])
  if (!tpl) redirect('/dashboard')
  const data = { ...emptyData(), ...inv.data }
  const paths = [data.groom.photo, data.bride.photo, data.couplePhoto].filter(Boolean)
  const urls: Record<string, string> = {}
  if (paths.length) {
    const { data: signed } = await db().storage.from('photos').createSignedUrls(paths, 3600)
    for (const s of signed || []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl
  }
  const live = inv.status !== 'draft'
  const left = !live ? null : user.isAdmin && inv.user_id !== user.id ? -1 : pkg ? (pkg.revisions === -1 ? -1 : Math.max(0, pkg.revisions - inv.revisions_used)) : 0
  return <Editor id={inv.id} initial={data} initialTheme={inv.theme} themes={tpl.themes} templateName={tpl.name} photoUrls={urls} live={live} correctionsLeft={left} locked={!live && order?.status === 'pending_review'} />
}
