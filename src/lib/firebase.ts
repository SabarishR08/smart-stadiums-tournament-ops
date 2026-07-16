import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  limit, 
  orderBy, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { ZoneStatus, TransportationStatus } from '../types';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCf4w_MdoE4IFJhykHjcGpC2rHVIOa2t2Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agentflow-prod-assistant.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agentflow-prod-assistant",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agentflow-prod-assistant.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1025941268003",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1025941268003:web:1158f9e889aa17b4b1f396",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MV596YX77T"
};

const firestoreDatabaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || "(default)";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore specifying the databaseId from our config
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
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

/**
 * Fetch a user's role from their Firestore profile document.
 */
export async function getUserRole(uid: string): Promise<string | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data().role || null;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Assign a role (e.g. staff) to a user in Firestore during registration.
 */
export async function setUserRole(uid: string, email: string, role: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      email,
      role,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Automatically seeds initial crowd and transportation data in Firestore if empty.
 */
export async function seedInitialDataIfEmpty() {
  try {
    const crowdCol = collection(db, 'crowd_status');
    let crowdSnap;
    try {
      crowdSnap = await getDocs(query(crowdCol, limit(1)));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'crowd_status');
    }
    
    if (crowdSnap.empty) {
      console.log('Seeding initial crowd status data...');
      const batch = writeBatch(db);
      
      const initialCrowd: ZoneStatus[] = [
        { id: 'gate-a', name: 'Gate A (North Entrance)', density: 'medium', count: 1200, updatedAt: new Date().toISOString() },
        { id: 'gate-b', name: 'Gate B (East Entrance)', density: 'high', count: 3400, updatedAt: new Date().toISOString() },
        { id: 'gate-c', name: 'Gate C (South Entrance)', density: 'low', count: 450, updatedAt: new Date().toISOString() },
        { id: 'gate-d', name: 'Gate D (West Entrance - Accessible)', density: 'medium', count: 850, updatedAt: new Date().toISOString() },
        { id: 'zone-a-d', name: 'Sections A-D (Main Lower Tier)', density: 'high', count: 5600, updatedAt: new Date().toISOString() },
        { id: 'zone-e-h', name: 'Sections E-H (Main Upper Tier)', density: 'medium', count: 4200, updatedAt: new Date().toISOString() }
      ];

      initialCrowd.forEach((zone) => {
        const docRef = doc(db, 'crowd_status', zone.id);
        batch.set(docRef, zone);
      });

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'crowd_status');
      }
    }

    const transCol = collection(db, 'transportation');
    let transSnap;
    try {
      transSnap = await getDocs(query(transCol, limit(1)));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'transportation');
    }

    if (transSnap.empty) {
      console.log('Seeding initial transportation data...');
      const batch = writeBatch(db);

      const initialTrans: TransportationStatus[] = [
        { id: 'shuttle-metro', type: 'shuttle', name: 'Metro Express Shuttle (Gate A)', status: 'On Time', eta: '4 mins', updatedAt: new Date().toISOString() },
        { id: 'shuttle-parking', type: 'shuttle', name: 'General Parking Shuttle (Gate D)', status: 'Delayed', eta: '18 mins', updatedAt: new Date().toISOString() },
        { id: 'parking-north', type: 'parking', name: 'North Fan Parking Lot A', status: '85% Full', eta: 'Available', updatedAt: new Date().toISOString() },
        { id: 'parking-south', type: 'parking', name: 'South Accessible Parking Lot B', status: '40% Full', eta: 'Available', updatedAt: new Date().toISOString() }
      ];

      initialTrans.forEach((item) => {
        const docRef = doc(db, 'transportation', item.id);
        batch.set(docRef, item);
      });

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'transportation');
      }
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}
