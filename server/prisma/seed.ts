import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.registration.deleteMany();

    console.log('Seeding data...');

    // Create Registrations
    const alice = await prisma.registration.create({
        data: {
            fullName: 'Alice Johnson',
            email: 'alice@techcorp.com',
            company: 'TechCorp Solutions',
            status: 'PENDING',
            createdAt: new Date('2023-10-25'),
        },
    });

    const bob = await prisma.registration.create({
        data: {
            fullName: 'Bob Smith',
            email: 'bob@innovate.io',
            company: 'Innovate IO',
            status: 'APPROVED',
            createdAt: new Date('2023-10-24'),
        },
    });

    const charlie = await prisma.registration.create({
        data: {
            fullName: 'Charlie Brown',
            email: 'charlie@design.co',
            company: 'Design Co',
            status: 'REJECTED',
            createdAt: new Date('2023-10-23'),
        },
    });

    // Create Invoices
    await prisma.invoice.create({
        data: {
            invoiceNumber   : 'INV-2023-1001',  
            registrationId: bob.id,
            dueDate: '2023-11-01',
            status: 'PAID',
            vatRate: 0.20,
            createdAt: new Date('2023-10-24'),
            notes: 'Thank you for your business.',
            items: {
                create: [
                    { description: 'VAT Registration Service Fee', quantity: 1, price: 250.00 },
                    { description: 'Expedited Processing', quantity: 1, price: 50.00 },
                ],
            },
        },
    });

    await prisma.invoice.create({
        data: {
            invoiceNumber   : 'INV-2023-1002',
            registrationId: alice.id,
            dueDate: '2023-11-05',
            status: 'UNPAID',
            vatRate: 0.20,
            createdAt: new Date('2023-10-25'),
            notes: 'Please pay within 14 days.',
            items: {
                create: [
                    { description: 'Standard VAT Registration', quantity: 1, price: 250.00 },
                ],
            },
        },
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
