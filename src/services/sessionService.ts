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
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Session } from '../types';

const SESSIONS_COLLECTION = 'sessions';
const TRASH_COLLECTION = 'trash';

export async function getSessions(userId: string, householdId?: string, isPersonalTab: boolean = true): Promise<Session[]> {
  try {
    const mapDoc = (doc: any) => {
      const data = doc.data() as Record<string, any>;
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
    };

    if (householdId && isPersonalTab) {
      // Aggregate: Personal + Household
      const personalQuery = query(collection(db, SESSIONS_COLLECTION), where('userId', '==', userId));
      const householdQuery = query(collection(db, SESSIONS_COLLECTION), where('householdId', '==', householdId));
      
      const [personalSnap, householdSnap] = await Promise.all([getDocs(personalQuery), getDocs(householdQuery)]);
      
      const map = new Map<string, Session>();
      personalSnap.docs.forEach(doc => map.set(doc.id, mapDoc(doc)));
      householdSnap.docs.forEach(doc => map.set(doc.id, mapDoc(doc)));
      
      const sessions = Array.from(map.values());
      // Sort DESC by date
      sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sessions;
    } else {
      let q;
      if (householdId) {
        // strictly household
        q = query(collection(db, SESSIONS_COLLECTION), where('householdId', '==', householdId), orderBy('date', 'desc'));
      } else {
        // strictly personal
        q = query(collection(db, SESSIONS_COLLECTION), where('userId', '==', userId), orderBy('date', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(mapDoc);
    }
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index needed. Returning empty array.');
      return [];
    }
    throw error;
  }
}

export async function addSession(userId: string, sessionData: Omit<Session, 'id' | 'created_at'>, householdId?: string) {
  const dataToWrite: any = {
    ...sessionData,
    userId,
    created_at: Timestamp.now()
  };
  
  // Only add householdId if it exists (don't write null/undefined)
  if (householdId) {
    dataToWrite.householdId = householdId;
  }
  
  return await addDoc(collection(db, SESSIONS_COLLECTION), dataToWrite);
}

export async function updateSession(sessionId: string, sessionData: Partial<Session>) {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const { id, created_at, ...updateData } = sessionData as Partial<Session> & { created_at?: string };
  await updateDoc(sessionRef, updateData);
}

export async function deleteSession(sessionId: string) {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await deleteDoc(sessionRef);
}

export async function moveToTrash(sessionId: string, userId: string) {
  // Get the session data
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const sessionSnap = await getDoc(sessionRef);
  
  if (sessionSnap.exists()) {
    const sessionData = sessionSnap.data();
    
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
      const data = doc.data() as Record<string, any>;
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
