import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const templates = [
    {
      type: 'web-fetcher',
      label: 'Web Fetcher',
      description: 'Fetch a URL, parse JSON, return metadata + body.',
      icon: 'Globe',
      defaultPayload: { url: 'https://api.github.com/users/octocat', timeout: 5000 },
      outputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          status: { type: 'number' },
          ok: { type: 'boolean' },
          contentType: { type: 'string' },
          bodyLength: { type: 'number' },
          bodyPreview: { type: 'string' },
          json: { type: 'object' },
          parseError: { type: 'string' },
          headers: { type: 'object' },
          timestamp: { type: 'string' }
        }
      },
      script: `
const url = payload.url;
const timeout = payload.timeout || 5000;
const headers = payload.headers || { 'User-Agent': 'Kronos-Agent/1.0' };

if (!url) throw new Error('Missing required field: url');

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeout);

try {
  const res = await fetch(url, { headers, signal: controller.signal });
  clearTimeout(timer);

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json') || contentType.includes('+json');
  const text = await res.text();
  let json = null;
  let parseError = null;

  if (isJson) {
    try { json = JSON.parse(text); } catch (e) { parseError = e.message; }
  }

  // Return a strict, usable interface
  return {
    url,
    status: res.status,
    ok: res.ok,
    contentType,
    bodyLength: text.length,
    bodyPreview: text.slice(0, 500),
    json,
    parseError,
    headers: Object.fromEntries(res.headers.entries()),
    timestamp: new Date().toISOString(),
  };
} catch (err) {
  clearTimeout(timer);
  return {
    url,
    status: 0,
    ok: false,
    error: err.message || 'Request failed',
    timestamp: new Date().toISOString(),
  };
}
      `
    },
    {
      type: 'json-query',
      label: 'JSON Query',
      description: 'Extract nested values from JSON using dot notation.',
      icon: 'Search',
      defaultPayload: { data: { test: { nested: 'value' } }, path: 'test.nested' },
      outputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          found: { type: 'boolean' },
          value: { type: 'any' },
          type: { type: 'string' },
          defaultValueProvided: { type: 'boolean' }
        }
      },
      script: `
const data = payload.data;
const path = payload.path;
const defaultValue = payload.default;

if (!data) throw new Error('Missing required field: data');
if (!path) throw new Error('Missing required field: path');

const parts = path.split('.');
let current = data;
let found = true;

for (const part of parts) {
  if (current === null || current === undefined || typeof current !== 'object') {
    found = false;
    break;
  }
  current = current[part];
  if (current === undefined) {
    found = false;
    break;
  }
}

return {
  path,
  found,
  value: found ? current : defaultValue,
  type: found ? typeof current : 'undefined',
  defaultValueProvided: defaultValue !== undefined,
};
      `
    },
    {
      type: 'text-joiner',
      label: 'Text Joiner',
      description: 'Join an array of strings into a single text block.',
      icon: 'Combine',
      defaultPayload: { items: ['Hello', 'World'], separator: ' ' },
      outputSchema: {
        type: 'object',
        properties: {
          joined: { type: 'string' },
          itemCount: { type: 'number' },
          separatorUsed: { type: 'string' },
          prefixUsed: { type: 'string' },
          suffixUsed: { type: 'string' },
          totalLength: { type: 'number' }
        }
      },
      script: `
const items = payload.items;
const separator = payload.separator || '\\n';
const prefix = payload.prefix || '';
const suffix = payload.suffix || '';

if (!Array.isArray(items)) {
  throw new Error('Payload.items must be an array of strings');
}
if (!items.every(i => typeof i === 'string')) {
  throw new Error('All items in payload.items must be strings');
}

const joined = items.join(separator);
const result = prefix + joined + suffix;

return {
  joined: result,
  itemCount: items.length,
  separatorUsed: separator,
  prefixUsed: prefix,
  suffixUsed: suffix,
  totalLength: result.length,
};
      `
    },
    {
      type: 'http-mapper',
      label: 'HTTP Mapper',
      description: 'Maps an object into a targeted dictionary for inserts.',
      icon: 'Database',
      defaultPayload: { source: { data: { user: { name: 'Alice' }, id: 1 } }, mapping: { userName: 'data.user.name', userId: 'data.id' } },
      outputSchema: {
        type: 'object',
        properties: {
          mapped: { type: 'object' },
          mappingApplied: { type: 'object' },
          sourceKeys: { type: 'object' }
        }
      },
      script: `
const source = payload.source;
const mapping = payload.mapping;

if (!source || !mapping) throw new Error('Missing source or mapping');

const result = {};
for (const [targetKey, sourcePath] of Object.entries(mapping)) {
  const parts = sourcePath.split('.');
  let val = source;
  for (const p of parts) {
    val = val?.[p];
    if (val === undefined) break;
  }
  result[targetKey] = val ?? null;
}

return {
  mapped: result,
  mappingApplied: mapping,
  sourceKeys: Object.keys(source),
};
      `
    }
  ];

  // Optional: delete old agents (scout, compressor) to keep the list clean
  await prisma.agentTemplate.deleteMany({
    where: { type: { in: ['scout', 'compressor'] } }
  }).catch(() => {});

  for (const t of templates) {
    await prisma.agentTemplate.upsert({
      where: { type: t.type },
      update: {
        script: t.script,
        label: t.label,
        description: t.description,
        icon: t.icon,
        defaultPayload: t.defaultPayload,
        outputSchema: t.outputSchema
      },
      create: t,
    });
    console.log('Upserted template:', t.type);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
