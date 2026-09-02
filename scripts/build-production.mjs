import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCALES = ['en', 'pt-BR', 'es'];

function normalizeSiteUrl(value) {
    if (!value?.trim()) {
        throw new Error('SITE_URL is required. Example: https://ei-dungeon.example');
    }

    const url = new URL(value.trim());
    const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
    const isLocal = localHosts.has(url.hostname);

    if (url.protocol !== 'https:' && !(isLocal && url.protocol === 'http:')) {
        throw new Error('SITE_URL must use HTTPS outside local development.');
    }

    if (
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash
    ) {
        throw new Error('SITE_URL must contain only the site origin.');
    }

    return url.origin;
}

let siteUrl;
try {
    siteUrl = normalizeSiteUrl(process.env.SITE_URL);
} catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
}

const ngCli = resolve('node_modules/@angular/cli/bin/ng.js');
const result = spawnSync(
    process.execPath,
    [
        ngCli,
        'build',
        '--configuration',
        'production',
        '--define',
        `SITE_URL=${JSON.stringify(siteUrl)}`,
    ],
    { stdio: 'inherit' },
);

if (result.error) {
    throw result.error;
}

if (result.status !== 0) {
    process.exit(result.status ?? 1);
}

const outputRoot = resolve('dist/ei-dungeon-web/browser');
mkdirSync(outputRoot, { recursive: true });

const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
].join('\n');

const alternates = (indent) => [
    ...LOCALES.map(
        (locale) =>
            `${indent}<xhtml:link rel="alternate" hreflang="${locale}" href="${siteUrl}/${locale}/" />`,
    ),
    `${indent}<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/en/" />`,
].join('\n');

const sitemapEntries = LOCALES.map(
    (locale) => `  <url>
    <loc>${siteUrl}/${locale}/</loc>
${alternates('    ')}
  </url>`,
).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries}
</urlset>
`;

writeFileSync(resolve(outputRoot, 'robots.txt'), robots, 'utf8');
writeFileSync(resolve(outputRoot, 'sitemap.xml'), sitemap, 'utf8');
