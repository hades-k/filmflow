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
