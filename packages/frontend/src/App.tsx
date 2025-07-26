// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/features/auth/pages/LoginPage'
import AuthProvider from './features/auth/components/AuthProvider'
import MainLayout from '@/components/layout/MainLayout' // <-- Importer
import DashboardPage from '@/pages/DashboardPage' // <-- Importer
import ProtectedRoute from '@/features/auth/components/ProtectedRoute' // <-- Importer

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Routes Publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Routes Protégées */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Plus tard: /my-offers, /profile, etc. */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App