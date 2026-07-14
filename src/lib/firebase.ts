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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use VITE_FIREBASE_DATABASE_ID if set (non-default Firestore database),
// otherwise fall back to the default database.
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || undefined;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);

/**
 * Fetch a user's role from their Firestore profile document.
 */
export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data().role || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Assign a role (e.g. staff) to a user in Firestore during registration.
 */
export async function setUserRole(uid: string, email: string, role: string): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, {
    email,
    role,
    createdAt: new Date().toISOString()
  });
}

/**
 * Automatically seeds initial crowd and transportation data in Firestore if empty.
 */
export async function seedInitialDataIfEmpty() {
  try {
    const crowdCol = collection(db, 'crowd_status');
    const crowdSnap = await getDocs(query(crowdCol, limit(1)));
    
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

      await batch.commit();
    }

    const transCol = collection(db, 'transportation');
    const transSnap = await getDocs(query(transCol, limit(1)));

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

      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}
