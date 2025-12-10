'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Video, Square, RotateCcw, Upload } from 'lucide-react'

interface VideoRecorderProps {
  onVideoCapture: (blob: Blob, duration: number) => void
  maxDuration?: number // in seconds
  maxFileSize?: number // in MB
  disabled?: boolean
}

export function VideoRecorder({
  onVideoCapture,
  maxDuration = 40,
  maxFileSize = 20,
  disabled = false,
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [recordedTime, setRecordedTime] = useState(0)
  const [hasVideo, setHasVideo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  // Get camera access with constraints
  const startCamera = async () => {
    try {
      setError(null)
      setIsLoading(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 854 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Set up MediaRecorder with codec preference
      const mimeType = 'video/webm;codecs=vp8,opus'
      const isSupported = MediaRecorder.isTypeSupported(mimeType)
      const selectedMimeType = isSupported ? mimeType : 'video/webm'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 1024 * 1000, // 1 Mbps to match server compression
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType })
        const fileSizeMB = blob.size / (1024 * 1024)

        if (fileSizeMB > maxFileSize) {
          setError(
            `File size (${fileSizeMB.toFixed(2)}MB) exceeds limit of ${maxFileSize}MB`
          )
          return
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(blob)
        setPreview(previewUrl)
        setHasVideo(true)

        onVideoCapture(blob, recordedTime)
      }

      setIsLoading(false)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  // Start recording with time limit
  const handleStartRecording = () => {
    if (!mediaRecorderRef.current) {
      setError('Camera not initialized')
      return
    }

    setRecordedTime(0)
    setError(null)
    mediaRecorderRef.current.start()
    setIsRecording(true)

    // Timer to enforce max duration
    let seconds = 0
    timerIntervalRef.current = setInterval(() => {
      seconds += 1
      setRecordedTime(seconds)

      if (seconds >= maxDuration) {
        handleStopRecording()
        setError(
          `Recording stopped: Maximum duration of ${maxDuration}s reached`
        )
      }
    }, 1000)
  }

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  // Reset and clear
  const handleReset = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    chunksRef.current = []
    setRecordedTime(0)
    setHasVideo(false)
    setPreview(null)
    setError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  // Initialize camera on mount
  useEffect(() => {
    if (!disabled && !isLoading) {
      startCamera()
    }
  }, [disabled])

  const timePercentage = (recordedTime / maxDuration) * 100
  const timeFormatted = `${Math.floor(recordedTime / 60)
    .toString()
    .padStart(2, '0')}:${(recordedTime % 60).toString().padStart(2, '0')}`

  return (
    <Card className="p-6 bg-slate-50 border-slate-200">
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Record Workout Video</h3>
        </div>

        {/* Info */}
        <p className="text-sm text-slate-600">
          Max duration: {maxDuration}s | Max file size: {maxFileSize}MB | Resolution:
          480p (854x480)
        </p>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Video Preview */}
        {!hasVideo ? (
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              src={preview || ''}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Timer Display */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recording time</span>
              <span className="text-lg font-mono font-bold text-red-600">
                {timeFormatted}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  timePercentage >= 100
                    ? 'bg-red-600'
                    : timePercentage >= 75
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(timePercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!isRecording && !hasVideo && (
            <Button
              onClick={handleStartRecording}
              disabled={disabled || isLoading || !mediaRecorderRef.current}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={handleStopRecording}
                variant="outline"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </>
          )}

          {!isRecording && hasVideo && (
            <>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Record Again
              </Button>
              <Button
                onClick={() => {
                  // Video already captured in onVideoCapture
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Use Video
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-500">
          📹 Position yourself clearly in the frame. Make sure there is adequate lighting.
          The video will be automatically compressed to 480p before upload.
        </p>
      </div>
    </Card>
  )
}
