// Le chemin de ce fichier est : src/features/auth/components/LoginForm.tsx

import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

// 1. Schéma de validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
})

// 2. Type des données du formulaire
type LoginFormInputs = z.infer<typeof loginSchema>

// 3. Le composant React lui-même
export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  // 4. Fonction de soumission
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      console.log('Utilisateur connecté:', userCredential.user)
      alert(`Connexion réussie pour ${userCredential.user.email}!`)
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: 'Email ou mot de passe incorrect.',
      })
    }
  }

  // 5. Le JSX (le HTML) qui est affiché
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            {...register('email')}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Adresse e-mail"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            {...register('password')}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Mot de passe"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
      </div>

      {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
        >
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </form>
  )
}