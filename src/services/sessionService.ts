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

export async function getSessions(userId: string): Promise<Session[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
  })) as Session[];
}

export async function addSession(userId: string, sessionData: Omit<Session, 'id' | 'created_at'>) {
  return await addDoc(collection(db, SESSIONS_COLLECTION), {
    ...sessionData,
    userId,
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
