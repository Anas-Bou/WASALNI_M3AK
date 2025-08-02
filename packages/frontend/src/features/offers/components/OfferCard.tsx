// src/features/offers/components/OfferCard.tsx
import type { TravelOfferWithId } from '@/types'
import { CalendarDaysIcon, MapPinIcon, ScaleIcon } from '@heroicons/react/24/outline'
import { Link ,useNavigate} from 'react-router-dom'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'

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
  showManagementControls?: boolean // <-- Rendre la prop optionnelle
  onDelete?: (offerId: string) => void 
}

export default function OfferCard({ offer, showManagementControls = false, onDelete }: OfferCardProps) {
  const navigate = useNavigate()

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Empêche le Link parent de se déclencher
    e.stopPropagation() // Empêche la propagation de l'événement
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      onDelete?.(offer.id)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // On va créer cette page plus tard
    navigate(`/offers/${offer.id}/edit`)
  }


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
        {showManagementControls && (
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
            <button onClick={handleEditClick} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <PencilIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={handleDeleteClick} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <TrashIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )}
        </div>
    </Link>
  )
}