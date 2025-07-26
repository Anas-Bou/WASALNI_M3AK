// src/pages/DashboardPage.tsx
import { Link } from 'react-router-dom' // <-- Importer

export default function DashboardPage() {
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Tableau de bord
          </h1>
          <Link to="/offers/create" className="group submit-button"> {/* <-- Ajouter ce lien */}
            Créer une offre
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              <p className="p-4">Bienvenue sur votre espace personnel ! Bientôt, vous verrez vos offres et demandes ici.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}