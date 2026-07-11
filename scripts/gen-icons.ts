import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public");
mkdirSync(OUT, { recursive: true });

// Marca: casa branca com uma moeda (seta de crescimento) — "finanças da casa".
function mark() {
  return `
  <path d="M256 108 L420 248 a16 16 0 0 1 6 12 v140 a16 16 0 0 1 -16 16 H102 a16 16 0 0 1 -16 -16 V260 a16 16 0 0 1 6 -12 Z" fill="#ffffff"/>
  <circle cx="256" cy="304" r="60" fill="#ede9fe"/>
  <path d="M226 322 L250 300 L268 314 L294 282" fill="none" stroke="#7c3aed" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M278 280 L296 280 L296 298" fill="none" stroke="#7c3aed" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function badge({ rounded }: { rounded: boolean }) {
  const rx = rounded ? 112 : 0;
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  ${mark()}
</svg>`;
}

async function main() {
  const rounded = Buffer.from(badge({ rounded: true }));
  const square = Buffer.from(badge({ rounded: false }));

  await sharp(rounded).resize(192, 192).png().toFile(join(OUT, "icon-192.png"));
  await sharp(rounded).resize(512, 512).png().toFile(join(OUT, "icon-512.png"));
  await sharp(square)
    .resize(512, 512)
    .png()
    .toFile(join(OUT, "icon-maskable-512.png"));
  await sharp(square)
    .resize(180, 180)
    .png()
    .toFile(join(OUT, "apple-touch-icon.png"));

  // Favicon (app/icon.svg + app/icon.png) para o navegador
  const appDir = join(process.cwd(), "src", "app");
  writeFileSync(join(appDir, "icon.svg"), badge({ rounded: true }));
  await sharp(rounded).resize(48, 48).png().toFile(join(appDir, "icon.png"));

  console.log("✓ Logo, ícones PWA e favicon gerados");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
