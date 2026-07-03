import { Link } from 'react-router-dom'
import { useRef, useState, useCallback } from 'react'
import type { Wallpaper } from '../../types/wallpaper'

interface WallpaperCardProps {
  wallpaper: Wallpaper
}

export default function WallpaperCard({ wallpaper }: WallpaperCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleLoad = useCallback(() => setLoaded(true), [])
  const handleError = useCallback(() => setError(true), [])

  return (
    <Link
      to={`/detail/${wallpaper.id}`}
      className="group relative block overflow-hidden rounded-lg bg-gray-800 transition-transform hover:scale-[1.02]"
    >
      <div
        className="aspect-video w-full"
        style={{ backgroundColor: wallpaper.colorHex }}
      >
        {!error ? (
          <img
            ref={imgRef}
            src={wallpaper.thumbnailUrl}
            alt={wallpaper.title}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            图片加载失败
          </div>
        )}
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-sm font-medium text-white truncate">
          {wallpaper.title}
        </h3>
        <span className="text-xs text-gray-300">
          {wallpaper.resolution.width}×{wallpaper.resolution.height}
        </span>
      </div>
    </Link>
  )
}
