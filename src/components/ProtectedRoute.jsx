"use client"

import { useAuth } from "@/src/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/login") // redirect to login if not logged in
    }
  }, [currentUser, loading, router])

  if (loading) {
    return <div>Loading...</div> // you can replace with a spinner
  }

  return currentUser ? children : null
}
