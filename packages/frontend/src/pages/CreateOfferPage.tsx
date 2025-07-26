// src/pages/CreateOfferPage.tsx
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { travelOfferSchema, type TravelOffer } from '@voyengo/shared/types/offer' // Import depuis le paquet partagé
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAppSelector } from '@/hooks/reduxHooks'
import { useNavigate } from 'react-router-dom'

export default function CreateOfferPage() {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TravelOffer>({
    resolver: zodResolver(travelOfferSchema),
  })

  const onSubmit: SubmitHandler<TravelOffer> = async (data) => {
    if (!user) {
      alert('Vous devez être connecté pour créer une offre.')
      return
    }

    try {
      const offerData = {
        ...data,
        userId: user.uid,
        author: {
          displayName: user.displayName,
          // plus tard on ajoutera photoURL: user.photoURL
        },
        status: 'active',
        createdAt: serverTimestamp(),
        // Conversion de la date string en objet Date pour Firestore
        travelDate: new Date(data.travelDate),
      }

      const docRef = await addDoc(collection(db, 'offers'), offerData)
      console.log('Offre créée avec ID: ', docRef.id)
      alert('Votre offre a été créée avec succès !')
      navigate('/dashboard') // Rediriger après succès
    } catch (e) {
      console.error('Erreur lors de la création de l\'offre: ', e)
      alert('Une erreur est survenue.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Créer une nouvelle offre de voyage</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* Section Route */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Départ</h3>
            <input {...register('route.from.city')} placeholder="Ville de départ" className="input-field" />
            {errors.route?.from?.city && <p className="error-text">{errors.route.from.city.message}</p>}
            <input {...register('route.from.country')} placeholder="Pays de départ" className="input-field mt-2" />
            {errors.route?.from?.country && <p className="error-text">{errors.route.from.country.message}</p>}
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Arrivée</h3>
            <input {...register('route.to.city')} placeholder="Ville d'arrivée" className="input-field" />
            {errors.route?.to?.city && <p className="error-text">{errors.route.to.city.message}</p>}
            <input {...register('route.to.country')} placeholder="Pays d'arrivée" className="input-field mt-2" />
            {errors.route?.to?.country && <p className="error-text">{errors.route.to.country.message}</p>}
          </div>
        </div>

        {/* Section Détails */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Date de voyage</label>
            <input {...register('travelDate')} type="date" className="input-field" />
            {errors.travelDate && <p className="error-text">{errors.travelDate.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Espace disponible (en kg)</label>
            <input {...register('availableSpace.weight', { valueAsNumber: true })} type="number" step="0.5" className="input-field" />
            {errors.availableSpace?.weight && <p className="error-text">{errors.availableSpace.weight.message}</p>}
          </div>
        </div>

        {/* Section Prix */}
        <div>
          <label className="block font-medium mb-1">Prix par kg (en EUR)</label>
          <input {...register('pricing.pricePerKg', { valueAsNumber: true })} type="number" step="0.01" className="input-field" />
          {errors.pricing?.pricePerKg && <p className="error-text">{errors.pricing.pricePerKg.message}</p>}
        </div>

        {/* Section Description */}
        <div>
          <label className="block font-medium mb-1">Description (optionnel)</label>
          <textarea {...register('description')} rows={4} className="input-field"></textarea>
          {errors.description && <p className="error-text">{errors.description.message}</p>}
        </div>

        <div className="text-right">
          <button type="submit" disabled={isSubmitting} className="submit-button px-6">
            {isSubmitting ? 'Création en cours...' : 'Publier mon offre'}
          </button>
        </div>
      </form>
    </div>
  )
}