const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const outDir = "/home/z/my-project/public/icons";
fs.mkdirSync(outDir, { recursive: true });

// Icon design: dark stone rounded square, gold CV document with lines & seal
const svgAny = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#292524"/>
      <stop offset="1" stop-color="#0c0a09"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e7c766"/>
      <stop offset="1" stop-color="#c9a227"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="108" fill="url(#bg)"/>
  <g transform="translate(256 256)">
    <rect x="-118" y="-158" width="236" height="316" rx="20" fill="#fffaf0"/>
    <rect x="-118" y="-158" width="236" height="60" rx="20" fill="#1c1917"/>
    <rect x="-118" y="-118" width="236" height="20" fill="#1c1917"/>
    <rect x="-86" y="-138" width="120" height="16" rx="8" fill="url(#gold)"/>
    <rect x="-80" y="-62" width="160" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="-34" width="120" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="30" width="160" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="58" width="132" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="86" width="104" height="14" rx="7" fill="#d6d3d1"/>
    <circle cx="86" cy="108" r="34" fill="url(#gold)"/>
    <path d="M86 88 l8.8 6.3 -3.4 10.3 h-10.8 l-3.4 -10.3 z" fill="#1c1917"/>
  </g>
</svg>`;

const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#292524"/>
      <stop offset="1" stop-color="#0c0a09"/>
    </linearGradient>
    <linearGradient id="gold2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e7c766"/>
      <stop offset="1" stop-color="#c9a227"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg2)"/>
  <g transform="translate(256 256) scale(0.78)">
    <rect x="-118" y="-158" width="236" height="316" rx="20" fill="#fffaf0"/>
    <rect x="-118" y="-158" width="236" height="60" rx="20" fill="#1c1917"/>
    <rect x="-118" y="-118" width="236" height="20" fill="#1c1917"/>
    <rect x="-86" y="-138" width="120" height="16" rx="8" fill="url(#gold2)"/>
    <rect x="-80" y="-62" width="160" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="-34" width="120" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="30" width="160" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="58" width="132" height="14" rx="7" fill="#d6d3d1"/>
    <rect x="-80" y="86" width="104" height="14" rx="7" fill="#d6d3d1"/>
    <circle cx="86" cy="108" r="34" fill="url(#gold2)"/>
    <path d="M86 88 l8.8 6.3 -3.4 10.3 h-10.8 l-3.4 -10.3 z" fill="#1c1917"/>
  </g>
</svg>`;

(async () => {
  await sharp(Buffer.from(svgAny)).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(Buffer.from(svgAny)).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));
  await sharp(Buffer.from(svgMaskable)).resize(192, 192).png().toFile(path.join(outDir, "icon-maskable-192.png"));
  await sharp(Buffer.from(svgMaskable)).resize(512, 512).png().toFile(path.join(outDir, "icon-maskable-512.png"));
  console.log("icons generated:", fs.readdirSync(outDir));
})();
