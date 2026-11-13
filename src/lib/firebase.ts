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

export interface AppUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
  isLocal?: boolean;
}

const LOCAL_USER_KEY = 'deutschschreiben_local_user';

export function getLocalUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalUser(user: AppUser): void {
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Could not save local user:', e);
  }
}

export function clearLocalUser(): void {
  try {
    localStorage.removeItem(LOCAL_USER_KEY);
  } catch (e) {
    console.warn('Could not clear local user:', e);
  }
}

export function createInstantProfile(displayName: string, email?: string): AppUser {
  const newUser: AppUser = {
    uid: `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    displayName: displayName.trim() || 'ผู้เรียนภาษาเยอรมัน',
    email: email?.trim() || `${displayName.trim().toLowerCase().replace(/\s+/g, '.') || 'learner'}@deutschschreiben.local`,
    isAnonymous: false,
    isLocal: true,
  };
  saveLocalUser(newUser);
  return newUser;
}

export async function loginAsGuest(): Promise<AppUser> {
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase anonymous auth unavailable, using persistent local guest profile:', err);
    const guestUser: AppUser = {
      uid: `guest-${Date.now().toString(36)}`,
      displayName: 'ผู้เรียนทั่วไป (Guest)',
      email: 'guest@deutschschreiben.local',
      isAnonymous: true,
      isLocal: true,
    };
    saveLocalUser(guestUser);
    return guestUser;
  }
}

export async function logOut() {
  clearLocalUser();
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase signout warning:', e);
  }
}

export { onAuthStateChanged, type FirebaseUser };

// Database Operations
export async function syncUserProfile(user: AppUser | FirebaseUser) {
  saveLocalUser({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  });

  if ((user as AppUser).isLocal) return;

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
    console.warn('Firestore sync profile skipped (offline or unauthorized):', err);
  }
}

export async function saveUserSubmission(userId: string, submission: AssessmentResult): Promise<void> {
  // Always save locally first so user never loses their assessment
  try {
    const key = `deutschschreiben_subs_${userId}`;
    const raw = localStorage.getItem(key);
    const existing: AssessmentResult[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((s) => s.id !== submission.id);
    localStorage.setItem(key, JSON.stringify([submission, ...filtered]));
  } catch (localErr) {
    console.warn('Local submission save error:', localErr);
  }

  // Attempt Firestore write only if user is logged into Firebase Auth
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const docRef = doc(db, 'users', userId, 'submissions', submission.id);
      await setDoc(docRef, {
        ...submission,
        userId,
        savedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore submission save skipped (relying on local storage):', err);
    }
  }
}

export async function getUserSubmissions(userId: string): Promise<AssessmentResult[]> {
  // Read local submissions
  let localSubs: AssessmentResult[] = [];
  try {
    const raw = localStorage.getItem(`deutschschreiben_subs_${userId}`);
    if (raw) localSubs = JSON.parse(raw);
  } catch {
    localSubs = [];
  }

  // Try Firestore fetch only if user is logged into Firebase Auth
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const colRef = collection(db, 'users', userId, 'submissions');
      const snapshot = await getDocs(colRef);
      const remoteSubs: AssessmentResult[] = [];
      snapshot.forEach((d) => {
        remoteSubs.push(d.data() as AssessmentResult);
      });

      if (remoteSubs.length > 0) {
        const ids = new Set(remoteSubs.map((s) => s.id));
        const combined = [...remoteSubs, ...localSubs.filter((s) => !ids.has(s.id))];
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return combined;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, returning local submissions:', err);
    }
  }

  return localSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
  try {
    const key = `deutschschreiben_vocab_${userId}`;
    const raw = localStorage.getItem(key);
    const existing: StoredVocabularyItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((v) => v.id !== item.id);
    localStorage.setItem(key, JSON.stringify([item, ...filtered]));
  } catch (localErr) {
    console.warn('Local vocab save error:', localErr);
  }

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const docRef = doc(db, 'users', userId, 'vocabulary', item.id);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn('Firestore vocab save skipped (saved locally):', err);
    }
  }
}

export async function getUserVocabulary(userId: string): Promise<StoredVocabularyItem[]> {
  let localVocab: StoredVocabularyItem[] = [];
  try {
    const raw = localStorage.getItem(`deutschschreiben_vocab_${userId}`);
    if (raw) localVocab = JSON.parse(raw);
  } catch {
    localVocab = [];
  }

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const colRef = collection(db, 'users', userId, 'vocabulary');
      const snapshot = await getDocs(colRef);
      const remoteVocab: StoredVocabularyItem[] = [];
      snapshot.forEach((d) => {
        remoteVocab.push(d.data() as StoredVocabularyItem);
      });

      if (remoteVocab.length > 0) {
        const ids = new Set(remoteVocab.map((v) => v.id));
        const combined = [...remoteVocab, ...localVocab.filter((v) => !ids.has(v.id))];
        return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    } catch (err) {
      console.warn('Firestore vocab fetch failed, using local vocab:', err);
    }
  }

  return localVocab.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function deleteUserVocabulary(userId: string, vocabId: string): Promise<void> {
  try {
    const key = `deutschschreiben_vocab_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const existing: StoredVocabularyItem[] = JSON.parse(raw);
      localStorage.setItem(key, JSON.stringify(existing.filter((v) => v.id !== vocabId)));
    }
  } catch (e) {
    console.warn('Local vocab delete error:', e);
  }

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const docRef = doc(db, 'users', userId, 'vocabulary', vocabId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore vocab delete skipped (deleted locally):', err);
    }
  }
}
