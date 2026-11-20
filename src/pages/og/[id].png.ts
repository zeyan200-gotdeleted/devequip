import type { APIContext } from 'astro';
import { join } from 'node:path';
import sharp from 'sharp';
import { products } from '../../lib/catalog';
import type { Product } from '../../lib/products';

export const getStaticPaths = () => products.map((product) => ({ params: { id: product.id }, props: { product } }));

export async function GET({ props }: APIContext<{ product: Product }>) {
  const image = await sharp(join(process.cwd(), 'public', props.product.images[0].src))
    .resize(1200, 630, { fit: 'cover' })
    .png({ palette: true, quality: 90 })
    .toBuffer();
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png' } });
}
