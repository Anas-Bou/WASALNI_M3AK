// src/pages/AdminDashboardPage.tsx
import { useEffect, useState } from 'react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Stats {
  users: number
  offers: number
  conversations: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'))
        const offersSnap = await getCountFromServer(collection(db, 'offers'))
        const convosSnap = await getCountFromServer(collection(db, 'conversations'))

        setStats({
          users: usersSnap.data().count,
          offers: offersSnap.data().count,
          conversations: convosSnap.data().count,
        })
      } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <p>Chargement des statistiques...</p>

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Administrateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Utilisateurs inscrits</h3>
          <p className="text-4xl font-bold text-primary-600 mt-2">{stats?.users ?? '...'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Offres créées</h3>
          <p className="text-4xl font-bold text-primary-600 mt-2">{stats?.offers ?? '...'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Conversations</h3>
          <p className="text-4xl font-bold text-primary-600 mt-2">{stats?.conversations ?? '...'}</p>
        </div>
      </div>
    </div>
  )
}