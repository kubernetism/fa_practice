import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from 'next/font/google'
import { Outfit } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: '--font-urdu',
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Firearms POS',
  description: 'Professional Point of Sale for Firearms Dealers',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${notoNastaliqUrdu.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
