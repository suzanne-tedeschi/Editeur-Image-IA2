'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/AuthForm'

export default function SignupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  if (user) {
    return null // Pendant la redirection
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Inscription</h1>
        <AuthForm initialMode="signup" />
      </div>
    </div>
  )
}
