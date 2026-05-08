const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "hizmetler.html",
  "hakkimizda.html",
  "deneyim.html",
  "sss-iletisim.html",
  "gizlilik.html",
  "kullanim-kosullari.html",
  "kvkk.html",
  "styles.css",
  "script.js",
  "vercel.json"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error(`Eksik dosyalar: ${missing.join(", ")}`);
  process.exit(1);
}

for (const file of requiredFiles.filter((item) => item.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!html.includes('href="styles.css"') || !html.includes('src="script.js"')) {
    console.error(`${file} ortak CSS veya JS dosyasını yüklemiyor.`);
    process.exit(1);
  }
}

console.log("Lavinya Spa statik site dosyaları doğrulandı.");
