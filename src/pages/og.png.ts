import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { products, totalDownloads } from '../lib/catalog';
import { formatCount } from '../lib/products';

export async function GET() {
  const logo = await sharp(await readFile(join(process.cwd(), 'src/assets/logo.png')))
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#050b16"/>
  <polygon points="760,630 1200,190 1200,630" fill="#0a1a33"/>
  <polygon points="940,630 1200,370 1200,630" fill="#00254c"/>
  <polygon points="1070,630 1200,500 1200,630" fill="#1a8cff"/>
  <g font-family="Inter, 'Segoe UI', 'DejaVu Sans', Arial, sans-serif">
    <text x="210" y="140" font-size="40" font-weight="700" fill="#e9f0f8">Dev Equip</text>
    <text x="90" y="320" font-size="96" font-weight="700" fill="#e9f0f8" letter-spacing="-3">Welcome</text>
    <text x="90" y="420" font-size="96" font-weight="700" fill="#1a8cff" letter-spacing="-3">Developer</text>
    <text x="90" y="530" font-size="30" fill="#a3b5cd">${products.length} free Roblox assets · ${formatCount(totalDownloads())} downloads</text>
  </g>
</svg>`;

  const png = await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: 90, top: 78 }])
    .png()
    .toBuffer();

  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
