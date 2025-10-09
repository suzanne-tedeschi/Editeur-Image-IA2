import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Connexion</h1>
        <AuthForm initialMode="signin" />
      </div>
    </div>
  )
}
