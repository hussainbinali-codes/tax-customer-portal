"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
// import { useAuth } from "../../src/contexts/AuthContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "../../components/ui/checkbox"
import { Loader2, Mail, Building2, Phone } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {BASE_URL} from "@/src/components/BaseUrl"

const Register = () => {
  const [activeTab, setActiveTab] = useState("email")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "individual"
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    name: ""
  })

  // const { login } = useAuth()
  const router = useRouter()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ""
      })
    }
    
    // Clear general error when user starts typing
    if (error) {
      setError("")
    }
  }

  const validateForm = () => {
    let isValid = true
    const newFieldErrors = {
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      name: ""
    }

    // Name validation
    if (!formData.name.trim()) {
      newFieldErrors.name = "Please enter your full name"
      isValid = false
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newFieldErrors.mobile = "Please enter your mobile number"
      isValid = false
    } else {
      // Basic mobile number validation
      const mobileRegex = /^[0-9]{10}$/
      const digitsOnly = formData.mobile.replace(/\D/g, '')
      if (!mobileRegex.test(digitsOnly)) {
        newFieldErrors.mobile = "Please enter a valid 10-digit mobile number"
        isValid = false
      }
    }

    // Password validation
    if (!formData.password) {
      newFieldErrors.password = "Please enter password"
      isValid = false
    } else if (formData.password.length < 6) {
      newFieldErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    // Email validation (only if email tab is active)
    if (activeTab === "email") {
      if (!formData.email) {
        newFieldErrors.email = "Please enter email address"
        isValid = false
      } else {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          newFieldErrors.email = "Please enter a valid email address"
          isValid = false
        }
      }
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      isValid = false
    }

    setFieldErrors(newFieldErrors)
    return isValid
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile.replace(/\D/g, ''), // Remove any formatting from mobile number
        password: formData.password,
        role: formData.role
      }

      // Use proxy route instead of direct API call
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Registration successful! Please login...")
        
        // Redirect to login after a brief delay
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        // Handle specific error messages from the server
        if (data.error === "Email already registered.") {
          setFieldErrors({
            ...fieldErrors,
            email: "This email is already registered. Please use a different email or try logging in."
          })
        } else if (data.message && data.message.includes("email")) {
          setFieldErrors({
            ...fieldErrors,
            email: data.message
          })
        } else if (data.message && data.message.includes("mobile")) {
          setFieldErrors({
            ...fieldErrors,
            mobile: data.message
          })
        } else {
          setError(data.message || "Registration failed. Please try again.")
        }
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Format mobile number as user types
  const handleMobileChange = (e) => {
    const input = e.target.value.replace(/\D/g, '')
    let formattedInput = input
    
    if (input.length > 3 && input.length <= 6) {
      formattedInput = `(${input.slice(0, 3)}) ${input.slice(3)}`
    } else if (input.length > 6) {
      formattedInput = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`
    }
    
    setFormData({
      ...formData,
      mobile: formattedInput
    })
    
    // Clear mobile error when user starts typing
    if (fieldErrors.mobile) {
      setFieldErrors({
        ...fieldErrors,
        mobile: ""
      })
    }
    
    // Clear general error when user starts typing
    if (error) {
      setError("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
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
              <img src="/favicon.svg" alt="logo" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-600">Join our business management platform</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter Your Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={fieldErrors.name ? "border-red-500" : ""}
                required
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  className={`pl-10 ${fieldErrors.mobile ? "border-red-500" : ""}`}
                  required
                />
              </div>
              {fieldErrors.mobile && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.mobile}</p>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="abc234@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={fieldErrors.email ? "border-red-500" : ""}
                      required
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={fieldErrors.password ? "border-red-500" : ""}
                      required
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={fieldErrors.confirmPassword ? "border-red-500" : ""}
                      required
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms-email" 
                      checked={agreedToTerms} 
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      required
                    />
                    <label htmlFor="terms-email" className="text-sm text-gray-700">
                      I agree to the{" "}
                      <button 
                        onClick={() => router.push("/terms")} 
                        className="text-primary hover:underline cursor-pointer"
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !agreedToTerms}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button 
                  onClick={() => router.push("/login")} 
                  className="text-primary hover:underline font-medium transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Register