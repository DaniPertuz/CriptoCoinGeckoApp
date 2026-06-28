import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

let app: FirebaseApp | null = null
let auth: Auth | null = null

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) {
    return null
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  }

  return auth
}

export async function signInWithGooglePopup(): Promise<string> {
  const firebaseAuth = getFirebaseAuth()

  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured')
  }

  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(firebaseAuth, provider)
  return credential.user.getIdToken()
}

export { isFirebaseConfigured }
