// packages/backend/src/modules/admin/admin.routes.ts
import type { FastifyInstance } from 'fastify'
import { adminAuth } from '../../config/firebaseAdmin' // <-- Importer notre instance initialisée

export async function adminRoutes(server: FastifyInstance) {
  server.post('/set-admin-role', async (request, reply) => {
    const { email } = request.body as { email: string }

    if (!email) {
      return reply.code(400).send({ error: 'Email is required' })
    }

    try {
      // On utilise directement notre instance `adminAuth`
      const user = await adminAuth.getUserByEmail(email)
      await adminAuth.setCustomUserClaims(user.uid, { admin: true })

      reply.send({ message: `Successfully set admin role for ${email}` })
    } catch (error: any) {
      console.error('Error setting admin role:', error)
      reply.code(500).send({ error: error.message })
    }
  })
}