// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet /> {/* C'est ici que le contenu des pages (HomePage, LoginPage) sera affiché */}
      </main>
    </div>
  )
}