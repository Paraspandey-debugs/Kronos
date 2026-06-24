const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const workflows = await prisma.workflow.findMany({ include: { steps: true }, orderBy: { createdAt: 'desc' }, take: 1 });
  console.dir(workflows, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
