// src/pages/OffersListPage.tsx
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where, Timestamp, type QueryDocumentSnapshot, type DocumentData, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OfferCard from '@/features/offers/components/OfferCard';
import type { TravelOfferWithId } from '@/types';
import SearchFilters, { type SearchFilterValues } from '@/features/offers/components/SearchFilters';

const OFFERS_PER_PAGE = 5;

export default function OffersListPage() {
  const [offers, setOffers] = useState<TravelOfferWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // On stocke les filtres actuels dans l'état pour la pagination
  const [currentFilters, setCurrentFilters] = useState<SearchFilterValues | undefined>(undefined);

  // CORRECTION: On transforme fetchOffers en fonction standard. Pas besoin de useCallback ici.
  const fetchOffers = async (filters?: SearchFilterValues, loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        // Quand on ne "load more" pas, c'est une nouvelle recherche. On réinitialise tout.
        setOffers([]);
        setLastVisible(null);
        setHasMore(true);
      }

      let offersQuery = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));

      const activeFilters = loadMore ? currentFilters : filters;

      // Application des filtres
      if (activeFilters) {
        if (activeFilters.fromCity) {
          offersQuery = query(offersQuery, where('search_from_city', '==', activeFilters.fromCity.toLowerCase()));
        }
        if (activeFilters.toCity) {
          offersQuery = query(offersQuery, where('search_to_city', '==', activeFilters.toCity.toLowerCase()));
        }
        if (activeFilters.travelDate) {
          offersQuery = query(offersQuery, where('travelDate', '>=', Timestamp.fromDate(new Date(activeFilters.travelDate))));
        }
      }

      // Application de la pagination
      if (loadMore && lastVisible) {
        offersQuery = query(offersQuery, startAfter(lastVisible), limit(OFFERS_PER_PAGE));
      } else {
        offersQuery = query(offersQuery, limit(OFFERS_PER_PAGE));
      }

      const querySnapshot = await getDocs(offersQuery);
      const newOffers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TravelOfferWithId[];
      
      setOffers(prevOffers => loadMore ? [...prevOffers, ...newOffers] : newOffers);
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc || null);

      if (querySnapshot.docs.length < OFFERS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les offres. Avez-vous créé les index dans Firestore ?');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // CORRECTION: Un seul useEffect pour le chargement initial.
  useEffect(() => {
    fetchOffers();
  }, []); // Le tableau vide s'assure qu'il ne s'exécute qu'une seule fois.

  const handleSearch = (filters: SearchFilterValues) => {
    setCurrentFilters(filters); // On sauvegarde les filtres pour la pagination
    fetchOffers(filters, false);
  };

  const handleLoadMore = () => {
    fetchOffers(currentFilters, true);
  };

  // Le JSX ne change pas
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Offres de voyage disponibles</h1>
      <p className="text-gray-600 mb-8">Trouvez le voyage parfait pour votre envoi.</p>
      
      <SearchFilters onSearch={handleSearch} loading={loading} />

      {loading ? (
         <div className="space-y-6 mt-8">
           <div className="h-48 bg-white rounded-lg shadow-md animate-pulse"></div>
           <div className="h-48 bg-white rounded-lg shadow-md animate-pulse"></div>
         </div>
      ) : error ? (
        <div className="p-10 text-center text-red-500">{error}</div>
      ) : (
        <div className="space-y-6 mt-8">
          {offers.length > 0 ? (
            offers.map(offer => <OfferCard key={offer.id} offer={offer} />)
          ) : (
            <div className="bg-white p-10 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-800">Aucun résultat</h3>
              <p className="text-gray-500 mt-1">Essayez d'élargir vos critères de recherche.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        {!loading && hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="submit-button px-8"
          >
            {loadingMore ? 'Chargement...' : 'Charger plus d\'offres'}
          </button>
        )}
        {!loading && !hasMore && offers.length > 0 && (
          <p className="text-gray-500">Vous avez atteint la fin de la liste.</p>
        )}
      </div>
    </div>
  );
}