import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Session } from '../types';

const SESSIONS_COLLECTION = 'sessions';
const TRASH_COLLECTION = 'trash';

export async function getSessions(userId: string, householdId?: string): Promise<Session[]> {
  try {
    let q;
    
    if (householdId) {
      // Get all sessions for the household
      q = query(
        collection(db, SESSIONS_COLLECTION),
        where('householdId', '==', householdId),
        orderBy('date', 'desc')
      );
    } else {
      // Get only user's personal sessions (and sessions without householdId)
      q = query(
        collection(db, SESSIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        date: data.date,
        duration_seconds: data.duration_seconds,
        title: data.title,
        rating: data.rating,
        genre: data.genre,
        release_year: data.release_year,
        userId: data.userId,
        householdId: data.householdId,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Session;
    });
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    // If it's an index error, return empty array for now
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index needed. Returning empty array.');
      return [];
    }
    throw error;
  }
}

export async function addSession(userId: string, sessionData: Omit<Session, 'id' | 'created_at'>, householdId?: string) {
  return await addDoc(collection(db, SESSIONS_COLLECTION), {
    ...sessionData,
    userId,
    householdId: householdId || null,
    created_at: Timestamp.now()
  });
}

export async function updateSession(sessionId: string, sessionData: Partial<Session>) {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const { id, created_at, ...updateData } = sessionData as any;
  await updateDoc(sessionRef, updateData);
}

export async function deleteSession(sessionId: string) {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await deleteDoc(sessionRef);
}

export async function moveToTrash(sessionId: string, userId: string) {
  // Get the session data
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const sessionSnap = await getDocs(query(collection(db, SESSIONS_COLLECTION), where('__name__', '==', sessionId)));
  
  if (!sessionSnap.empty) {
    const sessionData = sessionSnap.docs[0].data();
    
    // Add to trash collection with deletion timestamp
    await addDoc(collection(db, TRASH_COLLECTION), {
      ...sessionData,
      originalId: sessionId,
      deletedAt: Timestamp.now(),
      deletedBy: userId
    });
    
    // Delete from sessions
    await deleteDoc(sessionRef);
  }
}

export async function getTrashSessions(userId: string, householdId?: string): Promise<(Session & { deletedAt: string; originalId: string })[]> {
  try {
    let q;
    
    if (householdId) {
      q = query(
        collection(db, TRASH_COLLECTION),
        where('householdId', '==', householdId),
        orderBy('deletedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, TRASH_COLLECTION),
        where('userId', '==', userId),
        orderBy('deletedAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        originalId: data.originalId,
        date: data.date,
        duration_seconds: data.duration_seconds,
        title: data.title,
        rating: data.rating,
        genre: data.genre,
        release_year: data.release_year,
        userId: data.userId,
        householdId: data.householdId,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        deletedAt: data.deletedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
  } catch (error: any) {
    console.error('Error fetching trash sessions:', error);
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index needed. Returning empty array.');
      return [];
    }
    throw error;
  }
}

export async function restoreFromTrash(trashId: string, originalData: any) {
  // Add back to sessions collection
  const { id, originalId, deletedAt, deletedBy, ...sessionData } = originalData;
  await addDoc(collection(db, SESSIONS_COLLECTION), sessionData);
  
  // Remove from trash
  const trashRef = doc(db, TRASH_COLLECTION, trashId);
  await deleteDoc(trashRef);
}

export async function permanentlyDelete(trashId: string) {
  const trashRef = doc(db, TRASH_COLLECTION, trashId);
  await deleteDoc(trashRef);
}
