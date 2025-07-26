// src/pages/MessagesListPage.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { useAppSelector } from '@/hooks/reduxHooks'
import { UserCircleIcon } from '@heroicons/react/24/solid'

interface Conversation {
  id: string
  participantInfo: {
    [key: string]: { displayName: string | null }
  }
  lastMessage?: {
    text: string
    senderId: string
  }
  updatedAt: { seconds: number }
}

export default function MessagesListPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(conversationsQuery, (querySnapshot) => {
      const convosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[]
      setConversations(convosData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  if (loading) {
    return <p className="p-4 text-center">Chargement des conversations...</p>
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 px-4">Mes Messages</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {conversations.length > 0 ? (
            conversations.map(convo => {
              // Trouver l'autre participant
              const otherParticipantUid = convo.id.replace(currentUser!.uid, '').replace('_', '')
              const otherParticipantInfo = convo.participantInfo[otherParticipantUid]

              return (
                <li key={convo.id}>
                  <Link to={`/messages/${convo.id}`} className="block hover:bg-gray-50">
                    <div className="p-4 flex items-center space-x-4">
                      <UserCircleIcon className="h-12 w-12 text-gray-300" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{otherParticipantInfo?.displayName || 'Utilisateur'}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {convo.lastMessage ? (
                            <>
                              <span className="font-medium">{convo.lastMessage.senderId === currentUser!.uid ? 'Vous: ' : ''}</span>
                              {convo.lastMessage.text}
                            </>
                          ) : (
                            'Aucun message'
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })
          ) : (
            <p className="p-10 text-center text-gray-500">Vous n'avez aucune conversation.</p>
          )}
        </ul>
      </div>
    </div>
  )
}