import { Link } from 'react-router-dom'
import { useWallpapers } from '../hooks/useWallpapers'
import GalleryGrid from '../components/gallery/GalleryGrid'
import WallpaperCard from '../components/gallery/WallpaperCard'

export default function HomePage() {
  const { wallpapers } = useWallpapers('', null)
  const featured = wallpapers.slice(0, 20)

  return (
    <div>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative">
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
            高清壁纸画廊
          </h1>
          <p className="mb-8 text-base text-gray-400 sm:text-lg">
            精选 4K 高清壁纸，免费浏览下载
          </p>
          <Link
            to="/browse"
            className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 sm:px-8 sm:py-4 sm:text-base"
          >
            浏览全部
          </Link>
        </div>
      </section>

      {/* Featured wallpapers */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-semibold sm:text-2xl">精选壁纸</h2>
        <GalleryGrid>
          {featured.map((wp) => (
            <WallpaperCard key={wp.id} wallpaper={wp} />
          ))}
        </GalleryGrid>
      </section>
    </div>
  )
}
