import { useMemo } from 'react'
import type { Wallpaper } from '../types/wallpaper'
import wallpapersData from '../data/wallpapers.json'

const allWallpapers: Wallpaper[] = wallpapersData as Wallpaper[]

export function useWallpapers(query: string, tag: string | null) {
  const wallpapers = useMemo(() => {
    let result = allWallpapers

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (wp) =>
          wp.title.toLowerCase().includes(q) ||
          wp.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    if (tag) {
      result = result.filter((wp) => wp.tags.includes(tag))
    }

    return result
  }, [query, tag])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    allWallpapers.forEach((wp) => wp.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [])

  return { wallpapers, allTags }
}

export function getWallpaperById(id: string): Wallpaper | undefined {
  return allWallpapers.find((wp) => wp.id === id)
}

export function getRelatedWallpapers(wallpaper: Wallpaper, limit = 8): Wallpaper[] {
  return allWallpapers
    .filter((wp) => wp.id !== wallpaper.id && wp.tags.some((t) => wallpaper.tags.includes(t)))
    .slice(0, limit)
}
