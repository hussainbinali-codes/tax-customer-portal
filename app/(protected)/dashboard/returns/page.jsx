"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Users,
  Search,
  ArrowLeft,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  DollarSign,
  MessageSquare,
  Paperclip,
  X,
  Loader2,
  Download,
  FileCheck2,
  FilePenLine,
  FileUp,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
} from "lucide-react"
import ReturnForm from "@/src/components/ReturnForm"
import { setStoredData } from "@/src/data/seed"
import {BASE_URL} from "@/src/components/BaseUrl"

// Helper components
function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString()
}

function StatusPill({ status }) {
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
  const tone =
    status === "Filed" || status === "Document verified"
      ? "bg-green-100 text-green-800"
      : status === "In Progress" || status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-blue-100 text-blue-800"

  return <span className={`${base} ${tone}`}>{status}</span>
}

function DocIcon({ type, className }) {
  const c = `h-5 w-5 ${className || ""}`
  if (type === "pdf") return <FileText className={c} />
  if (type === "csv") return <FileSpreadsheet className={c} />
  if (type === "zip") return <FileArchive className={c} />
  if (["image", "jpg", "jpeg", "png"].includes(type)) return <FileImage className={c} />
  return <FileText className={c} />
}

const Returns = () => {
  const getUserId = () => {
    try {
      const userString = localStorage.getItem("userProfile")
      const user = userString ? JSON.parse(userString) : null
      return user?.uid || localStorage.getItem("loginId") // Fallback to old method
    } catch (error) {
      console.error("Error parsing user profile:", error)
      return localStorage.getItem("loginId")
    }
  }

  const loginId = getUserId()
  const role = localStorage.getItem("role")
  const userId = loginId

  const [returns, setReturns] = useState([])
  const [allReturnsData, setAllReturnsData] = useState([]) // Store complete returns data
  const [showForm, setShowForm] = useState(false)
  const [editingReturn, setEditingReturn] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // CustomerDetail state
  const [selectedReturnId, setSelectedReturnId] = useState(null)
  const [returnDetails, setReturnDetails] = useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [composerAttachments, setComposerAttachments] = useState([])
  const [timeline, setTimeline] = useState([])
  const [customerId, setCustomerId] = useState(null)
  const [returnId, setReturnId] = useState(null)
  const [customerName, setCustomerName] = useState("Unknown")
  const [userProfile, setUserProfile] = useState(null)
  const [updated, setUpdated] = useState(false)
  const fileInputRef = useRef(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchReturns = useCallback(async () => {
    if (!userId) {
      setError("User ID not found in localStorage")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://662ea1b4973e.ngrok-free.app/api/tax-returns/${userId}`,
        {
          headers : {
            "ngrok-skip-browser-warning": "true"
          }
        }
      )
      console.log("Fetch returns response:", response)

      if (!response.ok) {
        throw new Error(`Failed to fetch returns: ${response.status}`)
      }

      const data = await response.json()

      setAllReturnsData(data)

      // Transform API data to match our expected format
      const transformedReturns = data.map((returnItem) => ({
      
        id: returnItem.id.toString(),
        name: returnItem.tax_name || `Return #${returnItem.id}`,
        type: returnItem.return_type,
        price: returnItem.price,
        pricing_type: returnItem.pricing_type,
        status: returnItem.status,
        documentCount: returnItem.document_ids ? returnItem.document_ids.length : 0,
        createdDate: new Date(returnItem.modified_at).toISOString().split("T")[0],
        lastUpdated: new Date(returnItem.modified_at).toISOString().split("T")[0],
        taxYear: "2023",
        originalData: returnItem,
      }))
      console.log(data)

      setReturns(transformedReturns)
    } catch (error) {
      console.error("Error fetching returns:", error)
      setError("Failed to fetch returns from server")
      setReturns([])
    } finally {
      setLoading(false)
    }
  }, [userId, refreshTrigger])

  const handleAddReturn = (newReturn) => {
    const returnWithId = {
      ...newReturn,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Pending",
      documentCount: newReturn.documents?.length || 0,
    }

    const updatedReturns = [returnWithId, ...returns]
    setReturns(updatedReturns)
    setStoredData("returns", updatedReturns)

    setShowForm(false)
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh after adding a new return
  }

  const handleUpdateReturn = (updatedReturn) => {
    const updatedReturns = returns.map((r) =>
      r.id === updatedReturn.id
        ? {
            ...updatedReturn,
            lastUpdated: new Date().toISOString().split("T")[0],
            documentCount: updatedReturn.documents?.length || 0,
          }
        : r,
    )
    setReturns(updatedReturns)
    setStoredData("returns", updatedReturns)

    setEditingReturn(null)
    setShowForm(false)
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh after updating a return
  }

  const fetchReturnDetails = useCallback(
    async (id) => {
      if (!id) return

      setIsLoadingDetail(true)
      setError(null)

      try {
        const existingReturnData = allReturnsData.find((returnItem) => returnItem.id.toString() === id.toString())

        if (existingReturnData) {
          setReturnDetails(existingReturnData)
        } else {
          // Fallback to API call if data not found (shouldn't happen normally)
          const detailsResponse = await fetch(`${BASE_URL}/api/tax-returns/${id}`)
          if (detailsResponse.ok) {
            const details = await detailsResponse.json()
            setReturnDetails(details)
          }
        }

        // Still fetch documents and timeline as these are separate endpoints
        const [documentsResponse, timelineResponse] = await Promise.all([
          fetch(`${BASE_URL}/api/documents/${id}`).catch(() => ({ ok: false })),
          fetch(`${BASE_URL}/api/comments/${id}`).catch(() => ({ ok: false })),
        ])

        // Handle documents
        if (documentsResponse.ok) {
          const docs = await documentsResponse.json()
          setDocuments(docs)

          if (docs.length > 0) {
            const documentLink = docs[0].document_link || ""
            const customerNameFromLink = documentLink.split(/[\\/]/).pop()?.split("_")[0] || "Unknown"
            setCustomerName(customerNameFromLink)
            setReturnId(docs[0].return_id)
            setCustomerId(docs[0].customer_id)
          }
        }

        // Handle timeline
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json()
          setTimeline(timelineData)
        }
      } catch (error) {
        console.error("Failed to fetch return details:", error)
        setError("Failed to load return details")
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [allReturnsData],
  )

  const downloadDocument = useCallback(async (doc) => {
    try {
      if (!doc.document_link) {
        alert("Document link not available")
        return
      }

      const cleanPath = doc.document_link.replace(/\\/g, "/")
      const fileName = doc.doc_name || cleanPath.split("/").pop() || "document"
      const downloadUrl = `${BASE_URL}/api/download?documentLink=${encodeURIComponent(doc.document_link)}`

      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error(`Download failed: ${response.status}`)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()

      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Failed to download document. Please try again.")
    }
  }, [])

  // Initial data loading
  useEffect(() => {
    fetchReturns()
  }, [fetchReturns])

  useEffect(() => {
    // Load user profile from localStorage
    const loadUserProfile = () => {
      try {
        const storedProfile = localStorage.getItem("userProfile")
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile)
          setUserProfile(parsedProfile)
          return parsedProfile
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
        setError("Failed to load user profile")
      }
      return null
    }

    const profile = loadUserProfile()
  }, [])

  // Load detailed data when a return is selected
  useEffect(() => {
    if (selectedReturnId) {
      fetchReturnDetails(selectedReturnId)
    }
  }, [selectedReturnId, fetchReturnDetails])

  const uploadDocuments = async (files) => {
    if (!files || files.length === 0) return []

    const formData = new FormData()
    formData.append("customerId", customerId)
    formData.append("taxReturnId", returnId)
    formData.append("createdby_id", loginId)
    formData.append("createdby_type", role || "customer")
    formData.append("customerName", customerName)
    formData.append("comment", newComment)
    formData.append("category", returnDetails?.return_type || "Tax Return")
    files.forEach((file) => {
      formData.append("documents", file)
    })

    try {
      const response = await fetch(`${BASE_URL}/api/upload-documents`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error("Error uploading documents:", error)
      throw error
    }
  }

  const postCommentOnly = async (comment) => {
    const formData = new FormData()
    formData.append("customerId", customerId)
    formData.append("taxReturnId", returnId)
    formData.append("createdby_id", loginId)
    formData.append("createdby_type", role || "customer")
    formData.append("customerName", customerName)
    formData.append("comment", comment)
    formData.append("category", returnDetails?.return_type || "Tax Return")

    try {
      const response = await fetch(`${BASE_URL}/api/upload-documents`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(`Comment post failed: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error("Error posting comment:", error)
      throw error
    }
  }

  const addComment = async () => {
    if (!newComment.trim() && composerAttachments.length === 0) {
      alert("Please add a comment or attach files")
      return
    }

    try {
      setIsUploading(true)
      let uploadedDocuments = []

      if (composerAttachments.length > 0) {
        // Has attachments - use document upload API
        const filesToUpload = composerAttachments.map((attachment) => attachment.file).filter(Boolean)
        if (filesToUpload.length > 0) {
          uploadedDocuments = await uploadDocuments(filesToUpload)
        }
      } else if (newComment.trim()) {
        // Comment only - use comment posting API
        await postCommentOnly(newComment.trim())
      }

      setNewComment("")
      setComposerAttachments([])

      if (selectedReturnId) {
        await fetchReturnDetails(selectedReturnId)
      }

      // alert(`Successfully ${uploadedDocuments.length > 0 ? "uploaded documents and " : ""}added comment!`)
    } catch (error) {
      console.error("Error adding comment/uploading documents:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const created = files.map((f, i) => ({
      id: `att_${Date.now()}_${i}`,
      name: f.name,
      type: f.type.includes("image") ? "image" : f.name.split(".").pop() || "other",
      uploadedAt: new Date().toISOString(),
      file: f,
    }))

    setComposerAttachments((prev) => [...prev, ...created])
    e.currentTarget.value = ""
  }

  // Calculate stats from API data
  const stats = {
    total: returns.length,
    inReview: returns.filter((r) => r.status.toLowerCase() === "in review").length,
    initialRequest: returns.filter((r) => r.status.toLowerCase() === "initial request").length,
    documentVerified: returns.filter((r) => r.status.toLowerCase() === "document verified").length,
    inPreparation: returns.filter((r) => r.status.toLowerCase() === "in preparation").length,
    readyToFile: returns.filter((r) => r.status.toLowerCase() === "ready to file").length,
    filed: returns.filter((r) => r.status.toLowerCase() === "filed return").length,
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "document verified":
      case "filed return":
        return "bg-green-100 text-green-800"
      case "in review":
        return "bg-blue-100 text-blue-800"
      case "in preparation":
        return "bg-indigo-100 text-indigo-800"
      case "ready to file":
        return "bg-purple-100 text-purple-800"
      case "initial request":
        return "bg-amber-100 text-amber-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get unique statuses and types for filter options
  const statusOptions = ["all", ...new Set(returns.map(item => item.status))];
  const typeOptions = ["all", ...new Set(returns.map(item => item.type))];

  // Filter returns based on search term and filters
  const filteredReturns = returns.filter((returnItem) => {
    // Text search - search across multiple fields
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      returnItem.id.toString().toLowerCase().includes(searchTermLower) ||
      returnItem.type?.toLowerCase().includes(searchTermLower) ||
      returnItem.status?.toLowerCase().includes(searchTermLower) ||
      returnItem.name?.toLowerCase().includes(searchTermLower);
    
    // Status filter
    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === "all" || returnItem.type === typeFilter;
    
    // Date filter (simplified implementation)
    const matchesDate = dateFilter === "all" || true; // Add date filtering logic as needed
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const detailedReturns = returnDetails
    ? [
        {
          id: returnDetails.id?.toString() || selectedReturnId,
          name: returnDetails.return_type || `Return #${selectedReturnId}`,
          type: returnDetails.createdby_type || "Tax Return",
          status: returnDetails.status || "In Progress",
          updatedAt: returnDetails.modified_at || new Date().toISOString(),
          details: `Return type: ${returnDetails.return_type || "N/A"}. Status: ${returnDetails.status || "In Progress"}`,
          price: returnDetails.price,
          pricing_type: returnDetails.pricing_type,
        },
      ]
    : []

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col ">
        <main className="flex-1  p-4 lg:p-6">
          {selectedReturnId ? (
            // Customer Detail View
            <div className="mx-auto max-w-6xl space-y-6">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-md p-2 hover:bg-gray-100"
                    onClick={() => setSelectedReturnId(null)}
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">Return Details</h1>
                </div>
              </header>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {isLoadingDetail ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <section className="space-y-3">
                  {detailedReturns.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No tax return details found</h3>
                      <p className="mt-1 text-sm text-gray-500">Could not load details for this return.</p>
                    </div>
                  ) : (
                    detailedReturns.map((r) => (
                      <div key={r.id} className="rounded-md border border-gray-200 bg-white">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="text-gray-900">{r.name}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">status:</span>
                            <StatusPill status={r.status} />
                          </div>
                        </div>

                        <div className="border-t">
                          <div className="grid items-start gap-4 p-4 md:grid-cols-4 md:p-6">
                            <div className="md:col-span-3 rounded-md border border-gray-200 bg-white">
                              <div className="p-4 md:p-6">
                                <h2 className="mb-2 text-lg font-semibold text-gray-900">Return details</h2>
                                <p className="text-pretty text-sm leading-6 text-gray-700">{r.details}</p>
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <div className="text-gray-500">Return</div>
                                    <div className="font-medium text-gray-900">{r.name}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Type</div>
                                    <div className="font-medium text-gray-900">{r.type}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Last updated</div>
                                    <div className="font-medium text-gray-900">{formatDate(r.updatedAt)}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Status</div>
                                    <StatusPill status={r.status} />
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-gray-200 p-4 md:p-5">
                                <div className="mb-2 text-sm font-medium text-gray-900">
                                  Documents ({documents.length})
                                </div>
                                <div className="flex items-stretch gap-4 overflow-x-auto">
                                  {documents.map((d) => (
                                    <div
                                      key={d.id}
                                      className="group relative flex h-16 w-24 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
                                      title={d.doc_name}
                                    >
                                      <DocIcon type={d.doc_type} className="text-gray-600 h-5 w-5" />
                                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        {d.doc_name && d.doc_name.length > 14
                                          ? d.doc_name.slice(0, 14) + "…"
                                          : d.doc_name || "Document"}
                                      </div>
                                      <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                          className="rounded bg-white/90 p-1 hover:bg-white"
                                          aria-label="View"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            alert(`Viewing ${d.doc_name || "document"}`)
                                          }}
                                        >
                                          <Eye className="h-3.5 w-3.5 text-gray-700" />
                                        </button>
                                        <button
                                          className="rounded bg-white/90 p-1 hover:bg-white"
                                          aria-label="Download"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            downloadDocument(d)
                                          }}
                                        >
                                          <Download className="h-3.5 w-3.5 text-gray-700" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {documents.length === 0 && (
                                    <div className="text-sm text-gray-500 py-4">No documents found for this return</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <aside className="self-start rounded-md border border-gray-200 bg-white p-4 md:p-6">
                              <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
                                <DollarSign className="h-5 w-5 text-blue-600" />
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type</label>
                                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                                    {r.pricing_type ? (r.pricing_type === "hourly" ? "Hourly" : "Lump Sum") : "Not set"}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                                    {r.price ? `$${r.price}` : "Not set"}
                                  </div>
                                </div>
                              </div>
                            </aside>

                            <div className="md:col-span-4 rounded-md border border-gray-200 bg-white p-4 md:p-6">
                              <div className="grid gap-6">
                                <div className="rounded-md border border-gray-200 bg-white p-3 md:p-4">
                                  <div className="mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">
                                      Add Comment & Upload Documents
                                    </span>
                                  </div>
                                  <div className="mb-3">
                                    <textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Write a comment or attach documents..."
                                      rows={4}
                                      className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="mt-2 flex items-center justify-between">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <input
                                          ref={fileInputRef}
                                          type="file"
                                          multiple
                                          accept=".pdf,.jpg,.jpeg,.png,.csv,.zip"
                                          className="sr-only"
                                          onChange={onFilesSelected}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => fileInputRef.current?.click()}
                                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                          disabled={isUploading}
                                        >
                                          <Paperclip className="h-4 w-4" />
                                          Attach Files
                                        </button>
                                        {composerAttachments.map((a) => (
                                          <span
                                            key={a.id}
                                            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                                          >
                                            <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                                            {a.name}
                                            <button
                                              type="button"
                                              aria-label="Remove attachment"
                                              className="rounded p-0.5 hover:bg-gray-200"
                                              onClick={() =>
                                                setComposerAttachments((prev) => prev.filter((d) => d.id !== a.id))
                                              }
                                            >
                                              <X className="h-3 w-3 text-gray-500" />
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={addComment}
                                        disabled={
                                          isUploading || (!newComment.trim() && composerAttachments.length === 0)
                                        }
                                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isUploading ? (
                                          <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                          </>
                                        ) : (
                                          "Post Comment"
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-md border border-gray-200 bg-white p-3 md:p-4">
                                  <div className="mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">Documents Timeline</span>
                                  </div>

                                  <ol className="relative mt-3 max-h-96 overflow-y-auto">
                                    {timeline.map((t, index) => (
                                      <li key={t.id} className="flex">
                                        <div className="flex flex-col items-center flex-shrink-0 mr-4">
                                          {index !== 0 && <div className="w-0.5 h-4 bg-blue-100 mb-1"></div>}

                                          <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100 z-10"></div>

                                          {index !== timeline.length - 1 && (
                                            <div className="w-0.5 h-4 bg-blue-100 mt-1 flex-grow"></div>
                                          )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="p-3 rounded-md border border-gray-100 bg-gray-50">
                                            <div className="mb-1 flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                  {t.created_by_name} ({t.createdby_type})
                                                </span>
                                              </div>
                                              <span className="text-xs text-gray-500">
                                                {formatDateTime(t.created_at)}
                                              </span>
                                            </div>

                                            {t.comment && <p className="text-sm text-gray-700">{t.comment}</p>}

                                            <div className="mt-2 text-xs text-gray-500">
                                              Return ID: {t.return_id} | Document IDs: {t.document_ids}
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                    {timeline.length === 0 && (
                                      <li className="text-sm text-gray-500 py-4 text-center">No activity yet</li>
                                    )}
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </section>
              )}
            </div>
          ) : (
            // Main Returns List View
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tax Returns</h1>
                  <p className="text-gray-600">Manage your tax return filings and track their progress.</p>
                  {userId && <p className="text-sm text-gray-500">User ID: {userId}</p>}
                </div>

                <Button
                  onClick={() => {
                    setEditingReturn(null)
                    setShowForm(true)
                  }}
                  className="w-fit"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Tax Return
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
  {/* In Review Card */}
  <motion.div 
    whileHover={{ y: -3 }} 
    transition={{ duration: 0.2 }}
    className="rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-white text-black"
  >
    <div className="flex flex-col items-start justify-between mb-2 gap-2">
      <div className="p-1.5 rounded-lg bg-blue-100">
        <FileText className="h-4 w-4 text-blue-600" />
      </div>
      <h3 className="text-xs font-medium text-blue-600">In Review</h3>
    </div>
    <div>
      <div className="text-xl font-bold text-blue-600">{stats.inReview}</div>
      <div className="mt-0.5 text-xs text-blue-600 flex items-center">
        <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
        <span className="text-blue-600 font-medium">
          {stats.total > 0 ? Math.round((stats.inReview / stats.total) * 100) : 0}%
        </span> of total
      </div>
    </div>
  </motion.div>

  {/* Initial Request Card */}
  <motion.div 
    whileHover={{ y: -3 }} 
    transition={{ duration: 0.2 }}
    className="rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-white text-black"
  >
    <div className="flex flex-col items-start justify-between mb-2 gap-2">
      <div className="p-1.5 rounded-lg bg-amber-100">
        <Clock className="h-4 w-4 text-amber-600" />
      </div>
      <h3 className="text-xs font-medium text-amber-600">Initial Request</h3>
    </div>
    <div>
      <div className="text-xl font-bold text-amber-600">{stats.initialRequest}</div>
      <div className="mt-0.5 text-xs text-amber-600 flex items-center">
        <TrendingUp className="h-3 w-3 text-amber-300 mr-1" />
        <span className="text-amber-300 font-medium">
          {stats.total > 0 ? Math.round((stats.initialRequest / stats.total) * 100) : 0}%
        </span> of total
      </div>
    </div>
  </motion.div>

  {/* Document Verified Card */}
  <motion.div 
    whileHover={{ y: -3 }} 
    transition={{ duration: 0.2 }}
    className="rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-white text-black"
  >
    <div className="flex flex-col items-start justify-between mb-2 gap-2">
      <div className="p-1.5 rounded-lg bg-green-100">
        <FileCheck2 className="h-4 w-4 text-green-600" />
      </div>
      <h3 className="text-xs font-medium text-green-600">Document Verified</h3>
    </div>
    <div>
      <div className="text-xl font-bold text-green-600">{stats.documentVerified}</div>
      <div className="mt-0.5 text-xs text-green-600 flex items-center">
        <TrendingUp className="h-3 w-3 text-green-300 mr-1" />
        <span className="text-green-300 font-medium">
          {stats.total > 0 ? Math.round((stats.documentVerified / stats.total) * 100) : 0}%
        </span> of total
      </div>
    </div>
  </motion.div>

  {/* In Preparation Card */}
  <motion.div 
    whileHover={{ y: -3 }} 
    transition={{ duration: 0.2 }}
    className="rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-white"
  >
    <div className="flex flex-col items-start justify-between mb-2 gap-2">
      <div className="p-1.5 rounded-lg bg-indigo-100">
        <FilePenLine className="h-4 w-4 text-indigo-600" />
      </div>
      <h3 className="text-xs font-medium text-indigo-600">In Preparation</h3>
    </div>
    <div>
      <div className="text-xl font-bold text-indigo-600">{stats.inPreparation}</div>
      <div className="mt-0.5 text-xs text-indigo-600 flex items-center">
        <TrendingUp className="h-3 w-3 text-indigo-300 mr-1" />
        <span className="text-indigo-300 font-medium">
          {stats.total > 0 ? Math.round((stats.inPreparation / stats.total) * 100) : 0}%
        </span> of total
      </div>
    </div>
  </motion.div>

  {/* Ready to File Card */}
  <motion.div 
    whileHover={{ y: -3 }} 
    transition={{ duration: 0.2 }}
    className="rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-white "
  >
    <div className="flex flex-col items-start justify-between mb-2 gap-2">
      <div className="p-1.5 rounded-lg bg-purple-100">
        <FileUp className="h-4 w-4 text-purple-600" />
      </div>
      <h3 className="text-xs font-medium text-purple-600">Ready to File</h3>
    </div>
    <div>
      <div className="text-xl font-bold text-purple-600">{stats.readyToFile}</div>
      <div className="mt-0.5 text-xs text-purple-600 flex items-center">
        <TrendingUp className="h-3 w-3 text-purple-300 mr-1" />
        <span className="text-purple-300 font-medium">
          {stats.total > 0 ? Math.round((stats.readyToFile / stats.total) * 100) : 0}%
        </span> of total
      </div>
    </div>
  </motion.div>

  {/* Filed Return Card */}
  <motion.div 
    whileHover={{ y: -3 }} 
    transition={{ duration: 0.2 }}
    className="rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-teal-500 to-teal-600 text-white"
  >
    <div className="flex flex-col items-start justify-between mb-2 gap-2">
      <div className="p-1.5 rounded-lg bg-teal-100">
        <CheckCircle className="h-4 w-4 text-teal-600" />
      </div>
      <h3 className="text-xs font-medium text-white">Filed Return</h3>
    </div>
    <div>
      <div className="text-xl font-bold text-white">{stats.filed}</div>
      <div className="mt-0.5 text-xs text-white flex items-center">
        <TrendingUp className="h-3 w-3 text-teal-300 mr-1" />
        <span className="text-teal-300 font-medium">
          {stats.total > 0 ? Math.round((stats.filed / stats.total) * 100) : 0}%
        </span> of total
      </div>
    </div>
  </motion.div>
</div>

              {/* Search and Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search returns by ID, type, status, or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setTypeFilter("all")
                          setDateFilter("all")
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Expanded Filters */}
                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        {statusOptions.filter(opt => opt !== "all").map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Types</option>
                        {typeOptions.filter(opt => opt !== "all").map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Returns Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Return ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          company/Person Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documents
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Return Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReturns.map((returnItem) => (
                        <tr key={returnItem.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{returnItem.id}</div>
                          </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{returnItem.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{returnItem.documentCount} files</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{returnItem.type}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(returnItem.status)}`}
                            >
                              {returnItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(returnItem.lastUpdated)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                title="View Details"
                                onClick={() => setSelectedReturnId(returnItem.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-gray-600 hover:text-gray-700 transition-colors"
                                title="Edit Return"
                                onClick={() => {
                                  setEditingReturn(returnItem)
                                  setShowForm(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredReturns.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all" 
                        ? "Try adjusting your search or filter terms." 
                        : "Get started by adding a new return."}
                    </p>
                  </div>
                )}
              </div>
              </>
            </motion.div>
          )}
        </main>
      </div>
      {showForm && (
        <ReturnForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingReturn(null)
          }}
          onSubmit={editingReturn ? handleUpdateReturn : handleAddReturn}
          editingReturn={editingReturn}
          customer={
            userProfile
              ? {
                  id: userProfile.uid,
                  name: userProfile.displayName,
                  token: userProfile.token,

                  onReturnAdded: () => setRefreshTrigger((prev) => prev + 1),
                }
              : null
          }
        />
      )}
    </div>
  )
}

export default Returns