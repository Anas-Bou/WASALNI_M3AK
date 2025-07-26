// src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { useAppSelector } from '@/hooks/reduxHooks'

interface Message {
  id: string
  text: string
  senderId: string
  createdAt: { seconds: number } | null
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Effet pour scroller vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Effet pour écouter les messages en temps réel
  useEffect(() => {
    if (!conversationId) return

    const messagesQuery = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('createdAt', 'asc')
    )

    // onSnapshot est la magie de Firestore pour le temps réel
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(fetchedMessages)
    })

    return () => unsubscribe() // Nettoyer l'écouteur
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
  if (newMessage.trim() === '' || !currentUser || !conversationId) return

  const text = newMessage
  setNewMessage('')

  // 1. Ajouter le nouveau message
  await addDoc(collection(db, `conversations/${conversationId}/messages`), {
    text: text,
    senderId: currentUser.uid,
    createdAt: serverTimestamp(),
  })

  // 2. Mettre à jour le document de la conversation parente
  const conversationRef = doc(db, 'conversations', conversationId)
  await updateDoc(conversationRef, {
    lastMessage: {
      text: text,
      senderId: currentUser.uid,
    },
    updatedAt: serverTimestamp(),
  })
  }

  if (!currentUser) return <p>Chargement...</p>

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Conversation</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input-field flex-1"
            placeholder="Écrivez votre message..."
          />
          <button type="submit" className="submit-button px-6">Envoyer</button>
        </form>
      </footer>
    </div>
  )
}