// src/features/offers/components/SearchFilters.tsx
import { useForm, type SubmitHandler } from 'react-hook-form'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'

// Type pour les données de notre formulaire de recherche
export interface SearchFilterValues {
  fromCity: string
  toCity: string
  travelDate: string
}

interface SearchFiltersProps {
  onSearch: (filters: SearchFilterValues) => void
  loading: boolean
}

export default function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const { register, handleSubmit } = useForm<SearchFilterValues>()

  const handleFormSubmit: SubmitHandler<SearchFilterValues> = (data) => {
    onSearch(data)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          {/* Champ Départ */}
          <div className="md:col-span-1">
            <label htmlFor="fromCity" className="block text-sm font-medium text-gray-700">
              Départ
            </label>
            <input
              id="fromCity"
              type="text"
              {...register('fromCity')}
              placeholder="Ex: Paris"
              className="input-field mt-1"
            />
          </div>

          {/* Champ Arrivée */}
          <div className="md:col-span-1">
            <label htmlFor="toCity" className="block text-sm font-medium text-gray-700">
              Arrivée
            </label>
            <input
              id="toCity"
              type="text"
              {...register('toCity')}
              placeholder="Ex: Marseille"
              className="input-field mt-1"
            />
          </div>

          {/* Champ Date */}
          <div className="md:col-span-1">
            <label htmlFor="travelDate" className="block text-sm font-medium text-gray-700">
              À partir du
            </label>
            <input
              id="travelDate"
              type="date"
              {...register('travelDate')}
              className="input-field mt-1"
            />
          </div>

          {/* Bouton de recherche */}
          <div className="lg:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="submit-button w-full flex items-center justify-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Rechercher
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}