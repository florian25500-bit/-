import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { AssessmentResult } from '../types';

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
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot
(async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or connecting...');
    }
  }
})();

// Google Provider setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Auth Functions
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string, displayName?: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
}

export async function loginAsGuest() {
  return await signInAnonymously(auth);
}

export async function logOut() {
  return await signOut(auth);
}

export { onAuthStateChanged, type FirebaseUser };

// Database Operations
export async function syncUserProfile(user: FirebaseUser) {
  const userPath = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);
    const now = new Date().toISOString();
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || (user.isAnonymous ? 'guest@deutschschreiben.local' : ''),
        displayName: user.displayName || (user.isAnonymous ? 'ผู้เรียนทั่วไป (Guest)' : 'ผู้เรียนภาษาเยอรมัน'),
        photoURL: user.photoURL || '',
        createdAt: now,
        lastLoginAt: now,
      });
    } else {
      await setDoc(
        userDocRef,
        {
          lastLoginAt: now,
          displayName: user.displayName || existing.data()?.displayName || 'ผู้เรียนภาษาเยอรมัน',
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
}

export async function saveUserSubmission(userId: string, submission: AssessmentResult): Promise<void> {
  const docPath = `users/${userId}/submissions/${submission.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'submissions', submission.id);
    await setDoc(docRef, {
      ...submission,
      userId,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function getUserSubmissions(userId: string): Promise<AssessmentResult[]> {
  const colPath = `users/${userId}/submissions`;
  try {
    const colRef = collection(db, 'users', userId, 'submissions');
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const list: AssessmentResult[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as AssessmentResult);
    });
    return list;
  } catch (err) {
    // If index or query issue occurs, fallback to un-ordered fetch
    try {
      const colRef = collection(db, 'users', userId, 'submissions');
      const snapshot = await getDocs(colRef);
      const list: AssessmentResult[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AssessmentResult);
      });
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.LIST, colPath);
    }
  }
}

export interface StoredVocabularyItem {
  id: string;
  userId: string;
  word: string;
  meaning_th: string;
  part_of_speech?: string;
  article?: string;
  example_sentence?: string;
  example_translation_th?: string;
  cefr_level: string;
  created_at: string;
}

export async function saveUserVocabulary(userId: string, item: StoredVocabularyItem): Promise<void> {
  const docPath = `users/${userId}/vocabulary/${item.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'vocabulary', item.id);
    await setDoc(docRef, item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function getUserVocabulary(userId: string): Promise<StoredVocabularyItem[]> {
  const colPath = `users/${userId}/vocabulary`;
  try {
    const colRef = collection(db, 'users', userId, 'vocabulary');
    const snapshot = await getDocs(colRef);
    const list: StoredVocabularyItem[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as StoredVocabularyItem);
    });
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, colPath);
  }
}

export async function deleteUserVocabulary(userId: string, vocabId: string): Promise<void> {
  const docPath = `users/${userId}/vocabulary/${vocabId}`;
  try {
    const docRef = doc(db, 'users', userId, 'vocabulary', vocabId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}
