import jsPDF from "jspdf"

export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const generateReceiptPDF = (invoice, paymentDetails) => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text("Payment Receipt", 20, 30)

  // Receipt details
  doc.setFontSize(12)
  doc.text(`Receipt ID: REC-${Date.now()}`, 20, 50)
  doc.text(`Invoice ID: ${invoice.id}`, 20, 60)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70)
  doc.text(`Amount: $${invoice.amount.toFixed(2)}`, 20, 80)
  doc.text(`Payment Method: ${paymentDetails.method}`, 20, 90)
  doc.text(`Description: ${invoice.description}`, 20, 100)

  // Footer
  doc.text("Thank you for your payment!", 20, 120)

  return doc
}

export const downloadPDF = (doc, filename) => {
  doc.save(filename)
}
