import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.registration.deleteMany();

    console.log('Seeding data...');

    // Create Registrations
    const registrations = await Promise.all([
        prisma.registration.create({ data: { fullName: 'Alice Johnson', email: 'alice@techcorp.com', company: 'TechCorp Solutions', status: 'PENDING', createdAt: new Date('2023-10-25') } }),
        prisma.registration.create({ data: { fullName: 'Bob Smith', email: 'bob@innovate.io', company: 'Innovate IO', status: 'APPROVED', createdAt: new Date('2023-10-24') } }),
        prisma.registration.create({ data: { fullName: 'Charlie Brown', email: 'charlie@design.co', company: 'Design Co', status: 'REJECTED', createdAt: new Date('2023-10-23') } }),
        prisma.registration.create({ data: { fullName: 'Diana Prince', email: 'diana@wondertech.com', company: 'WonderTech', status: 'PENDING', createdAt: new Date('2023-10-22') } }),
        prisma.registration.create({ data: { fullName: 'Ethan Hunt', email: 'ethan@mission.io', company: 'Mission Inc', status: 'APPROVED', createdAt: new Date('2023-10-21') } }),
        prisma.registration.create({ data: { fullName: 'Fiona Glenanne', email: 'fiona@spyco.com', company: 'SpyCo', status: 'REJECTED', createdAt: new Date('2023-10-20') } }),
        prisma.registration.create({ data: { fullName: 'George Martin', email: 'george@writer.com', company: 'WriterHouse', status: 'PENDING', createdAt: new Date('2023-10-19') } }),
        prisma.registration.create({ data: { fullName: 'Hannah Baker', email: 'hannah@story.co', company: 'Story Co', status: 'APPROVED', createdAt: new Date('2023-10-18') } }),
        prisma.registration.create({ data: { fullName: 'Ian Fleming', email: 'ian@spybooks.com', company: 'SpyBooks', status: 'REJECTED', createdAt: new Date('2023-10-17') } }),
        prisma.registration.create({ data: { fullName: 'Julia Roberts', email: 'julia@hollywood.com', company: 'Hollywood Studios', status: 'PENDING', createdAt: new Date('2023-10-16') } }),
    ]);

    // Create Invoices
    const invoicesData = [
        { invoiceNumber: 'INV-2023-1001', registration: registrations[1], dueDate: '2023-11-01', status: 'PAID', items: [{ description: 'VAT Registration Service Fee', quantity: 1, price: 250 }, { description: 'Expedited Processing', quantity: 1, price: 50 }] },
        { invoiceNumber: 'INV-2023-1002', registration: registrations[0], dueDate: '2023-11-05', status: 'UNPAID', items: [{ description: 'Standard VAT Registration', quantity: 1, price: 250 }] },
        { invoiceNumber: 'INV-2023-1003', registration: registrations[2], dueDate: '2023-11-06', status: 'PAID', items: [{ description: 'Consultation Fee', quantity: 1, price: 100 }] },
        { invoiceNumber: 'INV-2023-1004', registration: registrations[3], dueDate: '2023-11-07', status: 'UNPAID', items: [{ description: 'VAT Filing', quantity: 1, price: 200 }] },
        { invoiceNumber: 'INV-2023-1005', registration: registrations[4], dueDate: '2023-11-08', status: 'PAID', items: [{ description: 'Accounting Setup', quantity: 1, price: 300 }] },
        { invoiceNumber: 'INV-2023-1006', registration: registrations[5], dueDate: '2023-11-09', status: 'UNPAID', items: [{ description: 'Audit Fee', quantity: 1, price: 400 }] },
        { invoiceNumber: 'INV-2023-1007', registration: registrations[6], dueDate: '2023-11-10', status: 'PAID', items: [{ description: 'Registration Fee', quantity: 1, price: 150 }] },
        { invoiceNumber: 'INV-2023-1008', registration: registrations[7], dueDate: '2023-11-11', status: 'UNPAID', items: [{ description: 'Consulting Service', quantity: 1, price: 350 }] },
        { invoiceNumber: 'INV-2023-1009', registration: registrations[8], dueDate: '2023-11-12', status: 'PAID', items: [{ description: 'VAT Registration', quantity: 1, price: 250 }] },
        { invoiceNumber: 'INV-2023-1010', registration: registrations[9], dueDate: '2023-11-13', status: 'UNPAID', items: [{ description: 'Expedited Filing', quantity: 1, price: 50 }] },
        { invoiceNumber: 'INV-2023-1011', registration: registrations[0], dueDate: '2023-11-14', status: 'PAID', items: [{ description: 'Annual Subscription', quantity: 1, price: 500 }] },
        { invoiceNumber: 'INV-2023-1012', registration: registrations[1], dueDate: '2023-11-15', status: 'UNPAID', items: [{ description: 'Consulting Fee', quantity: 1, price: 200 }] },
        { invoiceNumber: 'INV-2023-1013', registration: registrations[2], dueDate: '2023-11-16', status: 'PAID', items: [{ description: 'Audit Preparation', quantity: 1, price: 300 }] },
        { invoiceNumber: 'INV-2023-1014', registration: registrations[3], dueDate: '2023-11-17', status: 'UNPAID', items: [{ description: 'Accounting Setup', quantity: 1, price: 400 }] },
        { invoiceNumber: 'INV-2023-1015', registration: registrations[4], dueDate: '2023-11-18', status: 'PAID', items: [{ description: 'VAT Filing', quantity: 1, price: 150 }] },
    ];

    for (const inv of invoicesData) {
        await prisma.invoice.create({
            data: {
                invoiceNumber: inv.invoiceNumber,
                registrationId: inv.registration.id,
                dueDate: inv.dueDate,
                status: inv.status,
                vatRate: 0.2,
                createdAt: new Date(),
                notes: 'Generated by seed script.',
                items: { create: inv.items },
            },
        });
    }


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
