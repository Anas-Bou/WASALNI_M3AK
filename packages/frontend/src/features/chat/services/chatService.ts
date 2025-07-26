// src/features/chat/services/chatService.ts
import { db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'

export const createOrGetConversation = async (
  currentUserUid: string,
  otherUserUid: string,
  currentUserDisplayName: string | null,
  otherUserDisplayName: string | null
) => {
  // L'ID est toujours prévisible
  const conversationId = [currentUserUid, otherUserUid].sort().join('_')
  const conversationRef = doc(db, 'conversations', conversationId)

  // On essaie de lire le document. Si ça échoue (n'existe pas), on le crée.
  const docSnap = await getDoc(conversationRef);

  if (!docSnap.exists()) {
    // Le document n'existe pas, on le crée avec toutes les infos
    await setDoc(conversationRef, {
      participants: [currentUserUid, otherUserUid],
      participantInfo: {
        [currentUserUid]: { displayName: currentUserDisplayName },
        [otherUserUid]: { displayName: otherUserDisplayName }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  
  // On retourne l'ID dans tous les cas
  return conversationId
}