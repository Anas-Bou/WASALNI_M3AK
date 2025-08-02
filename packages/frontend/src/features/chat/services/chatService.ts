// src/features/chat/services/chatService.ts
import { db, auth } from '@/lib/firebase' // <-- Importer auth
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export const createOrGetConversation = async (
  // On n'a plus besoin des noms, on les récupère directement ici
  otherUserUid: string,
  otherUserDisplayName: string | null
) => {
  // On s'assure que l'utilisateur actuel est bien défini
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Utilisateur non authentifié.");
  }
  
  const currentUserUid = currentUser.uid;
  const currentUserDisplayName = currentUser.displayName;

  const conversationId = [currentUserUid, otherUserUid].sort().join('_')
  const conversationRef = doc(db, 'conversations', conversationId)

  // On écrit directement. { merge: true } gère la création et la mise à jour.
  await setDoc(conversationRef, {
    participants: [currentUserUid, otherUserUid],
    participantInfo: {
      [currentUserUid]: { displayName: currentUserDisplayName || 'Utilisateur' },
      [otherUserUid]: { displayName: otherUserDisplayName || 'Utilisateur' }
    },
    // On ne met à jour 'createdAt' que si le document est nouveau
    // Firestore ne permet pas ça directement, donc on va le simplifier pour l'instant
    // createdAt: serverTimestamp(), // On le retire temporairement pour simplifier
    updatedAt: serverTimestamp(),
  }, { merge: true })
  
  return conversationId
}