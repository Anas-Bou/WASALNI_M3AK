// src/pages/HomePage.tsx
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800">VOYENGO</h1>
      <p className="text-gray-600 mt-2">Connecter voyageurs et expéditeurs, simplement.</p>
      <div className="mt-8">
        <Link
          to="/login"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </div>
  )
}