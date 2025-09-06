"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { FileText, FolderOpen, CreditCard, TrendingUp, Clock, Plus, ArrowRight, Activity } from "lucide-react"
import { getStoredData, seedReturns, seedInvoices, seedActivityLogs } from "@/src/data/seed"

import { formatCurrency, formatDate } from "@/src/utils/validators"


const Dashboard = () => {
  const [returns, setReturns] = useState([])
  const [invoices, setInvoices] = useState([])
  const [activityLogs, setActivityLogs] = useState([])

  useEffect(() => {
    // Load data from localStorage or use seed data
    setReturns(getStoredData("returns", seedReturns))
    setInvoices(getStoredData("invoices", seedInvoices))
    setActivityLogs(getStoredData("activityLogs", seedActivityLogs))
  }, [])

  const stats = {
    totalReturns: returns.length,
    pendingReturns: returns.filter((r) => r.status === "Pending").length,
    completedReturns: returns.filter((r) => r.status === "Completed").length,
    totalInvoices: invoices.length,
    unpaidInvoices: invoices.filter((i) => i.status === "Unpaid").length,
    totalAmount: invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    unpaidAmount: invoices.filter((i) => i.status === "Unpaid").reduce((sum, invoice) => sum + invoice.amount, 0),
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "In Review":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const recentReturns = returns.slice(0, 3)
  const recentActivity = activityLogs.slice(0, 5)

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600">
              Here's what's happening with your Invertio.us business management today.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Button asChild className="w-fit shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href="/dashboard/returns">
                <Plus className="w-4 h-4 mr-2" />
                New Tax Return
              </Link>
            </Button>
          </motion.div>
        </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Total Returns",
                  value: stats.totalReturns,
                  subtitle: `${stats.pendingReturns} pending, ${stats.completedReturns} completed`,
                  icon: FileText,
                  color: "text-blue-600",
                  delay: 0.1,
                },
                {
                  title: "Pending Returns",
                  value: stats.pendingReturns,
                  subtitle: "Require attention",
                  icon: Clock,
                  color: "text-yellow-600",
                  delay: 0.2,
                },
                {
                  title: "Outstanding Invoices",
                  value: stats.unpaidInvoices,
                  subtitle: `${formatCurrency(stats.unpaidAmount)} due`,
                  icon: CreditCard,
                  color: "text-red-600",
                  delay: 0.3,
                },
                {
                  title: "Total Revenue",
                  value: formatCurrency(stats.totalAmount),
                  subtitle: "This year",
                  icon: TrendingUp,
                  color: "text-green-600",
                  delay: 0.4,
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stat.delay }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                      <stat.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {typeof stat.value === "number" ? stat.value : stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Returns */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Tax Returns</CardTitle>
                      <CardDescription>Your latest tax return filings</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/returns">
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentReturns.length > 0 ? (
                        recentReturns.map((returnItem) => (
                          <motion.div
                            key={returnItem.id}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Form {returnItem.type}</p>
                                <p className="text-sm text-gray-500">
                                  Created {formatDate(returnItem.createdDate)} • {returnItem.documentCount} documents
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(returnItem.status)}>{returnItem.status}</Badge>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No tax returns yet</p>
                          <Button asChild className="mt-2">
                            <Link href="/returns">Create Your First Return</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Activity className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                              <p className="text-xs text-gray-500 truncate">{activity.metadata}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(activity.timestamp.split("T")[0])}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/returns">
                      <FileText className="w-6 h-6" />
                      <span className="font-medium">New Tax Return</span>
                      <span className="text-xs text-gray-500">Start a new filing</span>
                    </Link>
                  </Button>

                  {/* <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                    asChild
                  >
                    <Link href="/documents">
                      <FolderOpen className="w-6 h-6" />
                      <span className="font-medium">Upload Documents</span>
                      <span className="text-xs text-gray-500">Add supporting files</span>
                    </Link>
                  </Button> */}

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/payments">
                      <CreditCard className="w-6 h-6" />
                      <span className="font-medium">View Invoices</span>
                      <span className="text-xs text-gray-500">Check payment status</span>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/activity-logs">
                      <Activity className="w-6 h-6" />
                      <span className="font-medium">Activity History</span>
                      <span className="text-xs text-gray-500">Track all changes</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
     
    
  )
}

export default Dashboard