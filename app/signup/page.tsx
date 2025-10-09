import AuthForm from '@/components/AuthForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Inscription</h1>
        <AuthForm initialMode="signup" />
      </div>
    </div>
  )
}
