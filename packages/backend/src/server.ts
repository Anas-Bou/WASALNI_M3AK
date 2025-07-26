// packages/backend/src/server.ts

import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

// Crée une instance du serveur Fastify
const server = Fastify({
  logger: true, // Active les logs, très utiles pour le débogage
})

// Enregistre les plugins
// `register` est la méthode pour ajouter des fonctionnalités à Fastify
server.register(helmet)
server.register(cors, {
  origin: 'http://localhost:5173', // Important: Autorise uniquement notre frontend dev
})

// Création d'une première route de test
server.get('/api/health', async (request, reply) => {
  return { status: 'ok', message: 'VOYENGO API is running!' }
})

// Fonction pour démarrer le serveur
const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log(`✅ VOYENGO API is running at http://localhost:3001`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Lance le serveur
start()