// src/pages/OffersListPage.tsx
import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import OfferCard from '@/features/offers/components/OfferCard' // <-- Importer le composant
import type { TravelOfferWithId } from '@/types' // <-- Importer le type

export default function OffersListPage() {
  // On utilise notre type plus précis
  const [offers, setOffers] = useState<TravelOfferWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true)
        const offersQuery = query(collection(db, 'offers'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(offersQuery)
        
        const offersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TravelOfferWithId[] // On caste avec le bon type

        setOffers(offersData)
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les offres.')
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (loading) {
    // On peut créer un composant de SKELETON plus tard
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Offres de voyage disponibles</h1>
        <div className="space-y-6">
          <div className="h-48 bg-white rounded-lg shadow-md animate-pulse"></div>
          <div className="h-48 bg-white rounded-lg shadow-md animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Offres de voyage disponibles</h1>
      <div className="space-y-6">
        {offers.length > 0 ? (
          offers.map(offer => (
            // On utilise notre nouveau composant ici
            <OfferCard key={offer.id} offer={offer} />
          ))
        ) : (
          <div className="bg-white p-10 rounded-lg shadow text-center">
            <h3 className="text-lg font-medium text-gray-800">Aucune offre disponible</h3>
            <p className="text-gray-500 mt-1">Revenez plus tard ou soyez le premier à en créer une !</p>
          </div>
        )}
      </div>
    </div>
  )
}