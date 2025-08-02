// src/pages/EditOfferPage.tsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { travelOfferSchema, type TravelOffer } from '@voyengo/shared/types/offer'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useAppSelector } from '@/hooks/reduxHooks'
import type { TravelOfferWithId } from '@/types'

// Fonction pour formater un Timestamp ou une Date en YYYY-MM-DD pour l'input[type=date]
const formatDateForInput = (date: any) => {
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return d.toISOString().split('T')[0];
};

export default function EditOfferPage() {
  const { offerId } = useParams<{ offerId: string }>()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // reset est une fonction de react-hook-form pour remplir le formulaire
    setValue,
  } = useForm<TravelOffer>({
    resolver: zodResolver(travelOfferSchema),
  })

  // Effet pour récupérer les données de l'offre et pré-remplir le formulaire
  useEffect(() => {
    if (!offerId) return

    const fetchOffer = async () => {
      const offerRef = doc(db, 'offers', offerId)
      const docSnap = await getDoc(offerRef)

      if (docSnap.exists()) {
        const offerData = docSnap.data() as TravelOfferWithId
        // Sécurité : vérifier que l'utilisateur est bien le propriétaire de l'offre
        if (user?.uid !== offerData.userId) {
          alert("Vous n'êtes pas autorisé à modifier cette offre.")
          navigate('/dashboard')
          return
        }
        // Pré-remplir le formulaire avec les données existantes
        setValue('route.from.city', offerData.route.from.city);
        setValue('route.from.country', offerData.route.from.country);
        setValue('route.to.city', offerData.route.to.city);
        setValue('route.to.country', offerData.route.to.country);
        setValue('travelDate', formatDateForInput(offerData.travelDate));
        setValue('availableSpace.weight', offerData.availableSpace.weight);
        setValue('pricing.pricePerKg', offerData.pricing.pricePerKg);
        setValue('description', offerData.description);
      } else {
        alert('Offre non trouvée.')
        navigate('/dashboard')
      }
    }
    fetchOffer()
  }, [offerId, user, navigate, setValue])

  const onSubmit: SubmitHandler<TravelOffer> = async (data) => {
    if (!offerId) return

    try {
      const offerRef = doc(db, 'offers', offerId)
      await updateDoc(offerRef, {
        ...data,
        travelDate: new Date(data.travelDate),
        updatedAt: serverTimestamp(), // Ajouter un champ pour la date de mise à jour
      })
      alert('Votre offre a été mise à jour avec succès !')
      navigate('/dashboard')
    } catch (e) {
      console.error('Erreur lors de la mise à jour: ', e)
      alert('Une erreur est survenue.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier mon offre de voyage</h1>
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