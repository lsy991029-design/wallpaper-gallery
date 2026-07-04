const fs = require("fs");
const API_KEY = "xui3ElDCUuaxDC4nKWfZiVjurBuhZkvFwkLkJ5tSi9eI5mXVEwhgcLaA";

async function search(term, perPage) {
  const url = "https://api.pexels.com/v1/search?query=" + encodeURIComponent(term) + "&per_page=" + perPage + "&size=large";
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) throw new Error(res.status + ": " + await res.text());
  return (await res.json()).photos;
}

async function main() {
  const d = JSON.parse(fs.readFileSync("src/data/wallpapers.json", "utf8"));
  const seen = new Set(d.map(w => w.sourceUrl));
  let nextId = d.length + 1;

  // Top up popular breeds to reach 50 animals
  const topups = [
    { term: "British Shorthair cat kitten", cn: "英国短毛猫" },
    { term: "Corgi puppy dog", cn: "柯基犬" },
    { term: "red panda cute", cn: "小熊猫" },
  ];

  for (const { term, cn } of topups) {
    const current = d.filter(w => w.category === "动物").length;
    if (current >= 50) break;

    console.log("Top-up:", cn);
    const photos = await search(term, 2);
    let added = 0;
    for (const p of photos) {
      if (current + added >= 50) break;
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      const idx = d.filter(w => w.tags[1] === cn).length + 1;
      d.push({
        id: "wp_" + String(nextId++).padStart(3, "0"),
        title: cn + " " + idx,
        tags: ["动物", cn],
        category: "动物",
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
    console.log("  +" + added);
    await new Promise(r => setTimeout(r, 1500));
  }

  d.forEach((w, i) => { w.id = "wp_" + String(i+1).padStart(3, "0"); });
  fs.writeFileSync("src/data/wallpapers.json", JSON.stringify(d, null, 2));

  const cats = {};
  d.forEach(w => { cats[w.category] = (cats[w.category]||0)+1 });
  console.log("\nFinal:");
  Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log("  " + k + ": " + v));
  console.log("Total:", d.length);

  const breeds = {};
  d.filter(w => w.category === "动物").forEach(w => { breeds[w.tags[1]] = (breeds[w.tags[1]]||0)+1 });
  console.log("Animal breeds:", Object.keys(breeds).length);
  Object.entries(breeds).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log("  " + k + ": " + v));
}

main().catch(e => { console.error(e); process.exit(1); });
