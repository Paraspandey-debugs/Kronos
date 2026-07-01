import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });


export async function updateTaskStatus(
  id: string,
  status: string,
  result?: any,
  error?: string
) {
  return prisma.workflowNode.update({
    where: { id },
    data: {
      status,
      result: result || undefined,
      error: error || undefined,
      completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : undefined,
    },
  });
}
