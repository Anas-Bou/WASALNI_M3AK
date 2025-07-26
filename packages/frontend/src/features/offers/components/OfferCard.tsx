// src/features/offers/components/OfferCard.tsx
import type { TravelOfferWithId } from '@/types'
import { CalendarDaysIcon, MapPinIcon, ScaleIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

// Une petite fonction utilitaire pour formater les dates
const formatDate = (timestamp: { seconds: number }) => {
  return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

interface OfferCardProps {
  offer: TravelOfferWithId
}

export default function OfferCard({ offer }: OfferCardProps) {
  return (
    <Link to={`/offers/${offer.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
            <div className="flex justify-between items-start">
            {/* Informations principales */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
                <span className="text-xl font-bold text-gray-800">{offer.route.from.city}</span>
                <span className="text-xl font-bold text-gray-400">→</span>
                <span className="text-xl font-bold text-gray-800">{offer.route.to.city}</span>
                </div>
                <p className="text-sm text-gray-500 ml-8">
                {offer.route.from.country} → {offer.route.to.country}
                </p>

                <div className="mt-4 flex items-center gap-2 text-gray-700">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <span>{formatDate(offer.travelDate)}</span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-gray-700">
                <ScaleIcon className="h-5 w-5 text-gray-400" />
                <span>{offer.availableSpace.weight} kg disponibles</span>
                </div>
            </div>

            {/* Prix */}
            <div className="text-right">
                <p className="text-2xl font-extrabold text-primary-600">
                {offer.pricing.pricePerKg}€
                </p>
                <p className="text-sm text-gray-500">par kg</p>
            </div>
            </div>

            {/* Description (si elle existe) */}
            {offer.description && (
            <p className="mt-4 text-gray-600 border-t pt-4">{offer.description}</p>
            )}
        </div>
        
        {/* Pied de la carte */}
        <div className="bg-gray-50 px-6 py-3">
            <button className="w-full submit-button">
            Voir l'offre et contacter
            </button>
        </div>
        </div>
    </Link>
  )
}