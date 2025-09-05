"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Receipt, Download, Eye, Edit, X, User } from "lucide-react"

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    returnName: '',
    returnType: '',
    documentsCount: 0,
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    discount: 0,
    taxRate: 0
  })

  // Demo data for customers and tax returns
  const [customers] = useState([
    { id: 1, name: "John Doe", documentsCount: 3, userId: 101 },
    // { id: 2, name: "Jane Smith", documentsCount: 5, userId: 101 },
    { id: 2, name: "Robert Johnson", documentsCount: 2, userId: 102 }
  ])
  
  const [taxReturns] = useState([
    { id: 1, customerId: 1, name: "Form 1040 - 2023", type: "Individual Tax Return" },
    { id: 2, customerId: 2, name: "Form 1065 - 2023", type: "Partnership Tax Return" },
    { id: 3, customerId: 3, name: "Form 1120 - 2023", type: "Corporate Tax Return", userId: 102 }
  ])

  useEffect(() => {
    // Simulate getting the current logged-in user
    // In a real app, this would come from your authentication context or localStorage
    const loggedInUser = {
      id: 101,
      name: "Tax Professional",
      email: "taxpro@example.com"
    }
    setCurrentUser(loggedInUser)
    loadInvoices(loggedInUser.id)
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, filterStatus, searchTerm])

  const loadInvoices = async (userId) => {
    try {
      setIsLoading(true)
      
      // Demo data for all users
      const allInvoices = [
        {
          id: 1,
          customerId: 1,
          customerName: "John Doe",
          returnName: "Form 1040 - 2023",
          returnType: "Individual Tax Return",
          documentsCount: 3,
          items: [
            { description: "Tax Preparation Service", quantity: 1, rate: 299.99, amount: 299.99 },
            { description: "E-filing Fee", quantity: 1, rate: 49.99, amount: 49.99 }
          ],
          subtotal: 349.98,
          tax: 24.50,
          total: 374.48,
          status: "Paid",
          userId: 101,
          createdAt: "2023-04-15T10:30:00Z",
          updatedAt: "2023-04-15T10:30:00Z"
        },
        {
          id: 2,
          customerId: 2,
          customerName: "Jane Smith",
          returnName: "Form 1065 - 2023",
          returnType: "Partnership Tax Return",
          documentsCount: 5,
          items: [
            { description: "Business Tax Preparation", quantity: 1, rate: 499.99, amount: 499.99 },
            { description: "Consultation Services", quantity: 2, rate: 150.00, amount: 300.00 }
          ],
          subtotal: 799.99,
          tax: 56.00,
          total: 855.99,
          status: "Pending",
          userId: 101,
          createdAt: "2023-04-10T14:45:00Z",
          updatedAt: "2023-04-10T14:45:00Z"
        },
        {
          id: 3,
          customerId: 1,
          customerName: "John Doe",
          returnName: "Form 1040 - 2022 Amendment",
          returnType: "Individual Tax Return",
          documentsCount: 2,
          items: [
            { description: "Amendment Service", quantity: 1, rate: 199.99, amount: 199.99 }
          ],
          subtotal: 199.99,
          tax: 14.00,
          total: 213.99,
          status: "Overdue",
          userId: 101,
          createdAt: "2023-03-01T09:15:00Z",
          updatedAt: "2023-03-01T09:15:00Z"
        },
        {
          id: 4,
          customerId: 3,
          customerName: "Robert Johnson",
          returnName: "Form 1120 - 2023",
          returnType: "Corporate Tax Return",
          documentsCount: 2,
          items: [
            { description: "Corporate Tax Preparation", quantity: 1, rate: 799.99, amount: 799.99 }
          ],
          subtotal: 799.99,
          tax: 56.00,
          total: 855.99,
          status: "Pending",
          userId: 102,
          createdAt: "2023-04-12T11:20:00Z",
          updatedAt: "2023-04-12T11:20:00Z"
        }
      ]
      
      // Filter invoices to only show those belonging to the current user
      const userInvoices = allInvoices.filter(invoice => invoice.userId === userId)
      setInvoices(userInvoices)
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === filterStatus)
    }

    // Filter by search term
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

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    
    try {
      // Get only the customers that belong to the current user
      const userCustomers = customers.filter(c => c.userId === currentUser.id)
      const customer = userCustomers.find(c => c.id === parseInt(newInvoice.customerId))
      
      if (!customer) {
        alert("Selected customer does not belong to your account.")
        return
      }
      
      const subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0)
      const tax = subtotal * 0.08 // 8% tax
      const total = subtotal + tax
      
      const createdInvoice = {
        id: Math.max(...invoices.map(i => i.id), 0) + 1,
        customerId: newInvoice.customerId,
        customerName: customer?.name || '',
        returnName: newInvoice.returnName,
        returnType: newInvoice.returnType,
        documentsCount: newInvoice.documentsCount,
        items: [...newInvoice.items],
        subtotal,
        tax,
        total,
        status: "Pending",
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedInvoices = [...invoices, createdInvoice]
      setInvoices(updatedInvoices)

      setShowCreateModal(false)
      setNewInvoice({
        customerId: '',
        returnName: '',
        returnType: '',
        documentsCount: 0,
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        discount: 0,
        taxRate: 0
      })
      
      alert("Invoice created successfully!")
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert("Error creating invoice. Please try again.")
    }
  }

  const addLineItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    })
  }

  const removeLineItem = (index) => {
    const items = newInvoice.items.filter((_, i) => i !== index)
    setNewInvoice({ ...newInvoice, items })
  }

  const updateLineItem = (index, field, value) => {
    const items = [...newInvoice.items]
    items[index] = { ...items[index], [field]: value }
    
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate
    }
    
    setNewInvoice({ ...newInvoice, items })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
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

  const handlePrintInvoice = (invoice) => {
    // Create a new window with the invoice content
    const printWindow = window.open('', '_blank')
    const content = `
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { text-align: right; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TaxPortal Demo</h1>
            <h2>Invoice #${invoice.id}</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Customer:</strong> ${invoice.customerName}</p>
            <p><strong>Return:</strong> ${invoice.returnName} (${invoice.returnType})</p>
            <p><strong>Date:</strong> ${formatDate(invoice.createdAt)}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.rate.toFixed(2)}</td>
                  <td>$${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> $${invoice.tax.toFixed(2)}</p>
            <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `
    
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
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
          <div className="md:w-48 flex items-end">
            {/* <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </button> */}
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
                : "Get started by creating your first invoice."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
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
                        <span className="text-sm font-medium text-gray-900">#{invoice.id}</span>
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
                        <div className="text-xs text-gray-400">{invoice.documentsCount} documents</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        $${invoice.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Subtotal: $${invoice.subtotal.toFixed(2)}
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
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
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
                .reduce((sum, invoice) => sum + invoice.total, 0)
              
              return (
                <div key={status.value} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{status.label}</div>
                  <div className="text-xs text-gray-500 mt-1">${total.toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Invoice</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  required
                  value={newInvoice.customerId}
                  onChange={(e) => {
                    // Filter customers to only show those belonging to the current user
                    const userCustomers = customers.filter(c => c.userId === currentUser.id)
                    const customer = userCustomers.find(c => c.id === parseInt(e.target.value))
                    const customerReturns = taxReturns.filter(r => r.customerId === parseInt(e.target.value))
                    setNewInvoice({
                      ...newInvoice,
                      customerId: e.target.value,
                      returnName: customerReturns[0]?.name || '',
                      returnType: customerReturns[0]?.type || '',
                      documentsCount: customer?.documentsCount || 0
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers
                    .filter(customer => customer.userId === currentUser.id)
                    .map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))
                  }
                </select>
              </div>

              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          readOnly
                          value={item.amount.toFixed(2)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      <div className="col-span-1">
                        {newInvoice.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="mt-3 text-blue-600 hover:text-blue-700 transition-colors text-sm flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Line Item
                </button>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}