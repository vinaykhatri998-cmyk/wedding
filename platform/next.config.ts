import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // the invitation design files are read from disk when an invitation is shown
  outputFileTracingIncludes: { '/**': ['./templates/**', './public/samples/**'] },
  async headers() {
    return [{ source: '/((?!demo|preview|invite).*)', headers: [{ key: 'X-Frame-Options', value: 'DENY' }, { key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] }]
  },
}
export default nextConfig
