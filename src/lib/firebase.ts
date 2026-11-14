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
import type { AppLanguage, AssessmentResult, UserEntitlement } from '../types';
import { stripUndefinedDeep } from '../utils/assessment-core';
import {
  ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSCODE,
  generateImmutableUserId,
  isAdminEmail,
  isValidPublicUserId,
  normalizePublicUserId,
} from '../utils/user-id';

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
  publicId: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
  isLocal?: boolean;
}

const LOCAL_USER_KEY = 'deutschschreiben_local_user';
const LOCAL_USER_ID_MAP_KEY = 'deutschschreiben_immutable_id_map';

/**
 * Resolves the user's deterministic, immutable public ID (DS-XXXXXXXX).
 * Once assigned for a uid, it is never regenerated or altered.
 */
export function resolvePublicUserId(user: { uid: string; publicId?: string | null } | null | undefined): string {
  if (!user?.uid) return '';
  try {
    const rawMap = localStorage.getItem(LOCAL_USER_ID_MAP_KEY);
    const idMap: Record<string, string> = rawMap ? JSON.parse(rawMap) : {};
    const existing = idMap[user.uid];
    if (existing && isValidPublicUserId(existing)) {
      return existing;
    }
    const assigned =
      user.publicId && isValidPublicUserId(user.publicId)
        ? normalizePublicUserId(user.publicId)
        : generateImmutableUserId(user.uid);
    idMap[user.uid] = assigned;
    localStorage.setItem(LOCAL_USER_ID_MAP_KEY, JSON.stringify(idMap));
    return assigned;
  } catch {
    return user.publicId && isValidPublicUserId(user.publicId)
      ? normalizePublicUserId(user.publicId)
      : generateImmutableUserId(user.uid);
  }
}

export function getLocalUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.uid) return null;
    const publicId = resolvePublicUserId(parsed);
    const normalized: AppUser = { ...parsed, publicId };
    if (parsed.publicId !== publicId) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return null;
  }
}

export function saveLocalUser(user: Omit<AppUser, 'publicId'> & { publicId?: string }): AppUser {
  const publicId = resolvePublicUserId(user);
  const fullUser: AppUser = {
    uid: user.uid,
    publicId,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    isLocal: user.isLocal,
  };
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fullUser));
  } catch (e) {
    console.warn('Could not save local user:', e);
  }
  return fullUser;
}

export function clearLocalUser(): void {
  try {
    localStorage.removeItem(LOCAL_USER_KEY);
  } catch (e) {
    console.warn('Could not clear local user:', e);
  }
}

export function createInstantProfile(displayName: string, email?: string): AppUser {
  const trimmedName = displayName.trim() || 'ผู้เรียนภาษาเยอรมัน';
  const trimmedEmail = email?.trim().toLowerCase();
  const uid = `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const publicId = generateImmutableUserId(uid);
  const newUser = saveLocalUser({
    uid,
    publicId,
    displayName: trimmedName,
    email: trimmedEmail || `${trimmedName.toLowerCase().replace(/\s+/g, '.') || 'learner'}@deutschschreiben.local`,
    isAnonymous: false,
    isLocal: true,
  });
  return newUser;
}

export async function loginAsGuest(): Promise<AppUser> {
  try {
    const cred = await signInAnonymously(auth);
    return saveLocalUser({
      uid: cred.user.uid,
      displayName: cred.user.displayName || 'ผู้เรียนทั่วไป (Guest)',
      email: cred.user.email || 'guest@deutschschreiben.local',
      photoURL: cred.user.photoURL,
      isAnonymous: true,
    });
  } catch (err) {
    console.warn('Firebase anonymous auth unavailable, using persistent local guest profile:', err);
    const uid = `guest-${Date.now().toString(36)}`;
    return saveLocalUser({
      uid,
      publicId: generateImmutableUserId(uid),
      displayName: 'ผู้เรียนทั่วไป (Guest)',
      email: 'guest@deutschschreiben.local',
      isAnonymous: true,
      isLocal: true,
    });
  }
}

function clearAdminSessionTokens(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('ds_admin_token_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore storage restriction
  }
}

export async function logOut() {
  clearLocalUser();
  clearAdminSessionTokens();
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase signout warning:', e);
  }
}

export { onAuthStateChanged, type FirebaseUser };

async function registerPublicIdOnServer(publicId: string, uid: string, displayName: string): Promise<void> {
  try {
    await fetch('/api/users/register-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId, uid, displayName }),
    });
  } catch {
    // non-fatal
  }
}

// Database Operations
export async function syncUserProfile(user: AppUser | FirebaseUser): Promise<string> {
  const existingPublicId = (user as AppUser).publicId;
  const resolvedId = resolvePublicUserId({ uid: user.uid, publicId: existingPublicId });

  saveLocalUser({
    uid: user.uid,
    publicId: resolvedId,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    isLocal: (user as AppUser).isLocal,
  });

  const safeDisplayName =
    user.displayName || (user.isAnonymous ? 'ผู้เรียนทั่วไป (Guest)' : 'ผู้เรียนภาษาเยอรมัน');
  void registerPublicIdOnServer(resolvedId, user.uid, safeDisplayName);

  if ((user as AppUser).isLocal || !auth.currentUser || auth.currentUser.uid !== user.uid) {
    return resolvedId;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);
    const now = new Date().toISOString();
    let finalPublicId = resolvedId;

    if (!existing.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        publicId: finalPublicId,
        email: user.email || (user.isAnonymous ? 'guest@deutschschreiben.local' : ''),
        displayName: safeDisplayName,
        photoURL: user.photoURL || '',
        createdAt: now,
        lastLoginAt: now,
      });
    } else {
      const storedPublicId = existing.data()?.publicId;
      if (typeof storedPublicId === 'string' && isValidPublicUserId(storedPublicId)) {
        finalPublicId = normalizePublicUserId(storedPublicId);
        // Keep local cache matched to Firestore's immutable ID
        saveLocalUser({
          uid: user.uid,
          publicId: finalPublicId,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
        });
      }
      await setDoc(
        userDocRef,
        {
          publicId: finalPublicId,
          lastLoginAt: now,
          displayName: user.displayName || existing.data()?.displayName || 'ผู้เรียนภาษาเยอรมัน',
        },
        { merge: true }
      );
    }

    // Also upsert non-PII public user directory entry for admin ID lookup
    const dirRef = doc(db, 'user_directory', finalPublicId);
    const dirSnap = await getDoc(dirRef);
    await setDoc(
      dirRef,
      {
        publicId: finalPublicId,
        uid: user.uid,
        displayName: safeDisplayName,
        createdAt: dirSnap.exists() ? dirSnap.data()?.createdAt || now : now,
      },
      { merge: true }
    );

    return finalPublicId;
  } catch (err) {
    console.warn('Firestore sync profile skipped (offline or unauthorized):', err);
    return resolvedId;
  }
}

export function getAdminSessionToken(user: { uid: string; email?: string | null } | null): string | null {
  if (!user?.uid || !isAdminEmail(user.email)) return null;
  try {
    return sessionStorage.getItem(`ds_admin_token_${user.uid}`);
  } catch {
    return null;
  }
}

export function isAdminSessionVerified(user: { uid: string; email?: string | null } | null): boolean {
  return !!getAdminSessionToken(user);
}

export async function verifyAdminPasscode(
  user: { uid: string; email?: string | null },
  passcode: string
): Promise<{ verified: boolean; adminToken?: string; error?: string }> {
  if (!isAdminEmail(user?.email)) {
    return { verified: false, error: 'บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ' };
  }
  const trimmedCode = passcode.trim();
  if (!trimmedCode) {
    return { verified: false, error: 'กรุณากรอกรหัสผ่านเฉพาะผู้ดูแลระบบ' };
  }

  let serverVerified = false;
  let serverToken = '';
  let serverError = '';

  try {
    const res = await fetch('/api/admin/verify-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email || ADMIN_EMAIL,
        passcode: trimmedCode,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.verified && data.adminToken) {
      serverVerified = true;
      serverToken = data.adminToken;
    } else {
      serverError = data.error || 'รหัสผ่านเฉพาะไม่ถูกต้อง';
    }
  } catch {
    serverError = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อตรวจสอบรหัสผ่านได้';
  }

  // Also seed/verify against Firestore /admin_settings/gate when Firebase Google Auth is active & verified
  if (
    auth.currentUser &&
    auth.currentUser.uid === user.uid &&
    auth.currentUser.emailVerified &&
    isAdminEmail(auth.currentUser.email)
  ) {
    try {
      const gateRef = doc(db, 'admin_settings', 'gate');
      const gateSnap = await getDoc(gateRef);
      const now = new Date().toISOString();
      let dbPasscode = DEFAULT_ADMIN_PASSCODE;

      if (!gateSnap.exists()) {
        await setDoc(gateRef, {
          admin_email: ADMIN_EMAIL,
          passcode: DEFAULT_ADMIN_PASSCODE,
          updated_at: now,
        });
      } else if (typeof gateSnap.data()?.passcode === 'string') {
        dbPasscode = gateSnap.data()!.passcode;
      }

      if (trimmedCode !== dbPasscode && !serverVerified) {
        return { verified: false, error: 'รหัสผ่านเฉพาะไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' };
      }

      if (trimmedCode === dbPasscode) {
        await setDoc(doc(db, 'admins', user.uid), {
          email: ADMIN_EMAIL,
          role: 'admin',
          verifiedAt: now,
        });
      }
    } catch (fireErr) {
      console.warn('Firestore admin gate sync skipped:', fireErr);
    }
  }

  if (!serverVerified) {
    return { verified: false, error: serverError || 'รหัสผ่านเฉพาะไม่ถูกต้อง' };
  }

  try {
    sessionStorage.setItem(`ds_admin_token_${user.uid}`, serverToken);
  } catch {
    // ignore storage issues
  }

  return { verified: true, adminToken: serverToken };
}

export async function fetchUserEntitlement(publicId: string): Promise<UserEntitlement | null> {
  if (!publicId || !isValidPublicUserId(publicId)) return null;
  const normalizedId = normalizePublicUserId(publicId);
  let serverEnt: UserEntitlement | null = null;
  let fireEnt: UserEntitlement | null = null;

  try {
    const res = await fetch(`/api/entitlements/${encodeURIComponent(normalizedId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.entitlement) {
        serverEnt = data.entitlement as UserEntitlement;
      }
    }
  } catch {
    // non-fatal
  }

  if (auth.currentUser) {
    try {
      const snap = await getDoc(doc(db, 'entitlements', normalizedId));
      if (snap.exists()) {
        fireEnt = snap.data() as UserEntitlement;
      }
    } catch {
      // non-fatal
    }
  }

  if (fireEnt?.english_writing_enabled) return fireEnt;
  if (serverEnt?.english_writing_enabled) return serverEnt;
  return fireEnt || serverEnt;
}

export interface DirectoryUserItem {
  publicId: string;
  uid: string;
  displayName: string;
  createdAt?: string;
}

export async function adminListEntitlements(adminToken: string): Promise<{
  entitlements: UserEntitlement[];
  directory: DirectoryUserItem[];
}> {
  const mergedEnts = new Map<string, UserEntitlement>();
  const mergedDir = new Map<string, DirectoryUserItem>();

  try {
    const res = await fetch('/api/admin/entitlements', {
      headers: { 'x-admin-token': adminToken },
    });
    if (res.ok) {
      const data = await res.json();
      for (const e of (data.entitlements || []) as UserEntitlement[]) {
        mergedEnts.set(e.publicId, e);
      }
      for (const d of (data.directory || []) as DirectoryUserItem[]) {
        mergedDir.set(d.publicId, d);
      }
    }
  } catch (err) {
    console.warn('Server admin entitlements fetch error:', err);
  }

  if (auth.currentUser && auth.currentUser.emailVerified && isAdminEmail(auth.currentUser.email)) {
    try {
      const [entSnap, dirSnap] = await Promise.all([
        getDocs(collection(db, 'entitlements')),
        getDocs(collection(db, 'user_directory')),
      ]);
      entSnap.forEach((d) => {
        const data = d.data() as UserEntitlement;
        if (data?.publicId) {
          mergedEnts.set(data.publicId, data);
        }
      });
      dirSnap.forEach((d) => {
        const data = d.data() as DirectoryUserItem;
        if (data?.publicId) {
          mergedDir.set(data.publicId, data);
        }
      });
    } catch (err) {
      console.warn('Firestore admin list skipped:', err);
    }
  }

  const entitlements = Array.from(mergedEnts.values()).sort(
    (a, b) => new Date(b.granted_at || 0).getTime() - new Date(a.granted_at || 0).getTime()
  );
  const directory = Array.from(mergedDir.values());
  return { entitlements, directory };
}

export async function adminSetUserEnglishAccess(
  adminToken: string,
  adminEmail: string,
  targetPublicId: string,
  enabled: boolean,
  note?: string
): Promise<UserEntitlement> {
  const normalizedId = normalizePublicUserId(targetPublicId);
  if (!isValidPublicUserId(normalizedId)) {
    throw new Error('รูปแบบ User ID ไม่ถูกต้อง (ต้องเป็น DS- ตามด้วยอักษร/ตัวเลข 8 ตัว เช่น DS-7F9A2C1B)');
  }

  const res = await fetch('/api/admin/entitlements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken,
    },
    body: JSON.stringify({
      publicId: normalizedId,
      english_writing_enabled: enabled,
      note: note?.trim() || '',
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'ไม่สามารถบันทึกสิทธิ์การใช้งานได้');
  }

  const entitlement = data.entitlement as UserEntitlement;

  if (auth.currentUser && auth.currentUser.emailVerified && isAdminEmail(auth.currentUser.email)) {
    try {
      await setDoc(doc(db, 'entitlements', normalizedId), {
        publicId: normalizedId,
        english_writing_enabled: enabled,
        granted_by: adminEmail,
        granted_at: entitlement.granted_at,
        ...(note?.trim() ? { note: note.trim() } : { note: '' }),
      });
    } catch (err) {
      console.warn('Firestore entitlement write skipped:', err);
    }
  }

  return entitlement;
}

export async function adminUpdatePasscode(
  adminToken: string,
  newPasscode: string
): Promise<void> {
  const trimmed = newPasscode.trim();
  if (trimmed.length < 6) {
    throw new Error('รหัสผ่านเฉพาะต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }
  const res = await fetch('/api/admin/passcode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken,
    },
    body: JSON.stringify({ passcode: trimmed }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'ไม่สามารถอัปเดตรหัสผ่านเฉพาะได้');
  }

  if (auth.currentUser && auth.currentUser.emailVerified && isAdminEmail(auth.currentUser.email)) {
    try {
      await setDoc(doc(db, 'admin_settings', 'gate'), {
        admin_email: ADMIN_EMAIL,
        passcode: trimmed,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore admin passcode update skipped:', err);
    }
  }
}

export async function saveUserSubmission(userId: string, submission: AssessmentResult): Promise<void> {
  const cleanSubmission = stripUndefinedDeep(submission);

  // Always save locally first so user never loses their assessment
  try {
    const key = `deutschschreiben_subs_${userId}`;
    const raw = localStorage.getItem(key);
    const existing: AssessmentResult[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((s) => s.id !== cleanSubmission.id);
    localStorage.setItem(key, JSON.stringify([cleanSubmission, ...filtered]));
  } catch (localErr) {
    console.warn('Local submission save error:', localErr);
  }

  // Attempt Firestore write only if user is logged into Firebase Auth
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const docRef = doc(db, 'users', userId, 'submissions', cleanSubmission.id);
      await setDoc(docRef, {
        ...cleanSubmission,
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

export async function deleteUserSubmission(userId: string, submissionId: string): Promise<void> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    const docPath = `users/${userId}/submissions/${submissionId}`;
    try {
      const docRef = doc(db, 'users', userId, 'submissions', submissionId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  }

  try {
    const key = `deutschschreiben_subs_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const existing: AssessmentResult[] = JSON.parse(raw);
      localStorage.setItem(
        key,
        JSON.stringify(existing.filter((s) => s.id !== submissionId))
      );
    }
  } catch (e) {
    console.warn('Local submission delete error:', e);
  }
}

export interface StoredVocabularyItem {
  id: string;
  userId: string;
  language?: AppLanguage;
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
