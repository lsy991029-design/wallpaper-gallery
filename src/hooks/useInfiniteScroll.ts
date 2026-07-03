import { useEffect, useRef, useState, useCallback } from 'react'

export function useInfiniteScroll() {
  const [visibleCount, setVisibleCount] = useState(20)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    setIsLoading(true)
    // Small delay for smooth scroll experience
    setTimeout(() => {
      setVisibleCount((prev) => prev + 20)
      setIsLoading(false)
    }, 200)
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isLoading, loadMore])

  const reset = useCallback(() => {
    setVisibleCount(20)
  }, [])

  return { visibleCount, isLoading, sentinelRef, reset }
}
