import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function updateTaskStatus(
  id: string,
  status: string,
  result?: any,
  error?: string
) {
  return prisma.step.update({
    where: { id },
    data: {
      status,
      result: result || undefined,
      error: error || undefined,
    },
  });
}
