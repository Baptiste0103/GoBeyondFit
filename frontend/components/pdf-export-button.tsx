/**
 * PDF Export Button Component
 * Allows users to download programs as PDF
 */

'use client'

import { useState } from 'react'
import { Download, Loader } from 'lucide-react'
import { downloadProgramPDF } from '@/lib/pdf-api-client'

interface PDFExportButtonProps {
  programId: string
  programTitle: string
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  showIcon?: boolean
  fullWidth?: boolean
}

export function PDFExportButton({
  programId,
  programTitle,
  className = '',
  variant = 'primary',
  showIcon = true,
  fullWidth = false,
}: PDFExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await downloadProgramPDF(programId, programTitle)
      // Success feedback
      console.log('PDF downloaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF'
      setError(errorMessage)
      console.error('PDF download error:', err)
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  // Style variants
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  }

  const widthClass = fullWidth ? 'w-full' : 'w-auto'

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${widthClass}
          ${className}
        `}
        title="Download program as PDF"
      >
        {isLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            {showIcon && <Download size={18} />}
            <span>Download PDF</span>
          </>
        )}
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg animate-fade-in">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
    </div>
  )
}

/**
 * Floating action button version for quick access
 */
export function PDFExportFAB({
  programId,
  programTitle,
}: {
  programId: string
  programTitle: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleDownload = async () => {
    setIsLoading(true)

    try {
      await downloadProgramPDF(programId, programTitle)
      setToastMessage('PDF downloaded successfully!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF'
      setToastMessage(errorMessage)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="
          fixed bottom-8 right-8
          w-14 h-14
          bg-blue-600 hover:bg-blue-700
          text-white rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-200
          flex items-center justify-center
          disabled:opacity-50 disabled:cursor-not-allowed
          z-40
        "
        title="Download PDF"
      >
        {isLoading ? (
          <Loader size={24} className="animate-spin" />
        ) : (
          <Download size={24} />
        )}
      </button>

      {showToast && (
        <div
          className="
            fixed bottom-24 right-8
            bg-gray-900 text-white
            px-4 py-2 rounded-lg
            shadow-lg
            animate-fade-in
            z-40
          "
        >
          {toastMessage}
        </div>
      )}
    </>
  )
}
