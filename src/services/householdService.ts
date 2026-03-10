import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  getDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Household, UserProfile } from '../types';

const HOUSEHOLDS_COLLECTION = 'households';
const USERS_COLLECTION = 'users';

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createUserProfile(userId: string, email: string, displayName: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email,
        displayName,
        createdAt: Timestamp.now().toDate().toISOString()
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Don't throw - allow app to continue even if profile creation fails
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function createHousehold(userId: string, name: string): Promise<string> {
  const inviteCode = generateInviteCode();
  
  const householdRef = await addDoc(collection(db, HOUSEHOLDS_COLLECTION), {
    name,
    createdBy: userId,
    createdAt: Timestamp.now().toDate().toISOString(),
    members: [userId],
    inviteCode
  });
  
  // Update user profile with household ID
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    householdId: householdRef.id
  });
  
  return householdRef.id;
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  const householdRef = doc(db, HOUSEHOLDS_COLLECTION, householdId);
  const householdDoc = await getDoc(householdRef);
  
  if (!householdDoc.exists()) {
    return null;
  }
  
  return {
    id: householdDoc.id,
    ...householdDoc.data()
  } as Household;
}

export async function joinHouseholdByCode(userId: string, inviteCode: string): Promise<string> {
  const q = query(
    collection(db, HOUSEHOLDS_COLLECTION),
    where('inviteCode', '==', inviteCode.toUpperCase())
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('Invalid invite code');
  }
  
  const householdDoc = snapshot.docs[0];
  const householdRef = doc(db, HOUSEHOLDS_COLLECTION, householdDoc.id);
  
  // Add user to household members
  await updateDoc(householdRef, {
    members: arrayUnion(userId)
  });
  
  // Update user profile with household ID
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    householdId: householdDoc.id
  });
  
  return householdDoc.id;
}

export async function leaveHousehold(userId: string, householdId: string): Promise<void> {
  const householdRef = doc(db, HOUSEHOLDS_COLLECTION, householdId);
  
  // Remove user from household members
  await updateDoc(householdRef, {
    members: arrayRemove(userId)
  });
  
  // Remove household ID from user profile
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    householdId: null
  });
  
  // Check if household is empty and delete if so
  const householdDoc = await getDoc(householdRef);
  if (householdDoc.exists()) {
    const household = householdDoc.data() as Household;
    if (household.members.length === 0) {
      await deleteDoc(householdRef);
    }
  }
}

export async function importPersonalSessionsToHousehold(userId: string, householdId: string): Promise<number> {
  // Get all personal sessions (sessions without householdId or with null householdId)
  const sessionsRef = collection(db, 'sessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  let importedCount = 0;
  
  // Update each personal session to belong to the household
  const updatePromises = snapshot.docs.map(async (docSnapshot) => {
    const sessionData = docSnapshot.data();
    // Only import if session doesn't already have a householdId
    if (!sessionData.householdId) {
      const sessionRef = doc(db, 'sessions', docSnapshot.id);
      await updateDoc(sessionRef, {
        householdId: householdId
      });
      importedCount++;
    }
  });
  
  await Promise.all(updatePromises);
  return importedCount;
}

export async function getHouseholdMembers(householdId: string): Promise<UserProfile[]> {
  const household = await getHousehold(householdId);
  if (!household) {
    return [];
  }
  
  const members: UserProfile[] = [];
  for (const memberId of household.members) {
    const profile = await getUserProfile(memberId);
    if (profile) {
      members.push(profile);
    }
  }
  
  return members;
}
