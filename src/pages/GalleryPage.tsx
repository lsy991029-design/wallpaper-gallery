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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-400">
          共 {wallpapers.length} 张壁纸
          {(query || activeTag) && '（已筛选）'}
        </p>

        {/* Healing mode toggle */}
        <button
          onClick={() => setHealingMode(!healingMode)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            healingMode
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {healingMode ? '治愈模式 ON' : '治愈模式'}
        </button>
      </div>

      {/* Healing mode active hint */}
      {healingMode && (
        <p className="mb-4 text-xs text-amber-400/70 -mt-2">柔和暖调 · 低饱和度 · 胶片质感</p>
      )}

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
