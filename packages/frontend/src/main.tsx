// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import '@/lib/firebase'

import { Provider } from 'react-redux' // <-- Importer le Provider
import { store } from './store/store' // <-- Importer notre store

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}> {/* Envelopper l'application avec le Provider */}
      <App />
    </Provider>
  </React.StrictMode>,
)