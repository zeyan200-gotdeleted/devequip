import data from '../data/products.json';
import type { MarketplaceItem, Product } from './products';
import { url } from './url';

export const products = data as Product[];

export const marketplaceItems = (): MarketplaceItem[] =>
  products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    rating: p.rating,
    downloads: p.downloads,
    summary: p.summary,
    version: p.version,
    updated: p.updated,
    discontinued: p.discontinued,
    developer: p.developer,
    community: !!p.community,
    cover: { ...p.images[0], src: url(p.images[0].src) },
    hasSource: !!p.files,
  }));

export const communityCount = () => products.filter((p) => p.community).length;

export const CATEGORY_ORDER = ['Admin Panel', 'Donation Board', 'Script', 'User Interface', 'Plugin', '3D Model', 'Map'];

export const categories = () =>
  [...new Set(products.map((p) => p.category))]
    .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
    .map((name) => ({ name, count: products.filter((p) => p.category === name).length }));

export const totalDownloads = () => products.reduce((sum, p) => sum + p.downloads, 0);
