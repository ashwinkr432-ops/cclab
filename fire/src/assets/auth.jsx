import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { app } from './firebase.js'

export const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()

export async function signUpWithEmail(name, email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })
  return credential.user
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function signOutUser() {
  return signOut(auth)
}

export function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Try logging in.'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.'
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before sign-in finished.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups and try again.'
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in your Firebase project.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'A network error interrupted sign-in. Check your connection and try again.'
    default:
      return error?.message || 'Authentication failed. Please try again.'
  }
}