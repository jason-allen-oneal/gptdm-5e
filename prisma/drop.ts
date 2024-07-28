import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing stale data from database.');
  await prisma.$executeRaw`DROP DATABASE dm5e`;
  await prisma.$executeRaw`CREATE DATABASE dm5e`;
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}).finally(() => {
  console.log('Completed.');
});