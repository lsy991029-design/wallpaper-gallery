export interface SourceConfig {
  name: string
  label: string
  searchUrl: string
}

const searches: SourceConfig[] = [
  { name: 'pexels', label: 'Pexels', searchUrl: 'https://www.pexels.com/zh-cn/' },
]

export default searches
