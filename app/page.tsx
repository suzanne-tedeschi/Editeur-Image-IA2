'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()

  // Si connecté, afficher un message de bienvenue avec accès direct au dashboard
  if (!loading && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent mb-6">
              Bienvenue, {user.email?.split('@')[0]} ! 👋
            </h1>
            <p className="text-xl text-rose-900 mb-8 max-w-3xl mx-auto">
              Vous êtes connecté(e) et prêt(e) à créer des images extraordinaires avec l&apos;IA ✨
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Aller au Dashboard 🎨
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100 text-center">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2 text-rose-900">Vos projets</h3>
              <p className="text-rose-700">
                Accédez à tous vos projets d&apos;images générées
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-rose-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-rose-100 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2 text-rose-900">Créer maintenant</h3>
              <p className="text-rose-700">
                Uploadez une image et transformez-la avec l&apos;IA
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-fuchsia-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-fuchsia-100 text-center">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-semibold mb-2 text-rose-900">Historique</h3>
              <p className="text-rose-700">
                Retrouvez toutes vos créations précédentes
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si non connecté, afficher la page d'accueil classique
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent mb-6">
            Transformez vos images avec l&apos;IA ✨
          </h1>
          <p className="text-xl text-rose-900 mb-8 max-w-3xl mx-auto">
            Utilisez la puissance de l&apos;intelligence artificielle pour modifier, améliorer et transformer vos photos en œuvres d&apos;art uniques.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Commencer gratuitement 💖
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-pink-50 text-rose-600 px-8 py-3 rounded-full text-lg font-medium border-2 border-pink-300 hover:border-pink-400 transition-all shadow-md hover:shadow-lg"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Édition créative</h3>
            <p className="text-rose-700">
              Transformez vos images avec des prompts textuels. Laissez l&apos;IA créer des variations uniques.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-rose-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-rose-100">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Rapide et facile</h3>
            <p className="text-rose-700">
              Générez des images en quelques secondes. Interface simple et intuitive.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-fuchsia-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-fuchsia-100">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-xl font-semibold mb-2 text-rose-900">Historique sauvegardé</h3>
            <p className="text-rose-700">
              Tous vos projets sont automatiquement sauvegardés dans votre dashboard personnel.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 text-rose-900">Créez un compte</h3>
              <p className="text-rose-700">Inscrivez-vous gratuitement en quelques secondes</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 text-rose-900">Uploadez votre image</h3>
              <p className="text-rose-700">Choisissez une photo et décrivez la transformation</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 text-rose-900">Recevez votre résultat</h3>
              <p className="text-rose-700">L&apos;IA génère votre image transformée en quelques instants</p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-20 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ? 💕</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d&apos;utilisateurs qui transforment leurs images avec l&apos;IA
          </p>
          <Link
            href="/signup"
            className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-3 rounded-full text-lg font-medium inline-block transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Créer mon compte gratuitement ✨
          </Link>
        </div>
      </div>
    </div>
  )
}
