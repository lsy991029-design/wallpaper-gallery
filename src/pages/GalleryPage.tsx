import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWallpapers } from '../hooks/useWallpapers'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import SearchBar from '../components/search/SearchBar'
import FilterTags from '../components/search/FilterTags'
import InfiniteGallery from '../components/gallery/InfiniteGallery'

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialTag = searchParams.get('tag') || null

  const [query, setQuery] = useState(initialQuery)
  const [activeTag, setActiveTag] = useState<string | null>(initialTag)
  const [healingMode, setHealingMode] = useState(false)

  const { wallpapers, allTags } = useWallpapers(query, activeTag)
  const { visibleCount, isLoading, sentinelRef, reset } = useInfiniteScroll()

  const handleSearch = (q: string) => {
    setQuery(q)
    setActiveTag(null)
    reset()
    if (q) {
      setSearchParams({ q })
    } else {
      setSearchParams({})
    }
  }

  const handleTagSelect = (tag: string | null) => {
    setActiveTag(tag)
    setQuery('')
    reset()
    if (tag) {
      setSearchParams({ tag })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 space-y-4">
        <SearchBar value={query} onChange={handleSearch} />
        <FilterTags
          tags={allTags}
          activeTag={activeTag}
          onSelect={handleTagSelect}
        />
      </div>

      <p className="mb-4 text-sm text-gray-400">
        共 {wallpapers.length} 张壁纸
        {(query || activeTag) && '（已筛选）'}
      </p>

      {/* Healing mode toggle */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setHealingMode(!healingMode)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            healingMode
              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          治愈模式
          {healingMode && (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-black font-bold">ON</span>
          )}
        </button>
        {healingMode && (
          <span className="text-xs text-amber-400/70">柔和暖调 · 低饱和度 · 胶片质感</span>
        )}
      </div>

      <InfiniteGallery
        wallpapers={wallpapers}
        visibleCount={visibleCount}
        sentinelRef={sentinelRef}
        isLoading={isLoading}
        healingMode={healingMode}
      />
    </div>
  )
}
