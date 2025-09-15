"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import {
  FileText,
  FolderOpen,
  Activity,
  CreditCard,
  Settings,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Menu,
  Receipt
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Sidebar = ({ isOpen, setIsOpen, currentPath }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Detect screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      // Automatically show sidebar on desktop, hide on mobile
      if (!mobile) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }
    
    // Initial check
    checkScreenSize()
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [setIsOpen])

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FileText,
      description: "Overview",
    },
    {
      name: "Returns",
      href: "/dashboard/returns",
      icon: Receipt,
      description: "Manage tax returns",
    },
    {
      name: "Invoices",
      href: "/dashboard/invoices",
      icon: Activity,
      description: "View invoice history",
    },
    {
      name: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      description: " payments",
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getUserInitials = () => {
    if (!currentUser) return "U"
    
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    return currentUser.email?.[0]?.toUpperCase() || "U"
  }

  const getUserName = () => {
    if (!currentUser) return "User"
    
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    }
    return currentUser.email || "User"
  }

  return (
    <>
      {/* Mobile hamburger menu button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-md bg-sidebar text-sidebar-foreground shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile backdrop */}
      {isOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -320) : 0,
          width: isCollapsed ? 80 : 320,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 z-50 h-full bg-sidebar border-r border-sidebar-border shadow-xl lg:relative ${
          isCollapsed ? "lg:w-20" : "lg:w-80"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className=" rounded-xl flex items-center justify-center shadow-lg">
                  <img src="/favicon.svg" alt="logo" className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-sidebar-foreground">Invertio.us</h1>
                  <p className="text-xs text-sidebar-foreground/80">Invertio Taxation Company</p>
                </div>
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              {/* Collapse toggle (desktop only) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>

              {/* Close button (mobile only) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="lg:hidden h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = currentPath === item.href
              const Icon = item.icon

              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground shadow-lg"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        setIsOpen(false)
                      }
                    }}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? "mx-auto" : ""}`} />
                    {!isCollapsed && (
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p
                          className={`text-xs ${isActive ? "text-sidebar-foreground/90" : "text-sidebar-foreground/60"}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
              <Avatar className="h-10 w-10 ring-2 ring-sidebar-accent">
                <AvatarFallback className="bg-white text-primary font-medium">{getUserInitials()}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-sidebar-foreground truncate">{getUserName()}</p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {currentUser?.email || "Not signed in"}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-3 justify-start text-sidebar-foreground/80 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar