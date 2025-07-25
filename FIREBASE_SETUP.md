# VOYENGO - Configuration Firebase Complète

## 🔥 Configuration Initiale Firebase

### 1. Création du Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer un nouveau projet "voyengo-prod"
3. Activer Google Analytics (optionnel)

### 2. Services à Activer

- **Authentication** ✓
- **Firestore Database** ✓
- **Storage** ✓
- **Hosting** (optionnel)
- **Functions** (pour futures features)

## 🔐 Firebase Authentication

### Configuration des Méthodes d'Authentification

1. **Email/Password** - Activer
2. **Google** - Configurer OAuth
3. **Facebook** (optionnel) - Configurer App ID
4. **Phone** (pour vérification future)

### Configuration Frontend
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Development: Use emulators
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

### Configuration Backend (Admin SDK)
```typescript
// src/config/firebase-admin.ts
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const serviceAccount: ServiceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
)

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${serviceAccount.projectId}.appspot.com`
})

export const adminAuth = getAuth()
export const adminDb = getFirestore()
export const adminStorage = getStorage()
```

## 📊 Structure Firestore

### Collections et Sous-collections

```
firestore/
├── users/
│   └── {userId}/
│       ├── profile (document)
│       └── notifications/ (subcollection)
│           └── {notificationId}
│
├── offers/
│   └── {offerId}/
│       ├── data (document)
│       └── interested_users/ (subcollection)
│           └── {userId}
│
├── requests/
│   └── {requestId}/
│       ├── data (document)
│       └── proposals/ (subcollection)
│           └── {proposalId}
│
├── transactions/
│   └── {transactionId}/
│       ├── data (document)
│       └── timeline/ (subcollection)
│           └── {eventId}
│
├── conversations/
│   └── {conversationId}/
│       ├── metadata (document)
│       └── messages/ (subcollection)
│           └── {messageId}
│
├── reviews/
│   └── {reviewId}
│
└── reports/
    └── {reportId}
```

## 🛡️ Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    function hasVerifiedEmail() {
      return request.auth.token.email_verified == true;
    }
    
    function isValidUser() {
      return isAuthenticated() && hasVerifiedEmail();
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId) && 
        request.resource.data.keys().hasAll(['email', 'displayName', 'role']) &&
        request.resource.data.role in ['traveler', 'sender'];
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
      
      // Notifications subcollection
      match /notifications/{notificationId} {
        allow read: if isOwner(userId);
        allow write: if false; // Only server can write
      }
    }
    
    // Offers collection
    match /offers/{offerId} {
      allow read: if isAuthenticated();
      allow create: if isValidUser() && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.keys().hasAll(['route', 'travelDate', 'availableSpace', 'pricing']);
      allow update: if isOwner(resource.data.userId) && 
        request.resource.data.userId == resource.data.userId; // Can't change owner
      allow delete: if isOwner(resource.data.userId) || isAdmin();
      
      // Interested users subcollection
      match /interested_users/{userId} {
        allow read: if isOwner(parent(/databases/{database}/documents/offers/{offerId}).data.userId);
        allow create: if isOwner(userId);
        allow delete: if isOwner(userId);
      }
    }
    
    // Requests collection
    match /requests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isValidUser() && 
        request.resource.data.senderId == request.auth.uid;
      allow update: if isOwner(resource.data.senderId);
      allow delete: if isOwner(resource.data.senderId) || isAdmin();
      
      // Proposals subcollection
      match /proposals/{proposalId} {
        allow read: if isOwner(parent(/databases/{database}/documents/requests/{requestId}).data.senderId) ||
                      isOwner(resource.data.travelerId);
        allow create: if isValidUser();
        allow update: if isOwner(resource.data.travelerId);
      }
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isOwner(resource.data.travelerId) || 
                    isOwner(resource.data.senderId) || 
                    isAdmin();
      allow create: if isValidUser() && 
        (isOwner(request.resource.data.travelerId) || isOwner(request.resource.data.senderId));
      allow update: if (isOwner(resource.data.travelerId) || isOwner(resource.data.senderId)) &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'timeline']);
      allow delete: if false; // Never delete transactions
      
      // Timeline subcollection
      match /timeline/{eventId} {
        allow read: if isOwner(parent(/databases/{database}/documents/transactions/{transactionId}).data.travelerId) ||
                      isOwner(parent(/databases/{database}/documents/transactions/{transactionId}).data.senderId);
        allow write: if false; // Only server can write
      }
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if isOwner(resource.data.participant1) || 
                    isOwner(resource.data.participant2);
      allow create: if isValidUser() && 
        (isOwner(request.resource.data.participant1) || isOwner(request.resource.data.participant2));
      allow update: if false; // Metadata is immutable
      allow delete: if false;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isOwner(parent(/databases/{database}/documents/conversations/{conversationId}).data.participant1) ||
                      isOwner(parent(/databases/{database}/documents/conversations/{conversationId}).data.participant2);
        allow create: if isValidUser() && 
          isOwner(request.resource.data.senderId) &&
          (isOwner(parent(/databases/{database}/documents/conversations/{conversationId}).data.participant1) ||
           isOwner(parent(/databases/{database}/documents/conversations/{conversationId}).data.participant2));
        allow update: if false; // Messages are immutable
        allow delete: if false;
      }
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true; // Public
      allow create: if isValidUser() && 
        isOwner(request.resource.data.reviewerId) &&
        exists(/databases/{database}/documents/transactions/$(request.resource.data.transactionId));
      allow update: if isOwner(resource.data.reviewerId) && 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['rating', 'comment']);
      allow delete: if isOwner(resource.data.reviewerId) || isAdmin();
    }
    
    // Reports collection (for moderation)
    match /reports/{reportId} {
      allow read: if isAdmin() || isOwner(resource.data.reporterId);
      allow create: if isValidUser();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Admin-only collections
    match /stats/{document=**} {
      allow read: if isAdmin();
      allow write: if false; // Only Cloud Functions
    }
    
    match /config/{document=**} {
      allow read: if true; // Public config
      allow write: if isAdmin();
    }
  }
}
```

## 📦 Règles Firebase Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidImageFile() {
      return request.resource.contentType.matches('image/.*') && 
             request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
    
    function isValidDocumentFile() {
      return request.resource.contentType.matches('application/pdf|image/.*') && 
             request.resource.size < 10 * 1024 * 1024; // 10MB max
    }
    
    // User profile pictures
    match /users/{userId}/profile/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isValidImageFile();
    }
    
    // Identity verification documents
    match /users/{userId}/verification/{fileName} {
      allow read: if isOwner(userId) || request.auth.token.admin == true;
      allow write: if isOwner(userId) && isValidDocumentFile();
    }
    
    // Item photos for requests
    match /requests/{requestId}/items/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidImageFile();
    }
    
    // Proof of delivery
    match /transactions/{transactionId}/proof/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        (request.auth.uid == resource.metadata['uploadedBy']) &&
        isValidImageFile();
    }
    
    // Chat attachments
    match /conversations/{conversationId}/attachments/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        request.resource.size < 25 * 1024 * 1024; // 25MB max for attachments
    }
    
    // Public assets (logos, etc.)
    match /public/{fileName} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

## 🔧 Configuration des Index Firestore

### Index Composites Requis

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "offers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "route.from.city", "order": "ASCENDING" },
        { "fieldPath": "route.to.city", "order": "ASCENDING" },
        { "fieldPath": "travelDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "offers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "route.from.city", "order": "ASCENDING" },
        { "fieldPath": "route.to.city", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "conversationId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "travelerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "senderId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 🚀 Scripts de Déploiement

### Deploy Rules & Indexes
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy everything
firebase deploy
```

### Backup Script
```typescript
// scripts/backup-firestore.ts
import { adminDb } from '../src/config/firebase-admin'
import { Storage } from '@google-cloud/storage'

const storage = new Storage()
const bucket = storage.bucket('voyengo-backups')

export async function backupFirestore() {
  const collections = ['users', 'offers', 'requests', 'transactions']
  const timestamp = new Date().toISOString()
  
  for (const collection of collections) {
    const snapshot = await adminDb.collection(collection).get()
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    const file = bucket.file(`${timestamp}/${collection}.json`)
    await file.save(JSON.stringify(data, null, 2))
    
    console.log(`Backed up ${data.length} documents from ${collection}`)
  }
}
```

## 🔍 Monitoring & Alertes

### Firebase Performance Monitoring
```typescript
// src/config/performance.ts
import { getPerformance } from 'firebase/performance'

export const perf = getPerformance()

// Custom traces
export function traceAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const trace = perf.trace(name)
  trace.start()
  
  return fn().finally(() => {
    trace.stop()
  })
}
```

### Usage Quotas & Limites

| Service | Limite Gratuite | Limite Payante |
|---------|----------------|----------------|
| Auth | 10k/mois | Illimité |
| Firestore Reads | 50k/jour | $0.06/100k |
| Firestore Writes | 20k/jour | $0.18/100k |
| Storage | 5GB | $0.026/GB |
| Bandwidth | 10GB/mois | $0.12/GB |

### Alertes Recommandées

1. **Budget Alert**: Notification à 80% du budget mensuel
2. **Error Rate**: > 1% d'erreurs sur 5 minutes
3. **Latency**: p95 > 1 seconde
4. **Storage**: > 80% de la limite

## 🔐 Sécurité Avancée

### App Check (Protection contre les bots)
```typescript
// src/config/app-check.ts
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

if (import.meta.env.PROD) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  })
}
```

### Custom Claims pour les Rôles
```typescript
// Backend: Set custom claims
await adminAuth.setCustomUserClaims(uid, {
  role: 'admin',
  verified: true
})

// Frontend: Check claims
const idTokenResult = await auth.currentUser.getIdTokenResult()
const isAdmin = idTokenResult.claims.admin === true
```

## 📝 Checklist de Production

- [ ] Activer App Check
- [ ] Configurer les domaines autorisés
- [ ] Définir les quotas et alertes
- [ ] Activer les sauvegardes automatiques
- [ ] Configurer les règles de sécurité strictes
- [ ] Créer tous les index composites
- [ ] Tester les règles avec l'émulateur
- [ ] Configurer les variables d'environnement
- [ ] Activer l'audit logging
- [ ] Mettre en place le monitoring