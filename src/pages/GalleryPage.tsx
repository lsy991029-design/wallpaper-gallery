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

      <InfiniteGallery
        wallpapers={wallpapers}
        visibleCount={visibleCount}
        sentinelRef={sentinelRef}
        isLoading={isLoading}
      />
    </div>
  )
}
