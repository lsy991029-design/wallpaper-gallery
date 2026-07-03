/**
 * Wallpaper scraper using Playwright
 *
 * Usage: npx tsx scripts/scrape.ts
 *
 * Scrapes wallpaper listing pages to collect image URLs,
 * then downloads full-resolution images and generates thumbnails.
 * Outputs wallpapers.json metadata file.
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sources from './sources'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const imagesDir = path.join(projectRoot, 'public', 'images')
const fullDir = path.join(imagesDir, 'full')
const thumbDir = path.join(imagesDir, 'thumbnails')

// Ensure directories exist
fs.mkdirSync(fullDir, { recursive: true })
fs.mkdirSync(thumbDir, { recursive: true })

interface ScrapedWallpaper {
  id: string
  title: string
  thumbnailUrl: string
  fullUrl: string
  resolution: { width: number; height: number }
  source: string
  sourceUrl: string
}

async function scrapeWallhaven(page: any, source: (typeof sources)[0]): Promise<string[]> {
  const imageUrls: string[] = []

  for (let p = 1; p <= source.pages; p++) {
    const url = source.baseUrl + p
    console.log(`  Fetching page ${p}: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    // Scroll to load lazy images
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        const distance = 400
        const timer = setInterval(() => {
          window.scrollBy(0, distance)
          totalHeight += distance
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 200)
      })
    })

    // Extract thumbnail links from the listing page
    const links = await page.$$eval('a.preview', (anchors: any[]) =>
      anchors.map((a) => a.href).filter(Boolean),
    )

    console.log(`  Found ${links.length} wallpaper links on page ${p}`)

    // Visit each detail page to get full-res image URL
    for (const detailUrl of links) {
      try {
        await page.goto(detailUrl, { waitUntil: 'networkidle', timeout: 15000 })
        const fullImgUrl = await page.$eval('img#wallpaper', (img: any) => img.src)
        if (fullImgUrl) {
          imageUrls.push(fullImgUrl)
          console.log(`    ✓ ${fullImgUrl}`)
        }
      } catch (err) {
        console.warn(`    ✗ Failed to get image from ${detailUrl}:`, (err as Error).message)
      }

      // Rate limiting
      await page.waitForTimeout(1000)
    }
  }

  return imageUrls
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(destPath, buffer)
}

async function main() {
  console.log('🚀 Starting wallpaper scraper...\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  })
  const page = await context.newPage()

  const wallpapers: ScrapedWallpaper[] = []
  let index = 1

  for (const source of sources) {
    console.log(`📡 Scraping ${source.label}...`)

    try {
      const imageUrls = await scrapeWallhaven(page, source)

      for (const imageUrl of imageUrls) {
        const id = `wp_${String(index).padStart(4, '0')}`
        const ext = path.extname(new URL(imageUrl).pathname).split('?')[0] || '.jpg'

        const fullPath = path.join(fullDir, `${id}${ext}`)
        const thumbPath = path.join(thumbDir, `${id}${ext}`)

        try {
          // Download full image
          console.log(`  ⬇ Downloading ${imageUrl}`)
          await downloadImage(imageUrl, fullPath)

          // Generate thumbnail (400px wide) using sharp
          try {
            const sharp = (await import('sharp')).default
            await sharp(fullPath)
              .resize(400, undefined, { fit: 'inside' })
              .jpeg({ quality: 80 })
              .toFile(thumbPath)
          } catch {
            // If sharp fails, just copy the file
            fs.copyFileSync(fullPath, thumbPath)
          }

          const wall: ScrapedWallpaper = {
            id,
            title: id, // Will be manually edited later
            thumbnailUrl: `/images/thumbnails/${id}${ext}`,
            fullUrl: `/images/full/${id}${ext}`,
            resolution: { width: 0, height: 0 },
            source: source.name,
            sourceUrl: imageUrl,
          }

          wallpapers.push(wall)
          index++
          console.log(`    ✓ Saved as ${id}${ext}`)
        } catch (err) {
          console.warn(`    ✗ Failed to download ${imageUrl}:`, (err as Error).message)
        }

        await page.waitForTimeout(500)
      }
    } catch (err) {
      console.error(`  ✗ Failed to scrape ${source.label}:`, (err as Error).message)
    }
  }

  await browser.close()

  // Generate wallpapers.json
  const dataPath = path.join(projectRoot, 'src', 'data', 'wallpapers.template.json')
  const out: any[] = wallpapers.map((w) => ({
    id: w.id,
    title: '',
    tags: [],
    category: '',
    resolution: w.resolution,
    aspectRatio: '',
    fileSize: 0,
    format: path.extname(w.fullUrl).replace('.', ''),
    source: w.source,
    sourceUrl: w.sourceUrl,
    thumbnailUrl: w.thumbnailUrl,
    fullUrl: w.fullUrl,
    dateAdded: new Date().toISOString().split('T')[0],
    downloads: 0,
    colorHex: '#333333',
  }))

  fs.writeFileSync(dataPath, JSON.stringify(out, null, 2))
  console.log(`\n✅ Done! Scraped ${wallpapers.length} wallpapers.`)
  console.log(`📄 Template data written to: ${dataPath}`)
  console.log('📝 Next: edit the template to add Chinese titles, tags, and categories,')
  console.log('   then copy it over src/data/wallpapers.json')
}

main().catch((err) => {
  console.error('Scraper failed:', err)
  process.exit(1)
})
