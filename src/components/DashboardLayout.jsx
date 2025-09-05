// src/components/DashboardLayout.jsx
"use client"

import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function DashboardLayout({ children, isOpen, setIsOpen, currentPath }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} currentPath={currentPath} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar sidebarOpen={isOpen} setSidebarOpen={setIsOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}