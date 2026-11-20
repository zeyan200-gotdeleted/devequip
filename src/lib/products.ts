export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export interface ProductImage {
  src: string;
  width: number;
  height: number;
}

export type SaleMethod =
  | 'creator-store'
  | 'robux'
  | 'builtbybit'
  | 'gumroad'
  | 'payhip'
  | 'lemonsqueezy'
  | 'kofi'
  | 'paypal'
  | 'stripe'
  | 'other';

export interface Sale {
  method: SaleMethod;
  url: string;
  store?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  engine: string;
  price: string;
  community?: boolean;
  sale?: Sale;
  rating: number;
  downloads: number;
  version: string;
  created: string;
  updated: string;
  publisher: string;
  developer: string;
  discontinued: boolean;
  summary: string;
  overview: string[];
  features: { title: string; text: string }[];
  compatibility: string[];
  requires: string[];
  licenses: { label: string; name: string; url: string | null }[];
  links: { label: string; url: string; store?: string }[];
  variants?: { label: string; url: string; store?: string }[];
  docs: string | null;
  source: string | null;
  images: ProductImage[];
  contributors: { name: string; role: string }[];
  files: FileNode | null;
}

export type MarketplaceItem = Pick<
  Product,
  'id' | 'name' | 'category' | 'price' | 'rating' | 'downloads' | 'summary' | 'version' | 'updated' | 'discontinued' | 'developer'
> & { cover: ProductImage; hasSource: boolean; community: boolean };

export const isFree = (price: string) => price.toLowerCase() === 'free';

export const SALE_STORES: Record<SaleMethod, string> = {
  'creator-store': 'the Creator Store',
  robux: 'Roblox',
  builtbybit: 'BuiltByBit',
  gumroad: 'Gumroad',
  payhip: 'Payhip',
  lemonsqueezy: 'Lemon Squeezy',
  kofi: 'Ko-fi',
  paypal: 'PayPal',
  stripe: 'Stripe',
  other: 'the developer’s store',
};

export const storeName = (sale: Sale) => (sale.method === 'other' && sale.store) || SALE_STORES[sale.method];

export const formatCount = (n: number) =>
  n >= 1_000_000
    ? `${+(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
      ? `${+(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`
      : String(n);

export const downloadsLabel = (n: number) => `${formatCount(n)} ${n === 1 ? 'download' : 'downloads'}`;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export function fileStats(node: FileNode): { files: number; lines: number } {
  if (node.type === 'file') return { files: 1, lines: node.content ? node.content.split('\n').length : 0 };
  return (node.children ?? []).map(fileStats).reduce(
    (sum, s) => ({ files: sum.files + s.files, lines: sum.lines + s.lines }),
    { files: 0, lines: 0 },
  );
}

export function relatedTo<T extends Pick<Product, 'id' | 'category' | 'downloads'>>(
  product: Pick<Product, 'id' | 'category'>,
  all: T[],
  count = 3,
): T[] {
  return all
    .filter((p) => p.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.category === product.category) - Number(a.category === product.category) || b.downloads - a.downloads,
    )
    .slice(0, count);
}
