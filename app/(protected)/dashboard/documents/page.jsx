"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
// import Sidebar from "../components/Sidebar"
// import Topbar from "../components/Topbar"
import DocumentList from "@/src/components/DocumentList"
import FileUpload from "@/src/components/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, FolderOpen, FileText, ImageIcon, File, Search } from "lucide-react"
import { getStoredData, setStoredData, addActivityLog } from "@/src/data/seed"
import { validateFileType, validateFileSize } from "@/src//utils/validators"

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [documents, setDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    // Load documents from localStorage and tax returns
    const returns = getStoredData("returns", [])
    const allDocuments = []

    // Collect documents from all tax returns
    returns.forEach((returnItem) => {
      if (returnItem.documents) {
        returnItem.documents.forEach((doc) => {
          allDocuments.push({
            ...doc,
            returnId: returnItem.id,
            returnType: returnItem.type,
            source: "Tax Return",
          })
        })
      }
    })

    // Load standalone documents
    const standaloneDocuments = getStoredData("documents", [])
    allDocuments.push(...standaloneDocuments)

    setDocuments(allDocuments)
  }, [])

  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/msexcel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
  ]

  const handleFileUpload = (files) => {
    const validFiles = []
    const errors = []

    Array.from(files).forEach((file) => {
      if (!validateFileType(file, allowedFileTypes)) {
        errors.push(`${file.name}: Invalid file type`)
        return
      }

      if (!validateFileSize(file, 10)) {
        errors.push(`${file.name}: File too large (max 10MB)`)
        return
      }

      const newDocument = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes("pdf")
          ? "pdf"
          : file.type.includes("word") || file.type.includes("document")
            ? "docx"
            : "image",
        size: file.size,
        uploadDate: new Date().toISOString().split("T")[0],
        comments: "",
        source: "Standalone",
        file: file,
      }

      validFiles.push(newDocument)
    })

    if (validFiles.length > 0) {
      const updatedDocuments = [...documents, ...validFiles]
      setDocuments(updatedDocuments)

      // Save standalone documents
      const standaloneDocuments = getStoredData("documents", [])
      const newStandaloneDocuments = [...standaloneDocuments, ...validFiles]
      setStoredData("documents", newStandaloneDocuments)

      // Add activity log
      validFiles.forEach((doc) => {
        addActivityLog("Document Uploaded", "Document", `${doc.name} uploaded to document library`)
      })

      setShowUpload(false)
    }
  }

  const handleUpdateDocument = (documentId, updates) => {
    const updatedDocuments = documents.map((doc) => (doc.id === documentId ? { ...doc, ...updates } : doc))
    setDocuments(updatedDocuments)

    // Update in appropriate storage
    const document = documents.find((doc) => doc.id === documentId)
    if (document?.returnId) {
      // Update in tax returns
      const returns = getStoredData("returns", [])
      const updatedReturns = returns.map((returnItem) => {
        if (returnItem.id === document.returnId) {
          return {
            ...returnItem,
            documents: returnItem.documents.map((doc) => (doc.id === documentId ? { ...doc, ...updates } : doc)),
          }
        }
        return returnItem
      })
      setStoredData("returns", updatedReturns)
    } else {
      // Update standalone documents
      const standaloneDocuments = getStoredData("documents", [])
      const updatedStandaloneDocuments = standaloneDocuments.map((doc) =>
        doc.id === documentId ? { ...doc, ...updates } : doc,
      )
      setStoredData("documents", updatedStandaloneDocuments)
    }

    // Add activity log
    addActivityLog("Document Updated", "Document", `${document?.name} was modified`)
  }

  const handleDeleteDocument = (documentId) => {
    const document = documents.find((doc) => doc.id === documentId)
    const updatedDocuments = documents.filter((doc) => doc.id !== documentId)
    setDocuments(updatedDocuments)

    if (document?.returnId) {
      // Remove from tax returns
      const returns = getStoredData("returns", [])
      const updatedReturns = returns.map((returnItem) => {
        if (returnItem.id === document.returnId) {
          return {
            ...returnItem,
            documents: returnItem.documents.filter((doc) => doc.id !== documentId),
            documentCount: returnItem.documents.filter((doc) => doc.id !== documentId).length,
          }
        }
        return returnItem
      })
      setStoredData("returns", updatedReturns)
    } else {
      // Remove from standalone documents
      const standaloneDocuments = getStoredData("documents", [])
      const updatedStandaloneDocuments = standaloneDocuments.filter((doc) => doc.id !== documentId)
      setStoredData("documents", updatedStandaloneDocuments)
    }

    // Add activity log
    addActivityLog("Document Deleted", "Document", `${document?.name} was deleted`)
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.comments.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || doc.type === filterType
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: documents.length,
    pdf: documents.filter((doc) => doc.type === "pdf").length,
    docx: documents.filter((doc) => doc.type === "docx").length,
    images: documents.filter((doc) => doc.type === "image").length,
    totalSize: documents.reduce((sum, doc) => sum + (doc.size || 0), 0),
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Topbar  /> */}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Library</h1>
                <p className="text-gray-600">Manage and organize all your uploaded documents in one place.</p>
              </div>
              <Button onClick={() => setShowUpload(true)} className="w-fit">
                <Plus className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">{formatFileSize(stats.totalSize)} total</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">PDF Files</CardTitle>
                    <FileText className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.pdf}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Word Documents</CardTitle>
                    <File className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.docx}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Images</CardTitle>
                    <ImageIcon className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.images}</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search documents by name or comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={filterType === "pdf" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("pdf")}
                >
                  PDF ({stats.pdf})
                </Button>
                <Button
                  variant={filterType === "docx" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("docx")}
                >
                  Word ({stats.docx})
                </Button>
                <Button
                  variant={filterType === "image" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("image")}
                >
                  Images ({stats.images})
                </Button>
              </div>
            </div>

            {/* Document List */}
            <DocumentList
              documents={filteredDocuments}
              onUpdate={handleUpdateDocument}
              onDelete={handleDeleteDocument}
            />
          </motion.div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUpload(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-2xl"
          >
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upload Documents</CardTitle>
                    <CardDescription>Add new documents to your library</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <FileUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Documents
