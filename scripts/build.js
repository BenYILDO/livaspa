const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dynamicClasses = new Set(["active", "menu-open", "open", "slider-dot"]);
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
  "favicon.svg",
  "assets/hero-768.avif",
  "assets/hero-1280.avif",
  "assets/hero-2048.avif",
  "assets/hero-768.webp",
  "assets/hero-1280.webp",
  "assets/hero-2048.webp",
  "assets/hero-768.jpg",
  "assets/hero-1280.jpg",
  "assets/hero-2048.jpg",
  "vercel.json"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error(`Eksik dosyalar: ${missing.join(", ")}`);
  process.exit(1);
}

const htmlFiles = requiredFiles.filter((item) => item.endsWith(".html"));
const cssSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const jsSource = fs.readFileSync(path.join(root, "script.js"), "utf8");

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!html.includes('href="styles.css"') || !html.includes('src="script.js"')) {
    console.error(`${file} ortak CSS veya JS dosyasını yüklemiyor.`);
    process.exit(1);
  }
}

function extractClasses(html) {
  const classes = new Set(dynamicClasses);

  for (const match of html.matchAll(/\bclass="([^"]+)"/g)) {
    match[1].split(/\s+/).filter(Boolean).forEach((className) => classes.add(className));
  }

  return classes;
}

function splitSelectors(selectorText) {
  return selectorText.split(",").map((selector) => selector.trim()).filter(Boolean);
}

function selectorMatchesPage(selector, classes) {
  const classMatches = [...selector.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)].map((match) => match[1]);
  return classMatches.length === 0 || classMatches.every((className) => classes.has(className));
}

function filterSelectorList(selectorText, classes) {
  return splitSelectors(selectorText).filter((selector) => selectorMatchesPage(selector, classes)).join(",");
}

function findMatchingBrace(css, openIndex) {
  let depth = 0;

  for (let index = openIndex; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function purgeCss(css, classes) {
  let output = "";
  let cursor = 0;

  while (cursor < css.length) {
    const openIndex = css.indexOf("{", cursor);
    if (openIndex === -1) break;

    const selectorText = css.slice(cursor, openIndex).trim();
    const closeIndex = findMatchingBrace(css, openIndex);
    if (closeIndex === -1) break;

    const body = css.slice(openIndex + 1, closeIndex);

    if (selectorText.startsWith("@media")) {
      const filteredBody = purgeCss(body, classes);
      if (filteredBody.trim()) output += `${selectorText}{${filteredBody}}`;
    } else {
      const keptSelectorText = filterSelectorList(selectorText, classes);
      if (keptSelectorText) output += `${keptSelectorText}{${body}}`;
    }

    cursor = closeIndex + 1;
  }

  return output;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function minifyJs(js) {
  let output = "";
  let quote = "";
  let escaped = false;

  const isWord = (char) => /[$\w]/.test(char || "");
  const nextNonSpace = (index) => {
    for (let next = index + 1; next < js.length; next += 1) {
      if (!/\s/.test(js[next])) return js[next];
    }
    return "";
  };

  for (let index = 0; index < js.length; index += 1) {
    const char = js[index];
    const next = js[index + 1];

    if (quote) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      output += char;
      continue;
    }

    if (char === "/" && next === "/") {
      while (index < js.length && js[index] !== "\n") index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < js.length && !(js[index] === "*" && js[index + 1] === "/")) index += 1;
      index += 1;
      continue;
    }

    if (/\s/.test(char)) {
      if (isWord(output[output.length - 1]) && isWord(nextNonSpace(index))) output += " ";
      continue;
    }

    output += char;
  }

  return output.trim();
}

const publicDir = path.join(root, "public");
fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const pageCss = minifyCss(purgeCss(cssSource, extractClasses(html)));
  const outputHtml = html
    .replace('  <link rel="stylesheet" href="styles.css">', `  <style>${pageCss}</style>`)
    .replace('src="script.js"></script>', 'src="script.js" defer></script>');

  fs.writeFileSync(path.join(publicDir, file), outputHtml);
}

fs.writeFileSync(path.join(publicDir, "styles.css"), minifyCss(cssSource));
fs.writeFileSync(path.join(publicDir, "script.js"), minifyJs(jsSource));
fs.copyFileSync(path.join(root, "favicon.svg"), path.join(publicDir, "favicon.svg"));
fs.mkdirSync(path.join(publicDir, "assets"), { recursive: true });
for (const file of [
  "hero-768.avif",
  "hero-1280.avif",
  "hero-2048.avif",
  "hero-768.webp",
  "hero-1280.webp",
  "hero-2048.webp",
  "hero-768.jpg",
  "hero-1280.jpg",
  "hero-2048.jpg"
]) {
  fs.copyFileSync(path.join(root, "assets", file), path.join(publicDir, "assets", file));
}

console.log("Liva Spa statik site dosyaları doğrulandı ve public klasörü hazırlandı.");
