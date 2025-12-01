import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format image URL from API response
 * Handles both relative paths (for local images) and API-uploaded images
 */
export function formatImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return '/placeholder.jpg'
  }

  // If it's already a full URL or starts with http/https, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // If it starts with /, it's a local path
  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  // Otherwise, it's likely an API-uploaded image filename
  // Construct the full URL using the API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const uploadsBaseUrl = apiBaseUrl.replace('/api', '/uploads')
  return `${uploadsBaseUrl}/${imageUrl}`
}
