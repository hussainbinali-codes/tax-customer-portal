// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "firebase/auth"

const firebaseConfig = {
  // These would be provided by environment variables in a real app
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Phone authentication helpers
export const setupRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
  })
}

export const sendPhoneOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    return confirmationResult
  } catch (error) {
    throw error
  }
}

// Email link authentication helpers
export const sendEmailSignInLink = async (email) => {
  const actionCodeSettings = {
    url: window.location.origin + "/login",
    handleCodeInApp: true,
  }

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    window.localStorage.setItem("emailForSignIn", email)
  } catch (error) {
    throw error
  }
}

export const completeEmailSignIn = async (email, emailLink) => {
  try {
    const result = await signInWithEmailLink(auth, email, emailLink)
    window.localStorage.removeItem("emailForSignIn")
    return result
  } catch (error) {
    throw error
  }
}

export const checkEmailLink = () => {
  return isSignInWithEmailLink(auth, window.location.href)
}

export const logout = () => {
  return signOut(auth)
}
