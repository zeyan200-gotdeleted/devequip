import { expect, test, type Page } from '@playwright/test';
import catalog from '../../src/data/products.json' with { type: 'json' };

const withSource = catalog.find((p) => p.files && JSON.stringify(p.files).split('"type":"file"').length > 2)!;
const withoutSource = catalog.find((p) => !p.files)!;
const PAGES = ['', 'marketplace/', 'docs/', 'blog/', 'blog/welcome/', 'support/', 'terms/', `products/${withSource.id}/`, `products/${withoutSource.id}/`];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const source = msg.location().url;
    if (source && !source.includes('localhost')) return;
    errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

const cards = (page: Page) => page.locator('.product-card');

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const matching = (query: string) =>
  catalog.filter((p) => `${p.name} ${p.summary} ${p.category}`.toLowerCase().includes(query)).length;
const inCategory = (category: string) => catalog.filter((p) => p.category === category).length;

for (const path of PAGES) {
  test(`page /${path} renders cleanly`, async ({ page }, info) => {
    const errors = trackErrors(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Dev Equip/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/DevEquip\//);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(1);

    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      await new Promise((r) => setTimeout(r, 400));
    });
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((img) => img.src.includes('localhost') && img.complete && img.naturalWidth === 0)
        .map((img) => img.src),
    );
    expect(broken).toEqual([]);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/screens/${info.project.name}-${path.replace(/\W+/g, '-') || 'home'}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('every internal link and asset resolves', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    const links = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement | HTMLLinkElement | HTMLImageElement>('a[href], link[href], img[src]')].map(
        (el) => ('href' in el ? el.href : el.src),
      ),
    );
    for (const link of links) if (link.includes('localhost')) seen.add(link.split('#')[0]);
  }
  expect(seen.size).toBeGreaterThan(30);
  for (const link of seen) {
    const res = await request.get(link);
    expect(res.status(), link).toBe(200);
  }
});

test('generated files and product images are served', async ({ request }) => {
  for (const [path, type] of [
    ['og.png', 'image/png'],
    ['robots.txt', 'text/plain'],
    ['sitemap-index.xml', 'xml'],
    ...catalog.flatMap((p) => [
      [`og/${p.id}.png`, 'image/png'],
      ...p.images.map((img) => [img.src.slice(1), 'image/webp']),
    ]),
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()['content-type'], path).toContain(type);
    expect((await res.body()).length, path).toBeGreaterThan(50);
  }
});

test('unknown URLs get the 404 page', async ({ page }) => {
  const response = await page.goto('nope/not-here/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('could not be found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('navigation marks the current section and the mobile menu opens', async ({ page, isMobile }) => {
  await open(page, 'docs/');
  if (isMobile) {
    const toggle = page.locator('#menu-toggle');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu a[aria-current="page"]')).toHaveText('Docs');
    await page.locator('#mobile-menu').getByRole('link', { name: 'Marketplace' }).click();
  } else {
    await expect(page.locator('header nav[aria-label="Main"] a[aria-current="page"]')).toHaveText('Docs');
    await page.getByLabel('Main').getByRole('link', { name: 'Marketplace' }).click();
  }
  await expect(page).toHaveURL(/\/marketplace\/$/);
});

test('home links into the catalog', async ({ page }) => {
  await open(page, '');
  await expect(page.locator('.hero-art a')).toHaveCount(3);
  await expect(cards(page)).toHaveCount(6);
  await page.getByRole('link', { name: /^Script \d+ products?$/ }).click();
  await expect(page).toHaveURL(/marketplace\/\?category=Script$/);
  await expect(cards(page)).toHaveCount(inCategory('Script'));
});

test('marketplace filters, search and sorting work and sync to the URL', async ({ page, isMobile }) => {
  await open(page, 'marketplace/');
  await expect(cards(page)).toHaveCount(catalog.length);

  await page.getByRole('button', { name: /^3D Model/ }).click();
  await expect(cards(page)).toHaveCount(inCategory('3D Model'));
  await expect(page).toHaveURL(/category=3D\+Model/);

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(cards(page)).toHaveCount(catalog.length);
  await expect(page).not.toHaveURL(/\?/);

  const search = page.getByLabel('Search products');
  if (!isMobile) {
    await page.keyboard.press('/');
    await expect(search).toBeFocused();
  }
  await search.fill('framework');
  expect(matching('framework')).toBeGreaterThan(0);
  await expect(cards(page)).toHaveCount(matching('framework'));
  await expect(page).toHaveURL(/q=framework/);

  await search.fill('zzzz-nothing');
  await expect(page.getByText('No products match your search')).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(cards(page)).toHaveCount(catalog.length);

  await page.getByLabel('Sort by').selectOption('name');
  await expect(page).toHaveURL(/sort=name/);
  const names = await cards(page).locator('h3').allTextContents();
  expect(names.map((n) => n.trim())).toEqual([...catalog.map((p) => p.name)].sort((a, b) => a.localeCompare(b)));
});

test('marketplace restores filters from a shared link', async ({ page }) => {
  await open(page, 'marketplace/?category=Map&sort=rating');
  await expect(cards(page)).toHaveCount(inCategory('Map'));
  await expect(page.getByRole('button', { name: /^Map/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Sort by')).toHaveValue('rating');
});

test('product page: source browser and copy', async ({ page, context, isMobile }) => {
  await open(page, `products/${withSource.id}/`);
  await expect(page.locator('h1')).toHaveText(withSource.name);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`og/${withSource.id}\\.png$`));

  await page.getByRole('link', { name: 'Browse source' }).click();
  const source = page.locator('#source');
  await expect(source.locator('pre code')).not.toBeEmpty();
  await expect(source.locator('astro-island')).not.toHaveAttribute('ssr');

  const before = await source.locator('pre code').innerText();
  await source.locator('button:not([aria-expanded]):not([aria-current])').filter({ hasText: /\.\w+$/ }).first().click();
  await expect(source.locator('pre code')).not.toHaveText(before);

  if (!isMobile) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await source.getByRole('button', { name: 'Copy' }).click();
    await expect(source.getByRole('button', { name: 'Copied' })).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip.length).toBeGreaterThan(5);
  }
});

test('product page without source links out to download it', async ({ page }) => {
  await open(page, `products/${withoutSource.id}/`);
  await expect(page.locator('h1')).toHaveText(withoutSource.name);
  await expect(page.locator('#source')).toHaveCount(0);
  const main = page.getByRole('link', { name: /Get it on the Creator Store|Download/ }).first();
  await expect(main).toHaveAttribute('href', withoutSource.links[0].url);
});

test('product gallery swaps the large image', async ({ page }) => {
  const product = catalog.find((p) => p.images.length > 1)!;
  await open(page, `products/${product.id}/`);
  const main = page.locator('#gallery-main');
  await expect(main).toHaveAttribute('src', new RegExp(`${product.images[0].src}$`));
  await page.locator('.gallery-thumb').nth(1).click();
  await expect(main).toHaveAttribute('src', new RegExp(`${product.images[1].src}$`));
  await expect(page.locator('.gallery-thumb').nth(1)).toHaveAttribute('aria-pressed', 'true');
});
