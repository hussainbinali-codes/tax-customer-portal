"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Receipt, Download, Eye, Edit, X, User, CreditCard, CheckCircle } from "lucide-react"
import { BASE_URL } from "@/src/components/BaseUrl"

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [isPaying, setIsPaying] = useState(false)
  const [payingInvoiceId, setPayingInvoiceId] = useState(null)
  const [viewInvoice, setViewInvoice] = useState(null) // For viewing invoice
  const [isDownloading, setIsDownloading] = useState(false) // For download state

      const userToken = localStorage.getItem('token')
  
  useEffect(() => {
    try {
      const userString = localStorage.getItem('userProfile')
      
      const user = userString ? JSON.parse(userString) : null
      if (user) {
        const loggedInUser = {
          id: user?.uid,
          name: user?.displayName,
          email: user?.email,
          role: user?.role
        }
        console.log(loggedInUser)
        setCurrentUser(loggedInUser)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    
    if (currentUser?.id) {
      loadInvoices()
    }
  }, [currentUser])

  useEffect(() => {
    filterInvoices()
  }, [invoices, filterStatus, searchTerm])

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/api/getInvoices/${currentUser?.id}` ,{

        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }
      const apiInvoices = await response.json()
      
      const transformedInvoices = apiInvoices.map(invoice => ({
        id: invoice.id,
        customerId: invoice.customer_id,
        customerName: invoice.customer_name,
        returnName: invoice.tax_name,
        returnType: "Tax Return",
        invoiceAmount: parseFloat(invoice.invoice_amount),
        status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
        createdAt: invoice.created_at,
        dueDate: invoice.due_date,
        createdByType: invoice.createdby_type
      }))
      
      setInvoices(transformedInvoices)
    } catch (error) {
      console.error('Error loading invoices:', error)
      alert("Error loading invoices. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (filterStatus !== "all") {
      filtered = filtered.filter((invoice) => 
        invoice.status.toLowerCase() === filterStatus.toLowerCase()
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.returnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.id.toString().includes(searchTerm)
      )
    }

    setFilteredInvoices(filtered)
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewInvoice = (invoice) => {
    setViewInvoice(invoice)
  }

  const handleDownloadInvoice = async (invoice) => {
    setIsDownloading(true)
    try {
      // Create a printable version of the invoice
      const content = `
        <html>
          <head>
            <title>Invoice #${invoice.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin-bottom: 20px; }
              .totals { text-align: right; margin-top: 30px; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>TaxPortal</h1>
              <h2>Invoice #${invoice.id}</h2>
            </div>
            
            <div class="invoice-details">
              <p><strong>Customer:</strong> ${invoice.customerName}</p>
              <p><strong>Return:</strong> ${invoice.returnName}</p>
              <p><strong>Date:</strong> ${formatDate(invoice.createdAt)}</p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
              <p><strong>Status:</strong> ${invoice.status}</p>
            </div>

            <div class="totals">
              <p><strong>Total Amount:</strong> $${invoice.invoiceAmount.toFixed(2)} USD</p>
            </div>
            
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `
      
      // Create a blob from the HTML content
      const blob = new Blob([content], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Create a temporary anchor element for downloading
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${invoice.id}.html`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Error downloading invoice. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const payNow = async (invoice) => {
    setIsPaying(true)
    setPayingInvoiceId(invoice.id)
    
    try {
      const response = await fetch(`${BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          amount: invoice.invoiceAmount, // Amount in USD
          currency: 'USD', // Force USD currency
          receipt: `rcpt_${Date.now()}`,
          notes: {
            invoice_id: invoice.id,
            customer_name: invoice.customerName
          },
          invoice_id: invoice.id,
          createdby_type: currentUser.role,
          createdby_id: currentUser.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create order')
      }

      const order = await response.json()

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'TaxPortal',
          description: `Payment for Invoice ${invoice.id}`,
          order_id: order.id,
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
          },
          theme: {
            color: '#2563EB'
          },
          method: {
            card: true,
            netbanking: false,
            wallet: false,
            upi: false,
            emi: false
          },
          handler: async function (response) {
            try {
              const verifyResponse = await fetch(`${BASE_URL}/api/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              })

              const data = await verifyResponse.json()

              if (data.status === 'ok') {
                // Update invoice status to paid
                const updatedInvoices = invoices.map(inv => 
                  inv.id === invoice.id ? { ...inv, status: 'Paid' } : inv
                )
                setInvoices(updatedInvoices)
                alert('Payment successful! Invoice status updated to Paid.')
                
                // Reload invoices to get updated status from server
                loadInvoices()
              } else {
                alert('Payment verification failed')
              }
            } catch (error) {
              console.error('Error:', error)
              alert('Error verifying payment')
            }
          },
          modal: {
            ondismiss: function() {
              setIsPaying(false)
              setPayingInvoiceId(null)
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
      
      script.onerror = () => {
        setIsPaying(false)
        setPayingInvoiceId(null)
        alert('Failed to load payment processor')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'Error creating payment order')
      setIsPaying(false)
      setPayingInvoiceId(null)
    }
  }

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
    { value: "Overdue", label: "Overdue" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Invoice #{viewInvoice.id}</h3>
              <button 
                onClick={() => setViewInvoice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">TaxPortal</h1>
                <h2 className="text-lg text-gray-600 mt-2">Invoice #{viewInvoice.id}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700">Bill To:</h4>
                  <p className="text-gray-900">{viewInvoice.customerName}</p>
                  <p className="text-sm text-gray-500">ID: {viewInvoice.customerId}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600"><strong>Date:</strong> {formatDate(viewInvoice.createdAt)}</p>
                  <p className="text-gray-600"><strong>Due Date:</strong> {formatDate(viewInvoice.dueDate)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewInvoice.status)} mt-2`}>
                    {viewInvoice.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-b py-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{viewInvoice.returnName}</p>
                    <p className="text-sm text-gray-500">{viewInvoice.returnType}</p>
                  </div>
                  <p className="font-medium text-gray-900">${viewInvoice.invoiceAmount.toFixed(2)} USD</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-900">${viewInvoice.invoiceAmount.toFixed(2)} USD</p>
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <p className="font-bold text-lg text-gray-900">Total</p>
                <p className="font-bold text-lg text-gray-900">${viewInvoice.invoiceAmount.toFixed(2)} USD</p>
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
                <p className="mt-2">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => handleDownloadInvoice(viewInvoice)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Invoices</h1>
            <p className="text-gray-600">View and manage all your tax service invoices</p>
          </div>
          {currentUser && (
            <div className="flex items-center bg-blue-50 rounded-lg p-3">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">{currentUser.name}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Invoices</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, return name, or invoice #..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No invoices available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto xl:overflow-x-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice 
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr 
                    key={invoice.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.customerName}</div>
                      <div className="text-xs text-gray-500">ID: {invoice.customerId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{invoice.returnName}</div>
                        <div className="text-sm text-gray-500">{invoice.returnType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${invoice.invoiceAmount.toFixed(2)} USD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={isDownloading}
                          className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                          title="Download Invoice"
                        >
                          {isDownloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        {invoice.status.toLowerCase() === 'pending' ? (
                          <button
                            onClick={() => payNow(invoice)}
                            disabled={isPaying && payingInvoiceId === invoice.id}
                            className="text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                            title="Pay Invoice"
                          >
                            {isPaying && payingInvoiceId === invoice.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="text-green-600" title="Payment Completed">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Statistics */}
      {filteredInvoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-lg shadow-sm border p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusOptions.slice(1).map((status) => {
              const count = invoices.filter((a) => a.status === status.value).length
              const total = invoices
                .filter((a) => a.status === status.value)
                .reduce((sum, invoice) => sum + invoice.invoiceAmount, 0)
              
              return (
                <div key={status.value} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{status.label}</div>
                  <div className="text-xs text-gray-500 mt-1">${total.toFixed(2)} USD</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}