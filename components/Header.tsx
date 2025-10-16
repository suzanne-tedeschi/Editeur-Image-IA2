'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            AI Image Editor
          </Link>

          <nav className="flex items-center gap-6">
            {loading ? (
              <div className="text-gray-400">Chargement...</div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
                >
                  Tarifs
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
                >
                  Tarifs
                </Link>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
