import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SavedCalculation, UserProfile, QuoteStatus } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore with specific databaseId as mandated by instructions
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types for Error Reporting
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or connecting. Check config.");
    }
    // We don't fail hard because test/connection might simply not exist yet
    return true;
  }
}
testConnection();

// Sign In With Gmail / Google Popup
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

// Sync User Profile to Firestore
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userDocRef);
    
    const nowIso = new Date().toISOString();
    const profileData: Record<string, any> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'KIDC User',
      photoURL: user.photoURL || '',
      lastLoginAt: nowIso
    };

    if (!existingSnap.exists()) {
      profileData.createdAt = nowIso;
    }

    await setDoc(userDocRef, profileData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save or Update Mortgage Calculation
export async function saveCalculation(calc: Omit<SavedCalculation, 'id'> & { id?: string }): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍ Gmail ກ່ອນບັນທຶກຂໍ້ມູນ (Please sign in with Gmail first)');
  }

  const id = calc.id || `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `calculations/${id}`;

  try {
    const docRef = doc(db, 'calculations', id);
    const nowIso = new Date().toISOString();

    const dataToSave: Record<string, any> = {
      id,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || '',
      customerName: calc.customerName || 'ລູກຄ້າທົ່ວໄປ',
      projectName: calc.projectName || 'ໂຄງການ KIDC Real Estate',
      agentPhone: calc.agentPhone || '020 9966 3414',
      currency: calc.currency,
      propertyPrice: Number(calc.propertyPrice),
      downMode: calc.downMode,
      downPercent: Number(calc.downPercent),
      downAmount: Number(calc.downAmount),
      principal: Number(calc.principal),
      annualRate: Number(calc.annualRate),
      termUnit: calc.termUnit,
      termValue: Number(calc.termValue),
      totalMonths: Number(calc.totalMonths),
      method: calc.method,
      monthlyPayment: Number(calc.monthlyPayment),
      totalInterest: Number(calc.totalInterest),
      totalPayment: Number(calc.totalPayment),
      status: calc.status || 'draft',
      notes: calc.notes || '',
      updatedAt: nowIso,
      updatedAtServer: serverTimestamp()
    };

    if (!calc.id) {
      dataToSave.createdAt = nowIso;
      dataToSave.createdAtServer = serverTimestamp();
    }

    await setDoc(docRef, dataToSave, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update Status of Calculation
export async function updateCalculationStatus(id: string, status: QuoteStatus): Promise<void> {
  const path = `calculations/${id}`;
  try {
    const docRef = doc(db, 'calculations', id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
      updatedAtServer: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete Calculation
export async function deleteCalculation(id: string): Promise<void> {
  const path = `calculations/${id}`;
  try {
    const docRef = doc(db, 'calculations', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to User's Saved Calculations (Realtime sync)
export function subscribeUserCalculations(
  userId: string,
  onData: (data: SavedCalculation[]) => void,
  onError?: (error: Error) => void
) {
  const path = 'calculations';
  const q = query(collection(db, 'calculations'), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedCalculation[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: d.id || docSnap.id,
          userId: d.userId,
          userEmail: d.userEmail,
          customerName: d.customerName,
          projectName: d.projectName,
          agentPhone: d.agentPhone,
          currency: d.currency,
          propertyPrice: d.propertyPrice,
          downMode: d.downMode,
          downPercent: d.downPercent,
          downAmount: d.downAmount,
          principal: d.principal,
          annualRate: d.annualRate,
          termUnit: d.termUnit,
          termValue: d.termValue,
          totalMonths: d.totalMonths,
          method: d.method,
          monthlyPayment: d.monthlyPayment,
          totalInterest: d.totalInterest,
          totalPayment: d.totalPayment,
          status: d.status || 'draft',
          notes: d.notes || '',
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        });
      });

      // Sort by updatedAt or createdAt desc
      items.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      onData(items);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
