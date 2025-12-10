'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2, Upload, X } from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'

interface VideoUploaderProps {
  progressId?: string
  onUploadSuccess?: (mediaId: string) => void
  onUploadError?: (error: string) => void
  disabled?: boolean
}

export function VideoUploader({
  progressId,
  onUploadSuccess,
  onUploadError,
  disabled = false,
}: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadSuccess(null)

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Please upload MP4, MOV, or AVI video files.`)
      return
    }

    // Validate file size (max 100MB for uploaded files, more than recorded)
    const maxSizeMB = 100
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${maxSizeMB}MB`)
      return
    }

    // Get video duration and preview
    const video = document.createElement('video')
    const reader = new FileReader()

    reader.onload = (e) => {
      video.src = e.target?.result as string
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration)
        setVideoFile(file)
      }
      video.onerror = () => {
        setUploadError('Failed to read video file. Please ensure it is a valid video.')
      }
    }

    reader.onerror = () => {
      setUploadError('Failed to read file')
    }

    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!videoFile || !progressId) {
      setUploadError('No video selected or missing progress ID')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      console.log('🔵 [VideoUploader] Starting upload for progressId:', progressId)
      console.log('🔵 [VideoUploader] File:', videoFile.name, 'Size:', (videoFile.size / 1024 / 1024).toFixed(2), 'MB')

      const response = await fetch(
        `${API_BASE_URL}/storage/progress/${progressId}/video`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      console.log('🟡 [VideoUploader] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('🔴 [VideoUploader] Error response:', errorData)
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log('🟢 [VideoUploader] Upload success:', data)

      const mediaId = data.media?.id

      if (!mediaId) {
        throw new Error('No media ID returned from server')
      }

      setUploadSuccess(
        `Video uploaded successfully! Size: ${(data.media.size / 1024 / 1024).toFixed(2)}MB`
      )
      setVideoFile(null)
      setVideoDuration(0)

      if (onUploadSuccess) {
        onUploadSuccess(mediaId)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to upload video'
      console.error('🔴 [VideoUploader] ERROR:', errorMsg)
      setUploadError(errorMsg)

      if (onUploadError) {
        onUploadError(errorMsg)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setVideoFile(null)
    setVideoDuration(0)
    setUploadError(null)
    setUploadSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* File Input Section */}
      <div className="space-y-3">
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,.mp4,.mov,.avi"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            id="video-input"
          />
          <Button
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700"
          >
            <Upload size={16} className="mr-2" />
            {videoFile ? 'Changer la vidéo' : 'Sélectionner une vidéo'}
          </Button>
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{uploadError}</p>
          </div>
        )}

        {/* Success Display */}
        {uploadSuccess && (
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{uploadSuccess}</p>
          </div>
        )}
      </div>

      {/* Video Info & Preview */}
      {videoFile && (
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h4 className="font-medium text-slate-900">Fichier sélectionné</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600 font-medium">Nom</p>
                    <p className="text-slate-900 truncate">{videoFile.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">Taille</p>
                    <p className="text-slate-900">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">Durée</p>
                    <p className="text-slate-900">
                      {Math.floor(videoDuration / 60)
                        .toString()
                        .padStart(2, '0')}
                      :{(Math.floor(videoDuration) % 60).toString().padStart(2, '0')}s
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">Type</p>
                    <p className="text-slate-900">{videoFile.type}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                disabled={isUploading}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                title="Supprimer le fichier"
              >
                <X size={20} />
              </button>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader la vidéo
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Help Text */}
      <p className="text-xs text-slate-500">
        📹 Formats supportés: MP4, MOV, AVI | Taille max: 100MB | Les vidéos seront automatiquement compressées par le serveur
      </p>
    </div>
  )
}
