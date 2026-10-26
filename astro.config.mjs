// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Replace with your production URL after deploying to Vercel / Netlify.
// It powers the sitemap and the canonical / Open Graph URLs in BaseLayout.
const SITE_URL = 'https://thegreatwar.pl';

// Sitemap entries get the same language alternates (hreflang) as the page's
// <head>: the sitemap runs after the build, so read them from the built HTML.
// Polish and English slugs differ, so they can't be derived from the URL.
const distDir = fileURLToPath(new URL('./dist', import.meta.url));
/** @param {string} url */
function builtHtml(url) {
  const path = new URL(url).pathname.replace(/\/$/, '');
  try {
    return readFileSync(`${distDir}${path}/index.html`, 'utf8');
  } catch {
    return undefined;
  }
}
/** @param {import('@astrojs/sitemap').SitemapItem} item */
function withHreflang(item) {
  const html = builtHtml(item.url);
  if (!html) return item;
  const links = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map(([, lang, url]) => ({ lang, url }));
  return links.length ? { ...item, links } : item;
}

export default defineConfig({
  site: SITE_URL,

  // URLs never end with "/" (canonical, og:url, sitemap, dev server).
  // vercel.json redirects "/path/" to "/path" in production.
  trailingSlash: 'never',

  // Pages marked noindex (BaseLayout `noindex`: search results, small tag
  // pages) stay out of the sitemap too; read from the built HTML.
  integrations: [
    sitemap({
      serialize: withHreflang,
      filter: (page) => !builtHtml(page)?.includes('<meta name="robots" content="noindex'),
    }),
  ],

  // Prefetches internal links on hover/viewport entry for near-instant navigation.
  prefetch: true,

  vite: {
    plugins: [tailwindcss()],
  },

  // Astro's built-in Fonts API: self-hosts and optimizes these at build time
  // (no Google-hosted requests, no extra npm packages, automatic preloading).
  // Each cssVariable below is consumed in src/styles/global.css inside the
  // Tailwind @theme block (--font-display, --font-body, --font-mono).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Fraunces',
      cssVariable: '--ff-display',
      weights: ['400', '500', '600'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--ff-body',
      weights: ['400', '500', '600'],
      subsets: ['latin', 'latin-ext'],
    },
    {
      provider: fontProviders.google(),
      name: 'Space Mono',
      cssVariable: '--ff-mono',
      weights: ['400', '700'],
      subsets: ['latin', 'latin-ext'],
    },
  ],
});
