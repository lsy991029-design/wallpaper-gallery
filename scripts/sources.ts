// Wallpaper source configurations for the scraper
// Each source defines a wallpaper site and how to extract images from it

export interface SourceConfig {
  name: string
  label: string
  baseUrl: string
  /** Number of pages to scrape */
  pages: number
  /** Min resolution to filter by */
  minWidth: number
  minHeight: number
}

const sources: SourceConfig[] = [
  {
    name: 'wallhaven',
    label: 'Wallhaven',
    baseUrl: 'https://wallhaven.cc/search?categories=111&purity=100&sorting=toplist&page=',
    pages: 3,
    minWidth: 1920,
    minHeight: 1080,
  },
]

export default sources
