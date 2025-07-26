// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/features/auth/pages/LoginPage'
import AuthProvider from './features/auth/components/AuthProvider'
import MainLayout from '@/components/layout/MainLayout' // <-- Importer
import DashboardPage from '@/pages/DashboardPage' // <-- Importer
import ProtectedRoute from '@/features/auth/components/ProtectedRoute' // <-- Importer
import RegisterPage from '@/features/auth/pages/RegisterPage' // <-- Importer
import CreateOfferPage from '@/pages/CreateOfferPage'
import OffersListPage from '@/pages/OffersListPage' // <-- Importer
import OfferDetailPage from '@/pages/OfferDetailPage'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Routes Publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} /> 
            <Route path="/offers" element={<OffersListPage />} />
            <Route path="/offers/:offerId" element={<OfferDetailPage />} />

            {/* Routes Protégées */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/offers/create" element={<CreateOfferPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App