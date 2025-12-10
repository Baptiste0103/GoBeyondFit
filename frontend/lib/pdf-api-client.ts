/**
 * PDF Export API Client
 * Handle PDF generation and download for programs
 */

import { authClient } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Download program as PDF
 * @param programId - The ID of the program to export
 * @param programTitle - The title of the program (used for filename)
 */
export async function downloadProgramPDF(
  programId: string,
  programTitle: string = 'program'
): Promise<void> {
  try {
    const token = authClient.getToken()

    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/export/programs/${programId}/pdf`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to generate PDF: ${error}`)
    }

    // Get filename from response headers or generate one
    const contentDisposition = response.headers.get('content-disposition')
    let filename = `${programTitle.replace(/\s+/g, '_')}.pdf`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Convert response to blob and download
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    throw error
  }
}

/**
 * Get available export formats
 */
export async function getExportFormats(): Promise<Array<{ format: string; description: string }>> {
  try {
    const token = authClient.getToken()

    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/export/formats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get export formats')
    }

    const data = await response.json()
    return data.formats || []
  } catch (error) {
    console.error('Error fetching export formats:', error)
    return []
  }
}

/**
 * Check PDF export service health
 */
export async function checkPDFServiceHealth(): Promise<boolean> {
  try {
    const token = authClient.getToken()

    if (!token) {
      return false
    }

    const response = await fetch(`${API_URL}/export/pdf/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('PDF service health check failed:', error)
    return false
  }
}
