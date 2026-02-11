const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'wiwat.kmk@gmail.com';
    console.log(`Updating status for ${email}...`);

    const user = await prisma.user.update({
        where: { email: email },
        data: { status: 'APPROVED' } as any
    });

    console.log(`✅ Success! Updated ${user.email} to ${user.status} (Role: ${user.role})`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
