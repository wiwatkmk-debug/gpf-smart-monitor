import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- User List ---');
    users.forEach((u: any) => {
        console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | Status: ${u.status}`);
    });
    console.log('-----------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
