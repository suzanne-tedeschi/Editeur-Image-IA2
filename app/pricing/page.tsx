'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SubscriptionPlans from '@/components/SubscriptionPlans'
import Link from 'next/link'

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')
  const success = searchParams.get('success')

  useEffect(() => {
    if (canceled) {
      // Optionnel : afficher un message d'annulation
    }
  }, [canceled])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-block mb-8 text-rose-600 hover:text-rose-700 font-medium">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choisissez votre{' '}
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              forfait
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Créez des images exceptionnelles avec l'intelligence artificielle. 
            Commencez dès aujourd'hui avec le plan qui vous convient.
          </p>
        </div>

        {/* Messages d'état */}
        {canceled && (
          <div className="max-w-2xl mx-auto mb-8 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-center">
            Le paiement a été annulé. Vous pouvez réessayer quand vous voulez !
          </div>
        )}

        {/* Plans d'abonnement */}
        <SubscriptionPlans />

        {/* FAQ ou informations supplémentaires */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            ✨ Pas d'engagement, annulez à tout moment
          </p>
          <p className="text-gray-600 mb-4">
            🔒 Paiement sécurisé par Stripe
          </p>
          <p className="text-gray-600">
            💳 Toutes les cartes bancaires acceptées
          </p>
        </div>
      </div>
    </div>
  )
}
