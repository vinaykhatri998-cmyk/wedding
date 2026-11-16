import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const display = Cormorant_Garamond({ variable: '--font-display', subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'] })
const sans = Jost({ variable: '--font-sans', subsets: ['latin'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: { default: 'Shubh Nimantran · Luxury digital wedding invitations', template: '%s · Shubh Nimantran' },
  description: 'Animated, personalised Indian wedding invitation websites. Choose a design, add your details and share one beautiful link on WhatsApp.',
}
export const viewport: Viewport = { themeColor: '#faf6ef' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
