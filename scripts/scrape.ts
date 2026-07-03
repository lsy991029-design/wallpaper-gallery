/**
 * Pexels wallpaper scraper using official API — no browser, no Cloudflare, reliable.
 * Usage: npx tsx scripts/scrape.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const API_KEY = 'xui3ElDCUuaxDC4nKWfZiVjurBuhZkvFwkLkJ5tSi9eI5mXVEwhgcLaA'
const BASE = 'https://api.pexels.com/v1'

// Search config: English term → Chinese category + tags
const SEARCHES = [
  { term: 'nature landscape 4k', category: '风景', tags: ['风景', '自然'] },
  { term: 'city night urban', category: '城市', tags: ['城市', '夜景'] },
  { term: 'abstract art', category: '抽象', tags: ['抽象', '艺术'] },
  { term: 'space universe stars', category: '宇宙', tags: ['宇宙', '星空'] },
  { term: 'ocean sea waves', category: '海洋', tags: ['海洋', '自然'] },
  { term: 'animals wildlife', category: '动物', tags: ['动物', '自然'] },
  { term: 'flowers plants garden', category: '花卉', tags: ['花卉', '植物'] },
  { term: 'minimal simple clean', category: '极简', tags: ['极简', '简约'] },
  { term: 'mountain forest trees', category: '风景', tags: ['风景', '自然', '山'] },
  { term: 'sunset sunrise sky', category: '风景', tags: ['风景', '日落'] },
  { term: 'car supercar vehicle', category: '汽车', tags: ['汽车', '科技'] },
  { term: 'technology digital tech', category: '科技', tags: ['科技', '数码'] },
  { term: 'architecture building design', category: '建筑', tags: ['建筑', '城市'] },
]

interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    tiny: string
  }
  alt: string
}

interface SearchResponse {
  photos: PexelsPhoto[]
  total_results: number
  page: number
  per_page: number
}

async function searchPhotos(term: string, perPage = 15): Promise<PexelsPhoto[]> {
  const url = `${BASE}/search?query=${encodeURIComponent(term)}&per_page=${perPage}&size=large`
  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  const data: SearchResponse = await res.json()
  return data.photos
}

function buildThumbUrl(photo: PexelsPhoto): string {
  return `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=400`
}

function buildFullUrl(photo: PexelsPhoto): string {
  return `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=3840`
}

function cleanTitle(alt: string, category: string): string {
  let cleaned = alt
    .replace(/免费\s*/g, '')
    .replace(/的免费素材图片/g, '')
    .replace(/素材图片/g, '')
    .replace(/免费素材/g, '')
    .replace(/免费图片/g, '')
    .replace(/stock photo/gi, '')
    .replace(/free stock/gi, '')
    .replace(/pexels/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/[，,]\s*$/, '')
    .trim()

  if (!cleaned || cleaned.length < 3) {
    cleaned = `${category}壁纸`
  }
  if (cleaned.length > 60) {
    cleaned = cleaned.slice(0, 57) + '...'
  }
  return cleaned
}

async function main() {
  console.log('Pexels API scraper\n')

  const seen = new Set<number>()
  const wallpapers: any[] = []
  let idx = 1

  for (const { term, category, tags } of SEARCHES) {
    if (wallpapers.length >= 110) break

    console.log(`Search: "${term}" → ${category}`)

    let photos: PexelsPhoto[]
    try {
      photos = await searchPhotos(term, 12)
    } catch (e: any) {
      console.log(`  error: ${e.message}`)
      continue
    }

    let added = 0
    for (const photo of photos) {
      if (seen.has(photo.id)) continue
      seen.add(photo.id)

      wallpapers.push({
        id: `wp_${String(idx++).padStart(3, '0')}`,
        title: cleanTitle(photo.alt || '', category),
        tags,
        category,
        resolution: { width: photo.width, height: photo.height },
        aspectRatio: '16:9',
        fileSize: 0,
        format: 'jpeg',
        source: 'Pexels',
        sourceUrl: photo.url,
        thumbnailUrl: buildThumbUrl(photo),
        fullUrl: buildFullUrl(photo),
        dateAdded: new Date().toISOString().split('T')[0],
        downloads: 0,
        colorHex: '#333333',
      })
      added++
    }

    console.log(`  added ${added}, total: ${wallpapers.length}\n`)
    // Rate limit: 200 req/hour. Be gentle.
    await new Promise(r => setTimeout(r, 1000))
  }

  const output = wallpapers.slice(0, 110)
  fs.writeFileSync(
    path.join(projectRoot, 'src', 'data', 'wallpapers.json'),
    JSON.stringify(output, null, 2),
  )
  console.log(`Done: ${output.length} wallpapers → src/data/wallpapers.json`)

  const counts: Record<string, number> = {}
  for (const w of output) {
    counts[w.category] = (counts[w.category] || 0) + 1
  }
  console.log('\nCategory breakdown:')
  for (const [cat, n] of Object.entries(counts)) {
    console.log(`  ${cat}: ${n}`)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
