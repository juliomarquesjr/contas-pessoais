import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public");
mkdirSync(OUT, { recursive: true });

// Marca: cofrinho (porquinho) fofo com uma moeda — economia da família.
function mark() {
  return `
  <!-- rabinho -->
  <path d="M120 300 q-24 -6 -20 18 q4 16 20 8" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
  <!-- patas -->
  <rect x="196" y="378" width="34" height="52" rx="16" fill="#ffffff"/>
  <rect x="288" y="378" width="34" height="52" rx="16" fill="#ffffff"/>
  <!-- orelha -->
  <path d="M296 232 q10 -46 48 -22 q-8 30 -48 22 Z" fill="#f0e9ff"/>
  <!-- corpo -->
  <ellipse cx="252" cy="300" rx="142" ry="106" fill="#ffffff"/>
  <!-- focinho -->
  <ellipse cx="378" cy="312" rx="30" ry="38" fill="#f0e6ff"/>
  <ellipse cx="372" cy="299" rx="5.5" ry="8" fill="#7c3aed"/>
  <ellipse cx="372" cy="325" rx="5.5" ry="8" fill="#7c3aed"/>
  <!-- bochecha -->
  <ellipse cx="320" cy="322" rx="16" ry="10" fill="#f9a8d4" opacity="0.75"/>
  <!-- olho -->
  <circle cx="300" cy="286" r="10" fill="#4c1d95"/>
  <circle cx="304" cy="282" r="3.2" fill="#ffffff"/>
  <!-- fenda da moeda -->
  <rect x="214" y="212" width="78" height="15" rx="7.5" fill="#7c3aed"/>
  <!-- moeda -->
  <circle cx="253" cy="172" r="36" fill="#fbbf24"/>
  <circle cx="253" cy="172" r="24" fill="none" stroke="#f59e0b" stroke-width="5"/>`;
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
