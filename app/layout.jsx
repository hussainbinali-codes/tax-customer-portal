// import { GeistSans } from "geist/font/sans"
// import { GeistMono } from "geist/font/mono"
// import { Analytics } from "@vercel/analytics/next"
// import "./globals.css"
// import { Suspense } from "react"

// export const metadata = {
//   title: "Invertio.us – Invertio Taxation Company",
//   description:
//     "Professional taxation management platform with comprehensive document handling, payment processing, and business management solutions",
//   keywords: "taxation, business management, document handling, payment processing, tax returns, Invertio",
//   authors: [{ name: "Invertio Taxation Company" }],
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
//         <Suspense fallback={null}>{children}</Suspense>
//         <Analytics />
//       </body>
//     </html>
//   )
// }

// app/layout.js
import { AuthProvider } from "@/src/contexts/AuthContext"
import './globals.css'
import DashboardLayout from "@/src/components/DashboardLayout"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        {/* <DashboardLayout> */}

          {children}
        {/* </DashboardLayout> */}

        </AuthProvider>
      </body>
    </html>
  )
}