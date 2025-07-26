// packages/backend/src/config/firebaseAdmin.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Chargez vos credentials depuis les variables d'environnement.
// C'est beaucoup plus sûr que de les mettre dans le code.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')

if (!serviceAccount.project_id) {
  console.error('FIREBASE_SERVICE_ACCOUNT variable d\'environnement non définie ou invalide.')
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
})

console.log('✅ Firebase Admin SDK initialisé.')

// Exportez les services initialisés pour les utiliser dans le reste de l'application
export const adminAuth = getAuth()
export const adminDb = getFirestore()