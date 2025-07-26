// src/features/auth/components/RegisterForm.tsx
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

// 1. Schéma de validation avec confirmation de mot de passe
const registerSchema = z
  .object({
    displayName: z.string().min(3, 'Le nom doit faire au moins 3 caractères'),
    email: z.string().email('Adresse e-mail invalide'),
    password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'], // L'erreur sera attachée à ce champ
  })

type RegisterFormInputs = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      
      // Mettre à jour le profil de l'utilisateur avec son nom
      await updateProfile(userCredential.user, {
        displayName: data.displayName,
      })

      console.log('Utilisateur créé:', userCredential.user)
      // L'AuthProvider mettra à jour l'état Redux automatiquement
      
      // Rediriger vers le tableau de bord après l'inscription
      navigate('/dashboard')

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('email', { message: 'Cette adresse e-mail est déjà utilisée.' })
      } else {
        setError('root', { message: 'Une erreur est survenue. Veuillez réessayer.' })
        console.error('Erreur d\'inscription:', error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md shadow-sm">
        <input {...register('displayName')} placeholder="Nom complet" required className="input-field" />
        {errors.displayName && <p className="error-text">{errors.displayName.message}</p>}

        <input {...register('email')} type="email" placeholder="Adresse e-mail" required className="input-field" />
        {errors.email && <p className="error-text">{errors.email.message}</p>}

        <input {...register('password')} type="password" placeholder="Mot de passe" required className="input-field" />
        {errors.password && <p className="error-text">{errors.password.message}</p>}

        <input {...register('confirmPassword')} type="password" placeholder="Confirmer le mot de passe" required className="input-field" />
        {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
      </div>

      {errors.root && <p className="error-text text-center">{errors.root.message}</p>}

      <div>
        <button type="submit" disabled={isSubmitting} className="group submit-button w-full">
          {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </div>
    </form>
  )
}