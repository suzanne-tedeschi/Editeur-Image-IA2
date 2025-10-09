import './globals.css'
import React from 'react'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Éditeur d\'Images IA - Transformez vos photos avec l\'intelligence artificielle',
  description: 'Éditeur d\'images alimenté par l\'IA utilisant PhotoMaker. Transformez vos photos en œuvres d\'art uniques avec des prompts personnalisés.',
  keywords: 'IA, intelligence artificielle, éditeur d\'images, PhotoMaker, transformation photo, génération d\'images',
  authors: [{ name: 'Éditeur d\'Images IA' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
