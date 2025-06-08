import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportData {
  vehicle: string
  exportDate: string
  overview: {
    currentSentiment: number
    totalMentions: number
    trendDirection: string
    riskLevel: string
    sentimentData: Array<{ month: string; sentiment: number; mentions: number }>
    sourceData: Array<{ name: string; value: number; color: string }>
  }
  keyInsights: Array<{
    title: string
    description: string
    sentiment: string
    impact: string
    sources: number
  }>
  explainability: {
    messages: Array<{
      id: string
      type: 'user' | 'bot'
      content: string
      timestamp: Date
    }>
    droppedInsights: Array<{
      title: string
      description: string
      sentiment: string
      impact: string
      sources: number
    }>
  }
}

export const generateJSONExport = (
  vehicle: string,
  currentSentiment: number,
  sentimentData: any[],
  sourceData: any[],
  keyInsights: any[],
  messages: any[],
  droppedInsights: any[]
): ExportData => {
  return {
    vehicle,
    exportDate: new Date().toISOString(),
    overview: {
      currentSentiment,
      totalMentions: 9250,
      trendDirection: 'Positive',
      riskLevel: 'Low',
      sentimentData,
      sourceData
    },
    keyInsights,
    explainability: {
      messages,
      droppedInsights
    }
  }
}

export const downloadJSON = (data: ExportData) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${data.vehicle.replace(/\s+/g, '_')}_sentiment_report_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const generatePDFExport = async (data: ExportData) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  pdf.setFontSize(20)
  pdf.setTextColor(220, 38, 38)
  pdf.text('Motor Valley Sentiment Analysis Report', 20, yPosition)
  
  yPosition += 15
  pdf.setFontSize(16)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Vehicle: ${data.vehicle}`, 20, yPosition)
  
  yPosition += 10
  pdf.setFontSize(12)
  pdf.text(`Export Date: ${new Date(data.exportDate).toLocaleDateString()}`, 20, yPosition)
  
  yPosition += 20
  pdf.setFontSize(16)
  pdf.setTextColor(220, 38, 38)
  pdf.text('Overview', 20, yPosition)
  
  yPosition += 15
  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Current Sentiment: ${data.overview.currentSentiment}%`, 20, yPosition)
  yPosition += 8
  pdf.text(`Total Mentions: ${data.overview.totalMentions.toLocaleString()}`, 20, yPosition)
  yPosition += 8
  pdf.text(`Trend Direction: ${data.overview.trendDirection}`, 20, yPosition)
  yPosition += 8
  pdf.text(`Risk Level: ${data.overview.riskLevel}`, 20, yPosition)
  
  yPosition += 15
  pdf.text('Sentiment Data (6 Months):', 20, yPosition)
  yPosition += 8
  data.overview.sentimentData.forEach((item) => {
    pdf.text(`${item.month}: ${item.sentiment}% (${item.mentions} mentions)`, 30, yPosition)
    yPosition += 6
  })
  
  yPosition += 10
  pdf.text('Data Sources Distribution:', 20, yPosition)
  yPosition += 8
  data.overview.sourceData.forEach((item) => {
    pdf.text(`${item.name}: ${item.value}%`, 30, yPosition)
    yPosition += 6
  })
  
  if (yPosition > pageHeight - 40) {
    pdf.addPage()
    yPosition = 20
  }
  
  yPosition += 15
  pdf.setFontSize(16)
  pdf.setTextColor(220, 38, 38)
  pdf.text('Key Insights', 20, yPosition)
  
  yPosition += 15
  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)
  
  data.keyInsights.forEach((insight, index) => {
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 20
    }
    
    pdf.setFontSize(14)
    pdf.text(`${index + 1}. ${insight.title}`, 20, yPosition)
    yPosition += 8
    
    pdf.setFontSize(12)
    pdf.text(`Sentiment: ${insight.sentiment} | Impact: ${insight.impact}`, 30, yPosition)
    yPosition += 6
    pdf.text(`Sources: ${insight.sources}`, 30, yPosition)
    yPosition += 6
    
    const descriptionLines = pdf.splitTextToSize(insight.description, pageWidth - 50)
    pdf.text(descriptionLines, 30, yPosition)
    yPosition += descriptionLines.length * 6 + 10
  })
  
  if (data.explainability.messages.length > 1) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 20
    }
    
    yPosition += 15
    pdf.setFontSize(16)
    pdf.setTextColor(220, 38, 38)
    pdf.text('Explainability - Q&A Session', 20, yPosition)
    
    yPosition += 15
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    
    data.explainability.messages.forEach((message, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 20
      }
      
      const prefix = message.type === 'user' ? 'Q:' : 'A:'
      pdf.setFont('helvetica', message.type === 'user' ? 'bold' : 'normal')
      
      const messageLines = pdf.splitTextToSize(`${prefix} ${message.content}`, pageWidth - 40)
      pdf.text(messageLines, 20, yPosition)
      yPosition += messageLines.length * 6 + 8
    })
  }
  
  const fileName = `${data.vehicle.replace(/\s+/g, '_')}_sentiment_report_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      return false
    }
  }
}
