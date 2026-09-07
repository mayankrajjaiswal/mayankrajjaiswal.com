/**
 * Regenerates the hero portrait derivatives and the PWA raster icons.
 *
 * Run after replacing public/images/mayank-portrait.jpg:
 *   node scripts/generate-images.mjs
 *
 * Why derivatives exist at all: the source is 1000x667 (3:2 landscape) but the
 * hero renders it in a 4:5 portrait box, so the browser was downloading pixels
 * it then cropped away. Pre-cropping plus AVIF takes the 1x asset from ~39KB to
 * ~10KB. `position: 'north'` keeps the head in frame when cropping.
 *
 * Icons are generated from vector paths rather than the SVG favicon's <text>
 * element, because rasterizing text depends on a font being installed in
 * whatever environment runs this script.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const SOURCE = 'public/images/mayank-portrait.jpg';
const BRAND_BG = '#0f172a';

/** Hero portrait: 1x and 2x, in AVIF/WebP/JPEG. */
async function portrait() {
  const meta = await sharp(SOURCE).metadata();
  console.log(`source: ${meta.width}x${meta.height} ${meta.format}\n`);

  for (const [w, h] of [
    [448, 560],
    [896, 1120],
  ]) {
    for (const format of ['avif', 'webp', 'jpeg']) {
      const ext = format === 'jpeg' ? 'jpg' : format;
      const pipeline = sharp(SOURCE).resize(w, h, { fit: 'cover', position: 'north' });

      const buffer = await (format === 'avif'
        ? pipeline.avif({ quality: 58 })
        : format === 'webp'
          ? pipeline.webp({ quality: 74 })
          : pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true })
      ).toBuffer();

      const out = `public/images/mayank-portrait-${w}.${ext}`;
      writeFileSync(out, buffer);
      console.log(`${format.padEnd(5)} ${`${w}x${h}`.padEnd(10)} ${String(buffer.length).padStart(7)} bytes  ${out}`);
    }
  }
}

/** PWA icons. `pad` insets the glyph for the maskable safe zone. */
function iconSvg(size, pad) {
  const scale = (100 - 2 * pad) / 100;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="${pad > 0 ? 0 : 20}" fill="${BRAND_BG}"/>
      <g transform="translate(50,52) scale(${scale}) translate(-50,-52)">
        <path d="M 26 74 L 26 30 L 38 30 L 50 52 L 62 30 L 74 30 L 74 74 L 64 74 L 64 46 L 53 66 L 47 66 L 36 46 L 36 74 Z" fill="#ffffff"/>
      </g>
    </svg>`
  );
}

async function icons() {
  console.log('');
  for (const [size, pad, name] of [
    [192, 0, 'icon-192.png'],
    [512, 0, 'icon-512.png'],
    [180, 0, 'apple-touch-icon.png'],
    [512, 12, 'icon-512-maskable.png'],
  ]) {
    const buffer = await sharp(iconSvg(size, pad))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(`public/${name}`, buffer);
    console.log(`${name.padEnd(26)} ${size}x${size} ${String(buffer.length).padStart(7)} bytes`);
  }
}

await portrait();
await icons();
console.log('\nDone. Review the output images before committing.');
