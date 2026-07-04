const fs = require("fs");
const API_KEY = "xui3ElDCUuaxDC4nKWfZiVjurBuhZkvFwkLkJ5tSi9eI5mXVEwhgcLaA";

async function search(term, perPage) {
  const url = "https://api.pexels.com/v1/search?query=" + encodeURIComponent(term) + "&per_page=" + perPage + "&size=large";
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) throw new Error(res.status + ": " + await res.text());
  return (await res.json()).photos;
}

const BREEDS = [
  { term: "British Shorthair cat", cn: "英国短毛猫" },
  { term: "Ragdoll cat", cn: "布偶猫" },
  { term: "Exotic Shorthair cat", cn: "异国短毛猫" },
  { term: "Corgi dog", cn: "柯基犬" },
  { term: "Pomeranian dog", cn: "博美犬" },
  { term: "Shiba Inu dog", cn: "柴犬" },
  { term: "chinchilla pet", cn: "龙猫" },
  { term: "hamster pet cute", cn: "仓鼠" },
  { term: "lop rabbit bunny", cn: "垂耳兔" },
  { term: "Tibetan fox", cn: "藏狐" },
  { term: "fennec fox", cn: "耳廓狐" },
  { term: "sugar glider", cn: "蜜袋鼯" },
  { term: "sea otter", cn: "海獭" },
  { term: "harp seal pup", cn: "竖琴海豹幼崽" },
  { term: "dumbo octopus", cn: "小飞象章鱼" },
  { term: "giant panda", cn: "大熊猫" },
  { term: "polar bear cub", cn: "北极熊幼崽" },
  { term: "baby elephant", cn: "大象幼崽" },
  { term: "capybara", cn: "水豚" },
  { term: "pygmy hippo", cn: "倭河马" },
  { term: "Adelie penguin", cn: "阿德利企鹅" },
  { term: "red panda", cn: "小熊猫" },
];

async function main() {
  const d = JSON.parse(fs.readFileSync("src/data/wallpapers.json", "utf8"));

  const withoutAnimals = d.filter(w => w.category !== "动物");
  console.log("Removed animals, remaining:", withoutAnimals.length);

  const seen = new Set(withoutAnimals.map(w => w.sourceUrl));
  const newAnimals = [];

  for (const { term, cn } of BREEDS) {
    const need = 2;
    console.log("Search:", cn, "(" + term + ")");
    let photos;
    try {
      photos = await search(term, need);
    } catch(e) {
      console.log("  error:", e.message);
      continue;
    }

    let breedAdded = 0;
    for (const p of photos) {
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      const title = photos.length > 1 && breedAdded > 0 ? cn + " " + (breedAdded + 1) : cn;
      newAnimals.push({
        id: "",
        title,
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
      breedAdded++;
    }
    console.log("  +" + breedAdded);
    await new Promise(r => setTimeout(r, 1500));
  }

  // Take 2 per breed = 44, then fill remaining 6 from first breeds with extras
  const perBreed = 2;
  const base = [];
  const extras = [];
  for (const breed of BREEDS.map(b => b.cn)) {
    const breedPhotos = newAnimals.filter(w => w.tags[1] === breed);
    base.push(...breedPhotos.slice(0, perBreed));
    extras.push(...breedPhotos.slice(perBreed));
  }
  const finalAnimals = [...base, ...extras].slice(0, 50);
  const merged = [...withoutAnimals, ...finalAnimals];
  merged.forEach((w, i) => { w.id = "wp_" + String(i+1).padStart(3, "0"); });

  fs.writeFileSync("src/data/wallpapers.json", JSON.stringify(merged, null, 2));

  const cats = {};
  merged.forEach(w => { cats[w.category] = (cats[w.category]||0)+1 });
  console.log("\nFinal:");
  Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log("  " + k + ": " + v));
  console.log("Total:", merged.length);

  const animalTags = {};
  finalAnimals.forEach(w => {
    const breed = w.tags[1];
    animalTags[breed] = (animalTags[breed]||0) + 1;
  });
  console.log("\nAnimal breeds:");
  Object.entries(animalTags).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log("  " + k + ": " + v));
}

main().catch(e => { console.error(e); process.exit(1); });
