import { prisma } from '../config';
import { Prisma } from '@prisma/client';

export class InvoiceRepository {
  async count() {
    return prisma.invoice.count();
  }

  async findMany(params: Prisma.InvoiceFindManyArgs) {
    return prisma.invoice.findMany(params);
  }

  async findById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async create(data: Prisma.InvoiceCreateInput) {
    return prisma.invoice.create({
      data,
      include: { items: true },
    });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput) {
    return prisma.invoice.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  async delete(id: string) {
    return prisma.invoice.delete({ where: { id } });
  }

  async deleteItems(invoiceId: string) {
    return prisma.invoiceItem.deleteMany({
      where: { invoiceId },
    });
  }
   async findLastRecord() {
    return prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-`,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}