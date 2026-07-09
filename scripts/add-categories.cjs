const fs = require("fs");
const API_KEY = "xui3ElDCUuaxDC4nKWfZiVjurBuhZkvFwkLkJ5tSi9eI5mXVEwhgcLaA";

async function search(term, perPage) {
  const url = "https://api.pexels.com/v1/search?query=" + encodeURIComponent(term) + "&per_page=" + perPage + "&size=large";
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) throw new Error(res.status + ": " + await res.text());
  return (await res.json()).photos;
}

const SEARCHES = [
  // 山湖 — 50 images
  { terms: ["mountain lake reflection 4k", "alpine lake scenery", "mountain lake mirror", "lake mountain landscape"], cat: "山湖", tags: ["山湖", "自然", "风景"] },
  // 日落 — 50 images
  { terms: ["sunset golden hour 4k", "sunset silhouette", "beach sunset sky", "sunset clouds colorful"], cat: "日落", tags: ["日落", "黄昏", "风景"] },
  // 极光 — 50 images
  { terms: ["aurora borealis 4k", "northern lights sky", "aurora night landscape", "aurora stars"], cat: "极光", tags: ["极光", "星空", "宇宙"] },
];

async function main() {
  const d = JSON.parse(fs.readFileSync("src/data/wallpapers.json", "utf8"));
  const seen = new Set(d.map(w => w.sourceUrl));

  for (const { terms, cat, tags } of SEARCHES) {
    const current = d.filter(w => w.category === cat).length;
    const needed = 50 - current;
    if (needed <= 0) { console.log(cat + ": already " + current + ", skip"); continue; }
    console.log(cat + ": need " + needed);

    let remaining = needed;
    for (const term of terms) {
      if (remaining <= 0) break;
      const perPage = Math.min(remaining, 15);
      console.log("  search: \"" + term + "\" (fetch " + perPage + ")");
      let photos;
      try { photos = await search(term, perPage); }
      catch(e) { console.log("  error:", e.message); continue; }

      let added = 0;
      for (const p of photos) {
        if (seen.has(p.url)) continue;
        seen.add(p.url);
        d.push({
          id: "", title: "", tags, category: cat,
          resolution: { width: p.width, height: p.height },
          aspectRatio: "16:9", fileSize: 0, format: "jpeg",
          source: "Pexels", sourceUrl: p.url,
          thumbnailUrl: "https://images.pexels.com/photos/" + p.id + "/pexels-photo-" + p.id + ".jpeg?auto=compress&cs=tinysrgb&w=400",
          fullUrl: "https://images.pexels.com/photos/" + p.id + "/pexels-photo-" + p.id + ".jpeg?auto=compress&cs=tinysrgb&w=3840",
          dateAdded: new Date().toISOString().split("T")[0],
          downloads: 0, colorHex: "#333333",
        });
        added++;
      }
      console.log("    +" + added);
      remaining -= added;
      await new Promise(r => setTimeout(r, 1500));
    }
    console.log("  " + cat + " total: " + d.filter(w=>w.category===cat).length + "\n");
  }

  // Generate Chinese titles by category
  const catCounters = {};
  d.forEach(w => {
    if (!w.title) {
      catCounters[w.category] = (catCounters[w.category] || 0) + 1;
      w.title = w.category + "壁纸 " + catCounters[w.category];
    }
  });

  // Re-id
  d.forEach((w, i) => { w.id = "wp_" + String(i+1).padStart(3, "0"); });
  fs.writeFileSync("src/data/wallpapers.json", JSON.stringify(d, null, 2));

  const cats = {};
  d.forEach(w => { cats[w.category] = (cats[w.category]||0)+1 });
  console.log("Done. Total:", d.length);
  Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log("  " + k + ": " + v));
}

main().catch(e => { console.error(e); process.exit(1); });
