/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null

  // Format: https://youtu.be/videoId
  let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  // Format: https://www.youtube.com/watch?v=videoId
  match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  // Format: https://www.youtube.com/embed/videoId
  match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  // Format: videoId only
  if (url.match(/^[a-zA-Z0-9_-]{11}$/)) return url

  return null
}

/**
 * Get YouTube video thumbnail URL
 * Quality: maxresdefault (1280x720) > sddefault (640x480) > hqdefault (480x360) > default (120x90)
 */
export function getYouTubeThumbnail(videoId: string, quality: 'max' | 'sd' | 'hq' | 'default' = 'hq'): string {
  if (!videoId) return ''

  const qualityMap = {
    max: 'maxresdefault',
    sd: 'sddefault',
    hq: 'hqdefault',
    default: 'default',
  }

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Get YouTube video embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  if (!videoId) return ''
  return `https://www.youtube.com/embed/${videoId}`
}
