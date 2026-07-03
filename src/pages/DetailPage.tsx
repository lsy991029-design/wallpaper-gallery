import { useParams, useNavigate } from 'react-router-dom'
import { getWallpaperById, getRelatedWallpapers } from '../hooks/useWallpapers'
import GalleryGrid from '../components/gallery/GalleryGrid'
import WallpaperCard from '../components/gallery/WallpaperCard'

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const wallpaper = id ? getWallpaperById(id) : undefined

  if (!wallpaper) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg">壁纸不存在</p>
        <button
          onClick={() => navigate('/browse')}
          className="mt-4 text-purple-400 hover:text-purple-300"
        >
          返回浏览
        </button>
      </div>
    )
  }

  const related = getRelatedWallpapers(wallpaper)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = wallpaper.fullUrl
    link.download = `${wallpaper.title}.${wallpaper.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* Image */}
      <div className="mb-6 overflow-hidden rounded-lg bg-gray-800">
        <img
          src={wallpaper.fullUrl}
          alt={wallpaper.title}
          className="w-full object-contain"
          style={{ maxHeight: '70vh', backgroundColor: wallpaper.colorHex }}
        />
      </div>

      {/* Info + Download */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{wallpaper.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {wallpaper.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-sm text-gray-400">
            <p>分辨率：{wallpaper.resolution.width} × {wallpaper.resolution.height}</p>
            <p>文件大小：{formatSize(wallpaper.fileSize)}</p>
            <p>来源：{wallpaper.source}</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 sm:px-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载原图
        </button>
      </div>

      {/* Related wallpapers */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">相关推荐</h2>
          <GalleryGrid>
            {related.map((wp) => (
              <WallpaperCard key={wp.id} wallpaper={wp} />
            ))}
          </GalleryGrid>
        </section>
      )}
    </div>
  )
}
