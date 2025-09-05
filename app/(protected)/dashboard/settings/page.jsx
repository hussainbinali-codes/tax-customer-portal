"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Bell, Shield, Trash2, Save } from "lucide-react"
import { useAuth } from "../../../../src/contexts/AuthContext"

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const { currentUser } = useAuth()

  // Initialize state with empty values, then update on client side
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
  })

  // Load data from localStorage only on client side
  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem("userProfile")
        if (stored) {
          const parsedProfile = JSON.parse(stored)
          setProfile({
            firstName: parsedProfile.firstName || "",
            lastName: parsedProfile.lastName || "",
            email: currentUser?.email || "",
            phone: parsedProfile.phone || "",
          })
        } else {
          // Set default values if no profile exists
          setProfile({
            firstName: "",
            lastName: "",
            email: currentUser?.email || "",
            phone: "",
          })
        }
      } catch (err) {
        console.error("Error loading profile:", err)
      }
    }

    const loadNotifications = () => {
      try {
        const stored = localStorage.getItem("notificationSettings")
        if (stored) {
          setNotifications(JSON.parse(stored))
        }
      } catch (err) {
        console.error("Error loading notifications:", err)
      }
    }

    loadProfile()
    loadNotifications()
  }, [currentUser])

  const getUserInitials = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    return currentUser?.email?.[0]?.toUpperCase() || "U"
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update localStorage
      const updatedProfile = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile))

      setSuccess("Profile updated successfully!")
    } catch (error) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async (key, value) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)

    // Simulate API call to update notification preferences
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      localStorage.setItem("notificationSettings", JSON.stringify(updatedNotifications))
    } catch (error) {
      console.error("Failed to update notification settings:", error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences.</p>
            </div>

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>Update your personal information and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500">
                      This is your avatar. It will be displayed across the platform.
                    </p>
                  </div>
                </div>

                <Separator />

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={profile.email} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed after registration</p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
                <CardDescription>Choose how you want to be notified about updates and activities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationUpdate("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationUpdate("smsNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationUpdate("pushNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                      <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationUpdate("marketingEmails", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>Manage your account security and privacy settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Active Sessions</h4>
                    <p className="text-sm text-gray-500">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </div>
                <CardDescription>Irreversible and destructive actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Settings