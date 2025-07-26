// src/pages/DashboardPage.tsx
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAppSelector } from '@/hooks/reduxHooks'
import type { TravelOfferWithId } from '@/types'
import OfferCard from '@/features/offers/components/OfferCard' // On réutilise notre super composant !

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth)
  const [myOffers, setMyOffers] = useState<TravelOfferWithId[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchMyOffers = async () => {
      try {
        setLoading(true)
        const offersQuery = query(
          collection(db, 'offers'),
          where('userId', '==', user.uid), // La condition clé !
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(offersQuery)
        const offersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TravelOfferWithId[]
        setMyOffers(offersData)
      } catch (error) {
        console.error("Erreur lors de la récupération de mes offres:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMyOffers()
  }, [user])

  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Mon Tableau de bord
          </h1>
          <Link to="/offers/create" className="group submit-button px-6">
            Créer une offre
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <h2 className="text-xl font-semibold mb-4">Mes offres de voyage</h2>
          {loading ? (
            <p>Chargement de vos offres...</p>
          ) : myOffers.length > 0 ? (
            <div className="space-y-4">
              {myOffers.map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p>Vous n'avez pas encore créé d'offre.</p>
              <Link to="/offers/create" className="text-primary-600 font-semibold mt-2 inline-block">
                Créez votre première offre !
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}