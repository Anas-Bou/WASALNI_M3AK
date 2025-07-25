# VOYENGO - Roadmap d'Implémentation Technique

## 🚀 Phase 0: Initialisation & Configuration (Semaine 1)

### Jour 1-2: Setup Initial
```bash
# Structure du monorepo
voyengo/
├── packages/
│   ├── frontend/
│   ├── backend/
│   └── shared/
├── pnpm-workspace.yaml
├── .gitignore
├── .env.example
└── README.md
```

**Tasks:**
- [ ] Initialiser le monorepo avec pnpm
- [ ] Configurer TypeScript pour chaque package
- [ ] Setup ESLint + Prettier avec configuration partagée
- [ ] Créer les scripts npm/pnpm de base
- [ ] Configurer Git hooks avec Husky

### Jour 3-4: Frontend Setup (Vite + React)
```bash
cd packages/frontend
pnpm create vite . --template react-ts
pnpm add @reduxjs/toolkit react-redux react-router-dom
pnpm add tailwindcss @headlessui/react heroicons
pnpm add react-hook-form zod @hookform/resolvers
pnpm add -D @types/react @types/react-dom
```

**Configuration Tailwind:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
```

### Jour 5: Backend Setup (Fastify + TypeScript)
```bash
cd packages/backend
pnpm init
pnpm add fastify @fastify/cors @fastify/helmet @fastify/rate-limit
pnpm add firebase-admin zod
pnpm add -D typescript @types/node tsx nodemon
```

**Structure Backend:**
```typescript
// src/server.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { initializeApp, cert } from 'firebase-admin/app'

const server = Fastify({ logger: true })

// Plugins
await server.register(cors, { origin: process.env.FRONTEND_URL })

// Firebase Admin Init
initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
})

// Routes
server.register(authRoutes, { prefix: '/api/auth' })
server.register(userRoutes, { prefix: '/api/users' })
```

## 📱 Phase 1: Authentification & Profils (Semaine 2-3)

### Frontend: Auth Module
```typescript
// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginCredentials) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const token = await userCredential.user.getIdToken()
    return { user: userCredential.user, token }
  }
)
```

### Backend: Auth Routes
```typescript
// src/modules/auth/auth.routes.ts
export async function authRoutes(server: FastifyInstance) {
  // Verify Firebase Token Middleware
  server.addHook('onRequest', async (request, reply) => {
    try {
      const token = request.headers.authorization?.split('Bearer ')[1]
      if (!token) throw new Error('No token')
      
      const decodedToken = await admin.auth().verifyIdToken(token)
      request.user = decodedToken
    } catch (error) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  // Get current user
  server.get('/me', async (request) => {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(request.user.uid)
      .get()
    
    return userDoc.data()
  })
}
```

### Components Auth
```typescript
// src/components/auth/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères')
})

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })
  
  const dispatch = useAppDispatch()
  
  const onSubmit = (data: LoginData) => {
    dispatch(login(data))
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('email')}
        type="email"
        label="Email"
        error={errors.email?.message}
      />
      <Input
        {...register('password')}
        type="password"
        label="Mot de passe"
        error={errors.password?.message}
      />
      <Button type="submit" fullWidth>
        Se connecter
      </Button>
    </form>
  )
}
```

## ✈️ Phase 2: Offres de Voyage (Semaine 4-5)

### Data Model & Validation
```typescript
// packages/shared/types/offer.ts
export const offerSchema = z.object({
  route: z.object({
    from: locationSchema,
    to: locationSchema
  }),
  travelDate: z.date(),
  returnDate: z.date().optional(),
  availableSpace: z.object({
    weight: z.number().min(0.5).max(30),
    dimensions: z.string().optional()
  }),
  acceptedItems: z.array(z.enum(['documents', 'electronics', 'clothing', 'food', 'other'])),
  pricing: z.object({
    basePrice: z.number().min(0),
    pricePerKg: z.number().min(0),
    currency: z.string().default('EUR')
  })
})
```

### Frontend: Offer Creation
```typescript
// src/features/offers/CreateOfferPage.tsx
export function CreateOfferPage() {
  const [step, setStep] = useState(1)
  
  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator currentStep={step} totalSteps={4} />
      
      {step === 1 && <RouteStep onNext={(data) => {
        setFormData(prev => ({ ...prev, ...data }))
        setStep(2)
      }} />}
      
      {step === 2 && <TravelDetailsStep />}
      {step === 3 && <ItemPreferencesStep />}
      {step === 4 && <PricingStep onSubmit={handleSubmit} />}
    </div>
  )
}
```

### Backend: Offers CRUD
```typescript
// src/modules/offers/offers.service.ts
export class OffersService {
  async createOffer(userId: string, data: CreateOfferDto) {
    const offer = {
      ...data,
      userId,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }
    
    const docRef = await db.collection('offers').add(offer)
    
    // Index for search
    await this.indexOfferForSearch(docRef.id, offer)
    
    return { id: docRef.id, ...offer }
  }
  
  async searchOffers(filters: SearchFilters) {
    let query = db.collection('offers').where('status', '==', 'active')
    
    if (filters.from) {
      query = query.where('route.from.city', '==', filters.from)
    }
    
    if (filters.to) {
      query = query.where('route.to.city', '==', filters.to)
    }
    
    if (filters.date) {
      const startOfDay = new Date(filters.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filters.date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .where('travelDate', '>=', startOfDay)
        .where('travelDate', '<=', endOfDay)
    }
    
    const snapshot = await query.limit(20).get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
}
```

## 📦 Phase 3: Demandes d'Envoi & Matching (Semaine 6-7)

### Algorithme de Matching
```typescript
// src/modules/matching/matching.service.ts
export class MatchingService {
  async findMatchingOffers(request: ShippingRequest): Promise<MatchedOffer[]> {
    // 1. Recherche basique par route
    const baseMatches = await db.collection('offers')
      .where('status', '==', 'active')
      .where('route.from.city', '==', request.route.from.city)
      .where('route.to.city', '==', request.route.to.city)
      .get()
    
    // 2. Filtrage et scoring
    const scoredMatches = baseMatches.docs
      .map(doc => {
        const offer = doc.data() as TravelOffer
        const score = this.calculateMatchScore(offer, request)
        return { offer: { id: doc.id, ...offer }, score }
      })
      .filter(match => match.score > 0.5)
      .sort((a, b) => b.score - a.score)
    
    return scoredMatches.slice(0, 10)
  }
  
  private calculateMatchScore(offer: TravelOffer, request: ShippingRequest): number {
    let score = 1.0
    
    // Date compatibility
    const dateDiff = Math.abs(
      offer.travelDate.toDate().getTime() - request.desiredDate.toDate().getTime()
    )
    const daysDiff = dateDiff / (1000 * 60 * 60 * 24)
    
    if (daysDiff > 7 && !request.flexibleDates) score *= 0.3
    else if (daysDiff <= 3) score *= 1.2
    
    // Weight compatibility
    if (offer.availableSpace.weight < request.item.weight) return 0
    
    // Item type compatibility
    if (!offer.acceptedItems.includes(request.item.type)) score *= 0.5
    
    // Price compatibility
    const estimatedPrice = offer.pricing.basePrice + 
      (request.item.weight * offer.pricing.pricePerKg)
    
    if (estimatedPrice > request.budget.max) score *= 0.7
    
    return Math.min(score, 1.0)
  }
}
```

### UI Matching
```typescript
// src/features/requests/MatchingResults.tsx
export function MatchingResults({ requestId }: Props) {
  const { data: matches, isLoading } = useGetMatchesQuery(requestId)
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Voyageurs disponibles ({matches?.length || 0})
      </h2>
      
      {matches?.map(match => (
        <MatchCard
          key={match.offer.id}
          offer={match.offer}
          score={match.score}
          onSelect={() => handleSelectOffer(match.offer.id)}
        />
      ))}
    </div>
  )
}
```

## 💬 Phase 4: Messagerie (Semaine 8)

### Real-time avec Firestore
```typescript
// src/features/messages/useMessages.ts
export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  
  useEffect(() => {
    const unsubscribe = db
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[]
        
        setMessages(newMessages)
      })
    
    return unsubscribe
  }, [conversationId])
  
  return messages
}
```

### Chat Component
```typescript
// src/features/messages/ChatBox.tsx
export function ChatBox({ conversationId }: Props) {
  const messages = useMessages(conversationId)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(scrollToBottom, [messages])
  
  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    await db.collection('messages').add({
      conversationId,
      senderId: currentUser.id,
      content: newMessage,
      createdAt: serverTimestamp()
    })
    
    setNewMessage('')
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage() }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2"
              placeholder="Tapez votre message..."
            />
            <button
              type="submit"
              className="bg-primary-500 text-white rounded-lg px-4 py-2"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

## 🛡️ Phase 5: Admin Dashboard (Semaine 9)

### Analytics Service
```typescript
// src/modules/admin/analytics.service.ts
export class AnalyticsService {
  async getStats(): Promise<DashboardStats> {
    const [users, offers, requests, transactions] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('offers').count().get(),
      db.collection('requests').count().get(),
      db.collection('transactions').count().get()
    ])
    
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    
    const recentTransactions = await db
      .collection('transactions')
      .where('createdAt', '>=', last30Days)
      .get()
    
    const revenue = recentTransactions.docs.reduce((sum, doc) => {
      return sum + doc.data().amount
    }, 0)
    
    return {
      totalUsers: users.data().count,
      totalOffers: offers.data().count,
      totalRequests: requests.data().count,
      totalTransactions: transactions.data().count,
      monthlyRevenue: revenue,
      growthRate: this.calculateGrowthRate()
    }
  }
}
```

### Admin UI avec Recharts
```typescript
// src/features/admin/Dashboard.tsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie } from 'recharts'

export function AdminDashboard() {
  const { data: stats } = useGetStatsQuery()
  const { data: userGrowth } = useGetUserGrowthQuery()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats Cards */}
      <StatCard
        title="Utilisateurs"
        value={stats?.totalUsers}
        change="+12%"
        icon={UsersIcon}
      />
      
      {/* Charts */}
      <div className="col-span-full lg:col-span-2">
        <Card>
          <CardHeader>Croissance des utilisateurs</CardHeader>
          <CardBody>
            <LineChart data={userGrowth}>
              <Line type="monotone" dataKey="users" stroke="#3B82F6" />
            </LineChart>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
```

## 📁 Phase 6: Upload & Storage (Semaine 10)

### Firebase Storage Integration
```typescript
// src/utils/storage.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path)
  
  const uploadTask = uploadBytesResumable(storageRef, file)
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(downloadURL)
      }
    )
  })
}
```

### Upload Component
```typescript
// src/components/FileUpload.tsx
export function FileUpload({ onUpload, accept, maxSize = 5 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Le fichier ne doit pas dépasser ${maxSize}MB`)
      return
    }
    
    setUploading(true)
    
    try {
      const path = `uploads/${auth.currentUser?.uid}/${Date.now()}_${file.name}`
      const url = await uploadFile(file, path, setProgress)
      
      onUpload(url)
      toast.success('Fichier uploadé avec succès')
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }
  
  return (
    <Dropzone onDrop={handleDrop} accept={accept}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div>
              <div className="mb-2">Upload en cours...</div>
              <ProgressBar value={progress} />
            </div>
          ) : (
            <div>
              <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">
                Glissez un fichier ici ou cliquez pour sélectionner
              </p>
            </div>
          )}
        </div>
      )}
    </Dropzone>
  )
}
```

## 🚀 Phase 7: Déploiement (Semaine 11)

### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      
      - run: pnpm install
      - run: pnpm --filter frontend build
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./packages/frontend/dist

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      
      - run: pnpm install
      - run: pnpm --filter backend build
      
      - uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### Configuration Production

**Frontend (Vercel):**
```json
// vercel.json
{
  "buildCommand": "pnpm --filter frontend build",
  "outputDirectory": "packages/frontend/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Backend (Render):**
```yaml
# render.yaml
services:
  - type: web
    name: voyengo-api
    env: node
    buildCommand: pnpm install && pnpm --filter backend build
    startCommand: pnpm --filter backend start
    envVars:
      - key: NODE_ENV
        value: production
      - key: FIREBASE_SERVICE_ACCOUNT
        sync: false
```

## 🔒 Phase 8: Sécurité & Optimisations (Semaine 12)

### Security Headers
```typescript
// Backend security
server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:"],
    }
  }
})

// Rate limiting
server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
})
```

### Performance Optimizations
```typescript
// Frontend lazy loading
const AdminDashboard = lazy(() => import('./features/admin/Dashboard'))

// Image optimization
import { LazyLoadImage } from 'react-lazy-load-image-component'

// Query optimization with RTK Query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    }
  }),
  tagTypes: ['User', 'Offer', 'Request'],
  endpoints: (builder) => ({
    // Cached queries with tags
    getOffers: builder.query({
      query: (filters) => ({ url: 'offers', params: filters }),
      providesTags: ['Offer']
    })
  })
})
```

## 📊 Métriques de Succès

### KPIs à Suivre
1. **Acquisition**: Nouveaux utilisateurs/jour
2. **Activation**: % qui créent une offre/demande
3. **Rétention**: Utilisateurs actifs mensuels
4. **Revenue**: Transactions complétées/mois
5. **Performance**: Core Web Vitals < 100ms

### Monitoring Setup
```typescript
// Sentry integration
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1
})
```

## 🎯 Checklist Finale

### Avant le lancement
- [ ] Tests E2E complets
- [ ] Audit de sécurité
- [ ] Optimisation des images
- [ ] Documentation API
- [ ] Terms of Service & Privacy Policy
- [ ] Support multi-langue (i18n)
- [ ] Analytics configurés
- [ ] Backup strategy
- [ ] Monitoring alerts
- [ ] Load testing

### Post-lancement
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] A/B testing setup
- [ ] SEO optimization
- [ ] Social media integration
- [ ] Push notifications
- [ ] Referral program
- [ ] Mobile app planning