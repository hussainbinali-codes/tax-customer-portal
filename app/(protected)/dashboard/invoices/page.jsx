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
      // case 'overdue': return 'bg-red-100 text-red-800'
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
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { 
                margin: 0; 
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
              }
              .no-print { display: none; }
            }
            body {
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0;
              background: #f3f4f6;
              overflow: hidden; 
            }
          </style>
        </head>
        <body>
          <div class="w-[21cm] h-[29.7cm] bg-white shadow-lg p-5 overflow-y-hidden my-auto">
            <!-- Header -->
            <div class="flex justify-between items-start mb-8">
              <div>
                <h1 class="text-3xl font-bold text-blue-600">TaxPortal</h1>
                <p class="text-gray-500">Professional Tax Solutions</p>
              </div>
              <div class="text-right">
                <h2 class="text-2xl font-semibold">INVOICE</h2>
                <p class="text-gray-600">#${invoice.id}</p>
              </div>
            </div>
            
            <!-- Invoice Details -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 class="text-sm font-semibold text-gray-500 mb-2">BILLED TO</h3>
                <p class="font-medium">${invoice.customerName}</p>
              </div>
              <div class="text-right">
                <div class="mb-4">
                  <h3 class="text-sm font-semibold text-gray-500 mb-1">INVOICE DATE</h3>
                  <p>${formatDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-500 mb-1">DUE DATE</h3>
                  <p>${formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </div>
            
            <!-- Return Information -->
            <div class="mb-4 p-2 bg-blue-50 rounded-lg">
              <h3 class="text-sm font-semibold text-gray-500 mb-1">RETURN</h3>
              <p class="font-medium">${invoice.returnName}</p>
            </div>
            
            <!-- Amount -->
            <div class="border-t border-b border-gray-200 py-2 mb-3">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold">Total Amount</span>
                <span class="text-2xl font-bold text-blue-600">$${invoice.invoiceAmount.toFixed(2)} USD</span>
              </div>
            </div>
            
            <!-- Status -->
            <div class="mb-4">
              <div class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium 
                ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                  invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}">
                ${invoice.status}
              </div>
            </div>
            
            <!-- Footer -->
            <div class="mt-12 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>Thank you for your business!</p>
              <p class="mt-2">Generated on ${new Date().toLocaleDateString()}</p>
              <p class="mt-4">TaxPortal Inc. • 123 Business Ave, Suite 100 • New York, NY 10001</p>
              <p>contact@taxportal.com • (555) 123-4567</p>
            </div>
          </div>
          
          <!-- Print button (hidden when printed) -->
          <div class="no-print fixed bottom-8 right-8">
            <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors">
              Print Invoice
            </button>
          </div>
        </body>
      </html>
    `;
    
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
      const requestBody = {
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
      }
      const response = await fetch(`${BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('token')}`
           
        },
        body: JSON.stringify(requestBody)
      })
      console.log(response,"response")
      console.log(requestBody,"body")
      

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
    // { value: "Overdue", label: "Overdue" },
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
  <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        {/* <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Invoice #{viewInvoice.id}</h3>
            <p className="text-sm text-gray-500">{viewInvoice.returnName} • {viewInvoice.returnType}</p>
          </div>
        </div> */}
        <button 
          onClick={() => setViewInvoice(null)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-start flex  gap-2 items-center mb-4">
          <img src="/favicon.svg" className="w-6 h-6" alt="logo" />
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Invertio.us</h1>
          {/* <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto my-3 rounded-full"></div> */}
          
        </div>
        <h2 className="text-lg fontbold text-gray-600 mt-2">INVOICE</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Bill To:</h4>
            <p className="text-gray-900 font-medium">{viewInvoice.customerName}</p>
            <p className="text-sm text-gray-500 mt-1">ID: {viewInvoice.customerId}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600"><strong>Date:</strong></span>
              <span className="text-gray-900">{formatDate(viewInvoice.createdAt)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600"><strong>Due Date:</strong></span>
              <span className="text-gray-900">{formatDate(viewInvoice.dueDate)}</span>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
              <span className="text-gray-600"><strong>Status:</strong></span>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(viewInvoice.status)}`}>
                {viewInvoice.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 px-2">
                  <p className="font-medium text-gray-900">{viewInvoice.returnName}</p>
                  <p className="text-sm text-gray-500">{viewInvoice.returnType}</p>
                </td>
                <td className="py-2 px-2 text-right font-medium text-gray-900">${viewInvoice.invoiceAmount.toFixed(2)} USD</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="ml-auto max-w-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${viewInvoice.invoiceAmount.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tax (0%)</span>
            <span className="text-gray-900">$0.00 USD</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="font-bold text-lg text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">${viewInvoice.invoiceAmount.toFixed(2)} USD</span>
          </div>
        </div>
        
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-2">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
        {/* <button className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button> */}
        <div className="flex space-x-3">
          {/* <button className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button> */}
          <button
            onClick={() => handleDownloadInvoice(viewInvoice)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
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
          {/* {currentUser && (
            <div className="flex items-center bg-blue-50 rounded-lg p-3">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">{currentUser.name}</span>
            </div>
          )} */}
        </div>
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
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border p-6 mb-6 mt-5"
      >
        <div className="flex flex-col md:flex-row gap-4 ">
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

      
    </div>
  )
}