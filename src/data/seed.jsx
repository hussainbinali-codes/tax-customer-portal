// Dummy data for the application
export const seedReturns = [
  {
    id: "1",
    type: "1040",
    status: "Pending",
    createdDate: "2024-01-15",
    lastUpdated: "2024-01-15",
    documentCount: 3,
    documents: [
      { id: "1", name: "W2_Form.pdf", type: "pdf", uploadDate: "2024-01-15", comments: "Primary W2 form" },
      {
        id: "2",
        name: "Bank_Statement.pdf",
        type: "pdf",
        uploadDate: "2024-01-15",
        comments: "January bank statement",
      },
    ],
  },
  {
    id: "2",
    type: "1065",
    status: "In Review",
    createdDate: "2024-01-10",
    lastUpdated: "2024-01-20",
    documentCount: 5,
    documents: [
      {
        id: "3",
        name: "Partnership_Agreement.docx",
        type: "docx",
        uploadDate: "2024-01-10",
        comments: "Updated partnership agreement",
      },
    ],
  },
]

export const seedInvoices = [
  {
    id: "INV-001",
    date: "2024-01-15",
    description: "Tax Return Preparation - 1040",
    amount: 250.0,
    status: "Unpaid",
  },
  {
    id: "INV-002",
    date: "2024-01-10",
    description: "Business Tax Return - 1065",
    amount: 450.0,
    status: "Paid",
  },
  {
    id: "INV-003",
    date: "2024-01-05",
    description: "Tax Consultation",
    amount: 150.0,
    status: "Unpaid",
  },
]

export const seedReceipts = [
  {
    id: "REC-001",
    invoiceId: "INV-002",
    amount: 450.0,
    paidOn: "2024-01-12",
    paymentMethod: "Mock Payment",
  },
]

export const seedActivityLogs = [
  {
    id: "1",
    timestamp: "2024-01-20T10:30:00Z",
    action: "Status Updated",
    entity: "Tax Return",
    metadata: "Return #2 status changed to In Review",
  },
  {
    id: "2",
    timestamp: "2024-01-15T14:20:00Z",
    action: "Document Uploaded",
    entity: "Tax Return",
    metadata: "W2_Form.pdf uploaded to Return #1",
  },
  {
    id: "3",
    timestamp: "2024-01-12T09:15:00Z",
    action: "Payment Processed",
    entity: "Invoice",
    metadata: "Payment of $450.00 for INV-002",
  },
]

// LocalStorage helpers
export const getStoredData = (key, defaultData) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultData
  }
  return defaultData
}

export const setStoredData = (key, data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export const addActivityLog = (action, entity, metadata) => {
  const logs = getStoredData("activityLogs", seedActivityLogs)
  const newLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    action,
    entity,
    metadata,
  }
  const updatedLogs = [newLog, ...logs]
  setStoredData("activityLogs", updatedLogs)
  return updatedLogs
}
