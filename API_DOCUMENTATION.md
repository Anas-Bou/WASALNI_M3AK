# VOYENGO - Documentation API REST

## 🌐 Vue d'ensemble

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.voyengo.com/api`

### Authentication
Toutes les requêtes authentifiées doivent inclure un header Authorization:
```
Authorization: Bearer <firebase-id-token>
```

### Format des Réponses
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}
```

### Codes d'Erreur Standards
| Code | Description |
|------|-------------|
| 400 | Bad Request - Paramètres invalides |
| 401 | Unauthorized - Token manquant ou invalide |
| 403 | Forbidden - Permissions insuffisantes |
| 404 | Not Found - Ressource introuvable |
| 409 | Conflict - Conflit de données |
| 422 | Unprocessable Entity - Validation échouée |
| 429 | Too Many Requests - Rate limit atteint |
| 500 | Internal Server Error |

## 🔐 Authentification

### POST /api/auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "Jean Dupont",
  "role": "traveler" // ou "sender"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uid123",
      "email": "user@example.com",
      "displayName": "Jean Dupont",
      "role": "traveler",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJSUzI1NiIs..."
  }
}
```

### POST /api/auth/login
Connexion avec email/mot de passe.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uid123",
      "email": "user@example.com",
      "displayName": "Jean Dupont",
      "role": "traveler",
      "emailVerified": true
    },
    "token": "eyJhbGciOiJSUzI1NiIs..."
  }
}
```

### POST /api/auth/refresh
Rafraîchir le token d'authentification.

**Headers:**
```
Authorization: Bearer <expired-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

### POST /api/auth/logout
Déconnexion (révoque le token).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Déconnexion réussie"
  }
}
```

### GET /api/auth/me
Obtenir les informations de l'utilisateur connecté.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uid123",
    "email": "user@example.com",
    "displayName": "Jean Dupont",
    "role": "traveler",
    "photoURL": "https://storage.googleapis.com/...",
    "phoneNumber": "+33612345678",
    "bio": "Voyageur fréquent entre Paris et Lyon",
    "rating": 4.8,
    "reviewCount": 23,
    "verificationStatus": {
      "email": true,
      "phone": true,
      "identity": false
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "stats": {
      "totalOffers": 15,
      "totalRequests": 8,
      "completedTransactions": 12
    }
  }
}
```

## 👤 Utilisateurs

### GET /api/users/:id
Obtenir le profil public d'un utilisateur.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uid123",
    "displayName": "Jean Dupont",
    "photoURL": "https://storage.googleapis.com/...",
    "bio": "Voyageur fréquent entre Paris et Lyon",
    "rating": 4.8,
    "reviewCount": 23,
    "verificationStatus": {
      "email": true,
      "phone": true,
      "identity": true
    },
    "memberSince": "2024-01-15T10:30:00Z",
    "stats": {
      "totalOffers": 15,
      "completedTransactions": 12
    }
  }
}
```

### PUT /api/users/:id
Mettre à jour le profil utilisateur (seulement son propre profil).

**Body:**
```json
{
  "displayName": "Jean Dupont",
  "bio": "Voyageur régulier Paris-Lyon",
  "phoneNumber": "+33612345678"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Profil mis à jour avec succès"
  }
}
```

### POST /api/users/:id/verify
Soumettre des documents de vérification.

**Body (multipart/form-data):**
```
identity_front: (file)
identity_back: (file)
proof_of_address: (file)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Documents soumis pour vérification",
    "verificationId": "ver_abc123"
  }
}
```

### POST /api/users/:id/upload-avatar
Uploader une photo de profil.

**Body (multipart/form-data):**
```
avatar: (file)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "photoURL": "https://storage.googleapis.com/voyengo/users/uid123/avatar.jpg"
  }
}
```

## ✈️ Offres de Voyage

### GET /api/offers
Lister les offres de voyage avec filtres.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| from | string | Ville de départ |
| to | string | Ville d'arrivée |
| date | string | Date de voyage (ISO 8601) |
| dateFrom | string | Date minimum |
| dateTo | string | Date maximum |
| minWeight | number | Poids minimum disponible (kg) |
| itemTypes | string | Types d'objets acceptés (comma-separated) |
| maxPrice | number | Prix maximum |
| page | number | Page (défaut: 1) |
| limit | number | Résultats par page (défaut: 20, max: 100) |
| sort | string | Tri: date_asc, date_desc, price_asc, price_desc |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "offer123",
      "userId": "uid123",
      "user": {
        "id": "uid123",
        "displayName": "Jean Dupont",
        "photoURL": "https://...",
        "rating": 4.8
      },
      "status": "active",
      "route": {
        "from": {
          "city": "Paris",
          "country": "France",
          "coordinates": {
            "lat": 48.8566,
            "lng": 2.3522
          }
        },
        "to": {
          "city": "Lyon",
          "country": "France",
          "coordinates": {
            "lat": 45.7640,
            "lng": 4.8357
          }
        }
      },
      "travelDate": "2024-02-15T10:00:00Z",
      "returnDate": "2024-02-20T18:00:00Z",
      "availableSpace": {
        "weight": 10,
        "dimensions": "50x40x20cm"
      },
      "acceptedItems": ["documents", "electronics", "clothing"],
      "prohibitedItems": ["liquids", "fragile"],
      "pricing": {
        "basePrice": 10,
        "pricePerKg": 5,
        "currency": "EUR"
      },
      "description": "Je voyage en train, bagages sécurisés",
      "createdAt": "2024-01-20T14:30:00Z",
      "interestedCount": 3
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### POST /api/offers
Créer une nouvelle offre de voyage.

**Body:**
```json
{
  "route": {
    "from": {
      "city": "Paris",
      "country": "France",
      "coordinates": {
        "lat": 48.8566,
        "lng": 2.3522
      }
    },
    "to": {
      "city": "Lyon",
      "country": "France",
      "coordinates": {
        "lat": 45.7640,
        "lng": 4.8357
      }
    }
  },
  "travelDate": "2024-02-15T10:00:00Z",
  "returnDate": "2024-02-20T18:00:00Z",
  "availableSpace": {
    "weight": 10,
    "dimensions": "50x40x20cm"
  },
  "acceptedItems": ["documents", "electronics", "clothing"],
  "prohibitedItems": ["liquids", "fragile"],
  "pricing": {
    "basePrice": 10,
    "pricePerKg": 5,
    "currency": "EUR"
  },
  "description": "Je voyage en train, bagages sécurisés"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "offer123",
    "message": "Offre créée avec succès"
  }
}
```

### GET /api/offers/:id
Obtenir les détails d'une offre.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "offer123",
    "userId": "uid123",
    "user": {
      "id": "uid123",
      "displayName": "Jean Dupont",
      "photoURL": "https://...",
      "rating": 4.8,
      "reviewCount": 23,
      "verificationStatus": {
        "email": true,
        "phone": true,
        "identity": true
      }
    },
    "status": "active",
    "route": {
      "from": {
        "city": "Paris",
        "country": "France",
        "coordinates": {
          "lat": 48.8566,
          "lng": 2.3522
        }
      },
      "to": {
        "city": "Lyon",
        "country": "France",
        "coordinates": {
          "lat": 45.7640,
          "lng": 4.8357
        }
      }
    },
    "travelDate": "2024-02-15T10:00:00Z",
    "returnDate": "2024-02-20T18:00:00Z",
    "availableSpace": {
      "weight": 10,
      "dimensions": "50x40x20cm"
    },
    "acceptedItems": ["documents", "electronics", "clothing"],
    "prohibitedItems": ["liquids", "fragile"],
    "pricing": {
      "basePrice": 10,
      "pricePerKg": 5,
      "currency": "EUR"
    },
    "description": "Je voyage en train, bagages sécurisés",
    "createdAt": "2024-01-20T14:30:00Z",
    "updatedAt": "2024-01-20T14:30:00Z",
    "interestedUsers": [
      {
        "userId": "uid456",
        "displayName": "Marie Martin",
        "photoURL": "https://...",
        "interestedAt": "2024-01-21T09:00:00Z"
      }
    ]
  }
}
```

### PUT /api/offers/:id
Mettre à jour une offre (seulement par le créateur).

**Body:**
```json
{
  "availableSpace": {
    "weight": 8
  },
  "description": "Mise à jour: espace réduit à 8kg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Offre mise à jour avec succès"
  }
}
```

### DELETE /api/offers/:id
Supprimer une offre (seulement par le créateur).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Offre supprimée avec succès"
  }
}
```

### POST /api/offers/:id/interest
Manifester son intérêt pour une offre.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Intérêt enregistré",
    "conversationId": "conv_abc123"
  }
}
```

## 📦 Demandes d'Envoi

### GET /api/requests
Lister les demandes d'envoi.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| from | string | Ville de départ |
| to | string | Ville d'arrivée |
| itemType | string | Type d'objet |
| status | string | Statut: pending, matched, in_transit, delivered |
| minBudget | number | Budget minimum |
| maxBudget | number | Budget maximum |
| page | number | Page (défaut: 1) |
| limit | number | Résultats par page (défaut: 20) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "req123",
      "senderId": "uid456",
      "sender": {
        "id": "uid456",
        "displayName": "Marie Martin",
        "photoURL": "https://...",
        "rating": 4.9
      },
      "status": "pending",
      "item": {
        "type": "documents",
        "description": "Dossier administratif important",
        "weight": 0.5,
        "dimensions": "A4",
        "value": 100,
        "photos": [
          "https://storage.googleapis.com/voyengo/requests/req123/photo1.jpg"
        ]
      },
      "route": {
        "from": {
          "city": "Paris",
          "country": "France"
        },
        "to": {
          "city": "Lyon",
          "country": "France"
        }
      },
      "desiredDate": "2024-02-16T00:00:00Z",
      "flexibleDates": true,
      "budget": {
        "max": 30,
        "currency": "EUR"
      },
      "createdAt": "2024-01-22T11:00:00Z",
      "proposalCount": 2
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### POST /api/requests
Créer une nouvelle demande d'envoi.

**Body:**
```json
{
  "item": {
    "type": "electronics",
    "description": "Ordinateur portable Dell XPS 13",
    "weight": 1.5,
    "dimensions": "30x20x2cm",
    "value": 1200,
    "photos": ["photo1_base64", "photo2_base64"]
  },
  "route": {
    "from": {
      "city": "Paris",
      "country": "France"
    },
    "to": {
      "city": "Lyon",
      "country": "France"
    }
  },
  "desiredDate": "2024-02-16T00:00:00Z",
  "flexibleDates": true,
  "budget": {
    "max": 50,
    "currency": "EUR"
  },
  "specialInstructions": "Fragile, à manipuler avec soin"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "req123",
    "message": "Demande créée avec succès"
  }
}
```

### GET /api/requests/:id
Obtenir les détails d'une demande.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "req123",
    "senderId": "uid456",
    "sender": {
      "id": "uid456",
      "displayName": "Marie Martin",
      "photoURL": "https://...",
      "rating": 4.9,
      "reviewCount": 15,
      "verificationStatus": {
        "email": true,
        "phone": true,
        "identity": true
      }
    },
    "status": "pending",
    "item": {
      "type": "electronics",
      "description": "Ordinateur portable Dell XPS 13",
      "weight": 1.5,
      "dimensions": "30x20x2cm",
      "value": 1200,
      "photos": [
        "https://storage.googleapis.com/voyengo/requests/req123/photo1.jpg",
        "https://storage.googleapis.com/voyengo/requests/req123/photo2.jpg"
      ]
    },
    "route": {
      "from": {
        "city": "Paris",
        "country": "France",
        "address": "10 rue de la Paix, 75002" // Visible seulement après match
      },
      "to": {
        "city": "Lyon",
        "country": "France",
        "address": "25 rue de la République, 69002" // Visible seulement après match
      }
    },
    "desiredDate": "2024-02-16T00:00:00Z",
    "flexibleDates": true,
    "budget": {
      "max": 50,
      "currency": "EUR"
    },
    "specialInstructions": "Fragile, à manipuler avec soin",
    "createdAt": "2024-01-22T11:00:00Z",
    "proposals": [
      {
        "id": "prop123",
        "offerId": "offer456",
        "travelerId": "uid789",
        "traveler": {
          "displayName": "Paul Durand",
          "photoURL": "https://...",
          "rating": 4.7
        },
        "proposedPrice": 45,
        "message": "Je peux prendre votre colis, voyage en voiture",
        "createdAt": "2024-01-22T15:00:00Z"
      }
    ]
  }
}
```

### POST /api/requests/:id/match
Matcher une demande avec une offre.

**Body:**
```json
{
  "offerId": "offer456",
  "agreedPrice": 45,
  "pickupDetails": {
    "address": "10 rue de la Paix, 75002 Paris",
    "date": "2024-02-15T09:00:00Z",
    "instructions": "Sonner à l'interphone 'Martin'"
  },
  "deliveryDetails": {
    "address": "25 rue de la République, 69002 Lyon",
    "date": "2024-02-15T18:00:00Z",
    "instructions": "Déposer chez le gardien"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "trans123",
    "message": "Match confirmé, transaction créée"
  }
}
```

## 💬 Messagerie

### GET /api/conversations
Lister les conversations de l'utilisateur.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv123",
      "type": "offer_inquiry", // ou "request_proposal", "transaction"
      "relatedId": "offer123", // ID de l'offre, demande ou transaction
      "participants": [
        {
          "id": "uid123",
          "displayName": "Jean Dupont",
          "photoURL": "https://..."
        },
        {
          "id": "uid456",
          "displayName": "Marie Martin",
          "photoURL": "https://..."
        }
      ],
      "lastMessage": {
        "id": "msg789",
        "content": "Bonjour, votre offre m'intéresse",
        "senderId": "uid456",
        "createdAt": "2024-01-23T10:30:00Z",
        "read": false
      },
      "unreadCount": 2,
      "createdAt": "2024-01-23T10:00:00Z",
      "updatedAt": "2024-01-23T10:30:00Z"
    }
  ]
}
```

### GET /api/conversations/:id/messages
Obtenir les messages d'une conversation.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| limit | number | Nombre de messages (défaut: 50) |
| before | string | ID du message pour pagination |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg123",
      "conversationId": "conv123",
      "senderId": "uid456",
      "sender": {
        "displayName": "Marie Martin",
        "photoURL": "https://..."
      },
      "content": "Bonjour, je suis intéressée par votre offre Paris-Lyon",
      "attachments": [],
      "read": true,
      "createdAt": "2024-01-23T10:00:00Z"
    },
    {
      "id": "msg124",
      "conversationId": "conv123",
      "senderId": "uid123",
      "sender": {
        "displayName": "Jean Dupont",
        "photoURL": "https://..."
      },
      "content": "Bonjour Marie, avec plaisir ! Quel type d'objet souhaitez-vous envoyer ?",
      "attachments": [],
      "read": true,
      "createdAt": "2024-01-23T10:05:00Z"
    }
  ],
  "meta": {
    "hasMore": true,
    "oldestMessageId": "msg100"
  }
}
```

### POST /api/conversations/:id/messages
Envoyer un message dans une conversation.

**Body:**
```json
{
  "content": "Voici une photo du colis",
  "attachments": ["https://storage.googleapis.com/voyengo/attachments/file1.jpg"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "msg125",
    "message": "Message envoyé"
  }
}
```

### PUT /api/messages/:id/read
Marquer un message comme lu.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Message marqué comme lu"
  }
}
```

## 💰 Transactions

### GET /api/transactions
Lister les transactions de l'utilisateur.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| role | string | "traveler" ou "sender" |
| status | string | pending, confirmed, in_transit, delivered, disputed |
| page | number | Page (défaut: 1) |
| limit | number | Résultats par page (défaut: 20) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "trans123",
      "offerId": "offer123",
      "requestId": "req123",
      "travelerId": "uid123",
      "traveler": {
        "displayName": "Jean Dupont",
        "photoURL": "https://..."
      },
      "senderId": "uid456",
      "sender": {
        "displayName": "Marie Martin",
        "photoURL": "https://..."
      },
      "status": "in_transit",
      "item": {
        "description": "Documents administratifs",
        "weight": 0.5
      },
      "route": {
        "from": "Paris",
        "to": "Lyon"
      },
      "amount": 15,
      "currency": "EUR",
      "timeline": {
        "confirmed": "2024-01-23T14:00:00Z",
        "pickedUp": "2024-02-15T09:30:00Z",
        "inTransit": "2024-02-15T10:00:00Z"
      },
      "estimatedDelivery": "2024-02-15T18:00:00Z",
      "trackingCode": "VYG-2024-0123",
      "createdAt": "2024-01-23T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}
```

### GET /api/transactions/:id
Obtenir les détails d'une transaction.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "trans123",
    "offerId": "offer123",
    "requestId": "req123",
    "travelerId": "uid123",
    "traveler": {
      "id": "uid123",
      "displayName": "Jean Dupont",
      "photoURL": "https://...",
      "phoneNumber": "+33612345678" // Visible après confirmation
    },
    "senderId": "uid456",
    "sender": {
      "id": "uid456",
      "displayName": "Marie Martin",
      "photoURL": "https://...",
      "phoneNumber": "+33687654321" // Visible après confirmation
    },
    "status": "in_transit",
    "item": {
      "type": "documents",
      "description": "Documents administratifs",
      "weight": 0.5,
      "photos": ["https://..."]
    },
    "route": {
      "from": {
        "city": "Paris",
        "address": "10 rue de la Paix, 75002",
        "instructions": "Sonner 'Martin'"
      },
      "to": {
        "city": "Lyon",
        "address": "25 rue de la République, 69002",
        "instructions": "Déposer chez le gardien"
      }
    },
    "amount": 15,
    "currency": "EUR",
    "paymentStatus": "pending",
    "timeline": {
      "created": "2024-01-23T14:00:00Z",
      "confirmed": "2024-01-23T14:30:00Z",
      "pickedUp": "2024-02-15T09:30:00Z",
      "inTransit": "2024-02-15T10:00:00Z"
    },
    "estimatedDelivery": "2024-02-15T18:00:00Z",
    "trackingCode": "VYG-2024-0123",
    "qrCode": "data:image/png;base64,...",
    "insurance": {
      "covered": true,
      "maxValue": 100,
      "terms": "https://voyengo.com/insurance-terms"
    }
  }
}
```

### PUT /api/transactions/:id/status
Mettre à jour le statut d'une transaction.

**Body:**
```json
{
  "status": "delivered",
  "proofOfDelivery": {
    "photos": ["photo1_base64", "photo2_base64"],
    "signature": "signature_base64",
    "notes": "Remis en main propre à Mme Martin"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Statut mis à jour",
    "notificationSent": true
  }
}
```

### POST /api/transactions/:id/dispute
Signaler un problème avec une transaction.

**Body:**
```json
{
  "reason": "item_not_delivered",
  "description": "Le colis n'a pas été livré à l'adresse convenue",
  "evidence": ["photo1_base64"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "disputeId": "disp123",
    "message": "Litige ouvert, notre équipe va examiner le cas"
  }
}
```

## ⭐ Avis et Évaluations

### GET /api/reviews
Obtenir les avis d'un utilisateur.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| userId | string | ID de l'utilisateur |
| role | string | "traveler" ou "sender" |
| page | number | Page (défaut: 1) |
| limit | number | Résultats par page (défaut: 20) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "rev123",
      "transactionId": "trans123",
      "reviewerId": "uid456",
      "reviewer": {
        "displayName": "Marie Martin",
        "photoURL": "https://..."
      },
      "reviewedId": "uid123",
      "role": "traveler",
      "rating": 5,
      "comment": "Très professionnel, colis livré en parfait état",
      "tags": ["punctual", "careful", "communicative"],
      "createdAt": "2024-02-16T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 23,
    "averageRating": 4.8
  }
}
```

### POST /api/reviews
Créer un avis après une transaction.

**Body:**
```json
{
  "transactionId": "trans123",
  "rating": 5,
  "comment": "