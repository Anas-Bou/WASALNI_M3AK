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
import ChatPage from '@/pages/ChatPage' // <-- Importer
import MessagesListPage from '@/pages/MessagesListPage'
import AdminRoute from '@/features/auth/components/AdminRoute'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import EditOfferPage from '@/pages/EditOfferPage' // <-- Importer




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
              <Route path="/offers/:offerId/edit" element={<EditOfferPage />} /> {/* <-- Ajouter cette ligne */}
              <Route path="/messages" element={<MessagesListPage />} />
              <Route path="/messages/:conversationId" element={<ChatPage />} />
            </Route>
            {/* --- ROUTES ADMIN --- */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App