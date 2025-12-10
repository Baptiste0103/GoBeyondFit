// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api'

// WebSocket Configuration
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:3000'

// Video Configuration
export const VIDEO_MAX_DURATION_SECONDS = 40
export const VIDEO_MAX_FILE_SIZE_MB = 20
export const VIDEO_CODEC = 'video/mp4'

// Form Configuration
export const EXERCISE_TYPES = ['standard', 'EMOM', 'AMRAP', 'circuit'] as const

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    signup: `${API_BASE_URL}/auth/signup`,
    login: `${API_BASE_URL}/auth/login`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },
  // Storage
  storage: {
    uploadVideo: (progressId: string) => `${API_BASE_URL}/storage/progress/${progressId}/video`,
    getVideo: (mediaId: string) => `${API_BASE_URL}/storage/videos/${mediaId}`,
    getProgress: (progressId: string) => `${API_BASE_URL}/storage/progress/${progressId}/videos`,
  },
  // Workouts
  workouts: {
    current: `${API_BASE_URL}/workouts/current`,
    complete: (workoutId: string, exerciseIndex: number) =>
      `${API_BASE_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/complete`,
  },
}
