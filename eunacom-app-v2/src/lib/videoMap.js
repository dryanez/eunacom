import videoIndex from './videoIndex.json'

const R2_PUBLIC_URL = 'https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev'

/**
 * Build the Cloudflare R2 URL for a given clase.
 * Returns null if no video is indexed for this subsystem + lesson.
 */
export function getVideoUrl(subsystem, lessonNumber) {
  const subsystemIndex = videoIndex[subsystem]
  if (!subsystemIndex) return null
  
  const r2Key = subsystemIndex[String(lessonNumber)]
  if (!r2Key) return null
  
  const encodedKey = r2Key.split('/').map(part => encodeURIComponent(part)).join('/')
  return `${R2_PUBLIC_URL}/${encodedKey}`
}
