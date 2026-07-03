import type { Wallpaper } from '../../types/wallpaper'
import WallpaperCard from './WallpaperCard'
import GalleryGrid from './GalleryGrid'

interface InfiniteGalleryProps {
  wallpapers: Wallpaper[]
  visibleCount: number
  sentinelRef: React.RefObject<HTMLDivElement | null>
  isLoading: boolean
}

export default function InfiniteGallery({
  wallpapers,
  visibleCount,
  sentinelRef,
  isLoading,
}: InfiniteGalleryProps) {
  const visible = wallpapers.slice(0, visibleCount)

  if (wallpapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg">暂无壁纸</p>
        <p className="mt-1 text-sm">换个关键词试试看</p>
      </div>
    )
  }

  return (
    <>
      <GalleryGrid>
        {visible.map((wp) => (
          <WallpaperCard key={wp.id} wallpaper={wp} />
        ))}
      </GalleryGrid>

      {/* Infinite scroll sentinel */}
      {visible.length < wallpapers.length && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {isLoading && (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-purple-500" />
          )}
        </div>
      )}
    </>
  )
}
