// src/pages/OfferDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TravelOfferWithId } from '@/types'
import { CalendarDaysIcon, ScaleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { createOrGetConversation } from '@/features/chat/services/chatService'
import { useAppSelector } from '@/hooks/reduxHooks'
import { useNavigate } from 'react-router-dom'




// On réutilise notre fonction de formatage
const formatDate = (timestamp: { seconds: number }) => {
  return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function OfferDetailPage() {
  // useParams() est le hook de react-router qui nous donne les paramètres de l'URL
  const { offerId } = useParams<{ offerId: string }>()
  const [offer, setOffer] = useState<TravelOfferWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentUser = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()

  const handleContact = async () => {
    if (!currentUser || !offer) {
      alert('Vous devez être connecté pour contacter le voyageur.')
      navigate('/login')
      return
    }

    if (currentUser.uid === offer.userId) {
      alert("Vous ne pouvez pas vous contacter vous-même.")
      return
    }

    try {

      const conversationId = await createOrGetConversation(
      currentUser.uid,
      offer.userId,
      currentUser.displayName, // On passe le nom de l'utilisateur actuel
      offer.author.displayName // On passe le nom de l'auteur de l'offre
    )
      navigate(`/messages/${conversationId}`)
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error)
      alert("Impossible de démarrer la conversation.")
    }
  }

  useEffect(() => {
    console.log("Détail de la page chargé. ID de l'offre depuis l'URL:", offerId);

    if (!offerId) {
      setError('ID de l\'offre non spécifié.')
      setLoading(false)
      return
    }

    const fetchOffer = async () => {
      try {
        setLoading(true)
        const offerRef = doc(db, 'offers', offerId)
        const docSnap = await getDoc(offerRef)

        if (docSnap.exists()) {
          console.log("Document trouvé ! Données:", docSnap.data());

          setOffer({ id: docSnap.id, ...docSnap.data() } as TravelOfferWithId)
        } else {
          console.log("Aucun document trouvé pour cet ID.");
          setError('Offre non trouvée.')
        }
      } catch (err) {
        console.error("Erreur Firebase lors de la récupération:", err);
        console.error(err)
        setError('Erreur lors du chargement de l\'offre.')
      } finally {
        setLoading(false)
      }
    }

    fetchOffer()
  }, [offerId]) // L'effet se redéclenche si l'ID dans l'URL change

  console.log("État actuel du composant:", { loading, error, offer });

  if (loading) {
    return <div className="p-10 text-center">Chargement de l'offre...</div>
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>
  }

  if (!offer) {
    return null // Ne devrait pas arriver si l'erreur est bien gérée
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header de l'offre */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {offer.route.from.city} → {offer.route.to.city}
              </h1>
              <p className="text-md text-gray-500">{offer.route.from.country} → {offer.route.to.country}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-primary-600">{offer.pricing.pricePerKg}€ / kg</p>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <CalendarDaysIcon className="h-8 w-8 text-primary-600 mb-2"/>
              <span className="font-semibold">Date de voyage</span>
              <span className="text-gray-600">{formatDate(offer.travelDate)}</span>
            </div>
            <div className="flex flex-col items-center">
              <ScaleIcon className="h-8 w-8 text-primary-600 mb-2"/>
              <span className="font-semibold">Espace disponible</span>
              <span className="text-gray-600">{offer.availableSpace.weight} kg</span>
            </div>
            <div className="flex flex-col items-center">
              <UserCircleIcon className="h-8 w-8 text-primary-600 mb-2"/>
              <span className="font-semibold">Proposé par</span>
              <span className="text-gray-600">{offer.author?.displayName || 'Utilisateur anonyme'}</span>
            </div>
          </div>
        </div>

        {/* Colonne principale et latérale */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Détails de l'offre</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {offer.description || 'Le voyageur n\'a pas fourni de description supplémentaire.'}
            </p>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Intéressé ?</h2>
              <button onClick={handleContact} className="w-full submit-button">
                Contacter le voyageur
              </button>
              <p className="text-xs text-center mt-2 text-gray-500">Vous serez mis en contact avec le voyageur.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
