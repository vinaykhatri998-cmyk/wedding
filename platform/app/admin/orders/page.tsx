import Link from 'next/link'
import { OrdersTable, STATUS } from '@/lib/admin'
import { ordersWithNames } from '@/lib/adminData'

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const orders = await ordersWithNames(status && STATUS[status] ? status : undefined)
  return (
    <div className="stack">
      <h1 style={{ fontSize: 40 }}>Orders</h1>
      <div className="row"><Link className="tag" style={{ textDecoration: 'none' }} href="/admin/orders">All</Link>{Object.entries(STATUS).map(([k, [l]]) => <Link key={k} className={'tag' + (status === k ? ' gold' : '')} style={{ textDecoration: 'none' }} href={'/admin/orders?status=' + k}>{l}</Link>)}</div>
      <OrdersTable orders={orders} />
    </div>
  )
}
