export interface Wallpaper {
  id: string
  title: string
  tags: string[]
  category: string
  resolution: {
    width: number
    height: number
  }
  aspectRatio: string
  fileSize: number
  format: string
  source: string
  sourceUrl: string
  thumbnailUrl: string
  fullUrl: string
  dateAdded: string
  downloads: number
  colorHex: string
}
