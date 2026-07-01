import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const templates = [
    {
      type: 'scout',
      label: 'Web Scout',
      description: 'Scrapes a target website for leads.',
      icon: 'Globe',
      defaultPayload: { target: 'https://example.com' },
      script: `
console.log('Scouting target:', payload.target);
const target = payload.target || 'https://example.com';
const res = await fetch(target).catch(e => ({ status: 500, text: async () => 'Fetch error' }));
const text = await res.text();
const score = Math.floor(Math.random() * 40) + 60; // 60-100 score
return {
  findings: \`Found \${text.length} bytes of content at \${target}\`,
  score,
  status: res.status,
  timestamp: new Date().toISOString()
};
      `
    },
    {
      type: 'compressor',
      label: 'Compressor',
      description: 'Compresses payload data into smaller strings.',
      icon: 'Minimize2',
      defaultPayload: { text: 'Some long text here...' },
      script: `
console.log('Compressing text...');
const text = payload.text || '';
return {
  compressed: text.replace(/\\s+/g, ''),
  originalLength: text.length,
  compressedLength: text.replace(/\\s+/g, '').length
};
      `
    }
  ];

  for (const t of templates) {
    await prisma.agentTemplate.upsert({
      where: { type: t.type },
      update: {
        script: t.script,
        label: t.label,
        description: t.description,
        icon: t.icon,
        defaultPayload: t.defaultPayload
      },
      create: t,
    });
    console.log('Upserted template:', t.type);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
