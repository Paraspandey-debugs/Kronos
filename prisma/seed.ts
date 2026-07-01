import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });


async function main() {
  const templates = [
    { 
      type: 'start', 
      label: 'Start', 
      description: 'Starts the flow', 
      defaultPayload: { target: 'https://example.com' },
      outputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string' }
        }
      },
      configSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', title: 'Target URL', ui: { component: 'Input', placeholder: 'https://...' } }
        }
      }
    },
    { 
      type: 'scout', 
      label: 'Scout', 
      description: 'Data fetching', 
      defaultPayload: { target: '$step_0.target' },
      outputSchema: {
        type: 'object',
        properties: {
          urls: { type: 'array', items: { type: 'string' } },
          metadata: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              pageCount: { type: 'number' }
            }
          }
        }
      },
      configSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            title: 'Target URL',
            ui: { component: 'VariablePicker', placeholder: 'https://...' }
          },
          maxDepth: {
            type: 'number',
            title: 'Max Depth',
            default: 1,
            ui: { component: 'Input' }
          }
        }
      }
    },
    { 
      type: 'compressor', 
      label: 'Compressor', 
      description: 'Data processing', 
      defaultPayload: { data: '$step_1.result' },
      outputSchema: {
        type: 'object',
        properties: {
          compressedSize: { type: 'number' },
          originalSize: { type: 'number' }
        }
      },
      configSchema: {
        type: 'object',
        properties: {
          data: {
            type: 'string',
            title: 'Data to Compress',
            ui: { component: 'VariablePicker' }
          },
          algorithm: {
            type: 'string',
            title: 'Algorithm',
            enum: ['gzip', 'brotli'],
            default: 'gzip',
            ui: { component: 'Select' }
          }
        }
      }
    },
    { 
      type: 'decision', 
      label: 'Decision', 
      description: 'Conditional split', 
      defaultPayload: { condition: '$step_2.result.length > 0' },
      outputSchema: {
        type: 'object',
        properties: {
          result: { type: 'boolean' }
        }
      },
      configSchema: {
        type: 'object',
        properties: {
          condition: {
            type: 'string',
            title: 'Condition Expression',
            ui: { component: 'VariablePicker' }
          }
        }
      }
    },
    { 
      type: 'end', 
      label: 'End', 
      description: 'Ends the flow', 
      defaultPayload: {},
      outputSchema: {},
      configSchema: {}
    }
  ];

  for (const t of templates) {
    await prisma.agentTemplate.upsert({
      where: { type: t.type },
      update: { 
        label: t.label, 
        description: t.description, 
        defaultPayload: t.defaultPayload,
        configSchema: t.configSchema,
        outputSchema: t.outputSchema
      },
      create: t,
    });
  }
  
  console.log("Successfully seeded AgentTemplates with schemas!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
