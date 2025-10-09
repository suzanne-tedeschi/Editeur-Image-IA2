import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transformez vos images avec l&apos;IA
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Utilisez la puissance de l&apos;intelligence artificielle pour modifier, améliorer et transformer vos photos en œuvres d&apos;art uniques.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg text-lg font-medium border border-gray-300 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Édition créative</h3>
            <p className="text-gray-600">
              Transformez vos images avec des prompts textuels. Laissez l&apos;IA créer des variations uniques.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Rapide et facile</h3>
            <p className="text-gray-600">
              Générez des images en quelques secondes. Interface simple et intuitive.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-xl font-semibold mb-2">Historique sauvegardé</h3>
            <p className="text-gray-600">
              Tous vos projets sont automatiquement sauvegardés dans votre dashboard personnel.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Créez un compte</h3>
              <p className="text-gray-600">Inscrivez-vous gratuitement en quelques secondes</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Uploadez votre image</h3>
              <p className="text-gray-600">Choisissez une photo et décrivez la transformation</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Recevez votre résultat</h3>
              <p className="text-gray-600">L&apos;IA génère votre image transformée en quelques instants</p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-20 bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d&apos;utilisateurs qui transforment leurs images avec l&apos;IA
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium inline-block transition-colors"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </div>
    </div>
  )
}
