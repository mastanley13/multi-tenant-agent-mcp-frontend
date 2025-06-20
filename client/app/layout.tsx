import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GoHighLevel AI Assistant - Transform Your CRM Experience',
  description: 'AI-powered assistant for GoHighLevel CRM with intelligent automation, personalized insights, and seamless workflow management.',
  keywords: 'GoHighLevel, AI Assistant, CRM, Automation, Sales Pipeline, Lead Management',
  authors: [{ name: 'GoHighLevel AI Team' }],
  creator: 'GoHighLevel AI',
  publisher: 'GoHighLevel AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://localhost:3000'),
  openGraph: {
    title: 'GoHighLevel AI Assistant',
    description: 'Transform your CRM experience with AI-powered automation and insights',
    type: 'website',
    locale: 'en_US',
    siteName: 'GoHighLevel AI Assistant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoHighLevel AI Assistant',
    description: 'Transform your CRM experience with AI-powered automation and insights',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} h-full antialiased bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800`}>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_50%)] pointer-events-none" />
        <div className="relative z-10">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
} 