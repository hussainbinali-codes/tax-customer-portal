"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "../../src/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Building2 } from "lucide-react"

const API_BASE_URL = "https://taxation-backend.onrender.com/api"

const Login = () => {
  const [activeTab, setActiveTab] = useState("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState("input") // 'input' or 'verify'

  const { login } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("verify")
        setSuccess("OTP sent successfully! Please check your email.")
      } else {
        setError(data.message || "Failed to send OTP. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (e) => {
    e.preventDefault()

    if (!otp) {
      setError("Please enter the OTP")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data and token in localStorage
        // localStorage.setItem("user", JSON.stringify(data.user))
        // localStorage.setItem("token", data.token)
        // localStorage.setItem("uid", data.user.id.toString())
        // localStorage.setItem("email", data.user.email)
        // localStorage.setItem("name", data.user.name)
        // Prepare user data for auth context
        const userData = {
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.name,
          token: data.token,
        }

        // Update auth context
        login(userData)
        
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError(data.message || "Invalid OTP. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep("input")
    setOtp("")
    setError("")
    setSuccess("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            >
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your Invertio.us business account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-1">Demo Info:</p>
              <p className="text-xs text-blue-700">Use your registered email and password</p>
              <p className="text-xs text-blue-700">OTP will be sent to your registered email</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 bg-gray-100">
                <TabsTrigger
                  value="email"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Mail className="w-4 h-4" />
                  Email Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                {step === "input" ? (
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <Input
                        id="email-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPVerification} className="space-y-4">
                    <div>
                      <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <Input
                        id="email-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to {email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => router.push("/register")} 
                  className="text-primary hover:underline font-medium transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login