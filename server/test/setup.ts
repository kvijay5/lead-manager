import { afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/db/prisma';

export async function resetDatabase() {
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
