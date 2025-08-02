// packages/shared/types/offer.ts
import { z } from 'zod'

// Schéma pour une localisation
const locationSchema = z.object({
  city: z.string().min(1, 'La ville est requise'),
  country: z.string().min(1, 'Le pays est requis'),
  // plus tard on ajoutera les coordonnées GeoPoint
})

// Schéma principal pour une offre de voyage
export const travelOfferSchema = z.object({
  // userId: z.string(), // Sera ajouté côté serveur
  // status: z.enum(['active', 'completed', 'cancelled']), // Sera géré par le serveur
  
  route: z.object({
    from: locationSchema,
    to: locationSchema,
  }),

  travelDate: z.union([z.string(), z.date()]).refine(val => !isNaN(Date.parse(val.toString())), {
    message: "Date de voyage invalide",
  }),
  
  availableSpace: z.object({
    weight: z.number().min(0.5, 'Le poids doit être d\'au moins 0.5 kg').max(100),
  }),
  
  pricing: z.object({
    pricePerKg: z.number().min(0, 'Le prix doit être positif'),
    currency: z.string(), // On enlève .default('EUR') pour que ce soit toujours requis
  }),

  description: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional(),
})

// Type TypeScript généré à partir du schéma Zod
export type TravelOffer = z.infer<typeof travelOfferSchema>