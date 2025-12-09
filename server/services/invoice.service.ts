import { InvoiceRepository } from '../repositories';
import { ApiError } from '../utils';

export class InvoiceService {
  private repository = new InvoiceRepository();

    private async generateInvoiceId(dueDate: Date) {
    const year = new Date(dueDate).getFullYear();

    const last = await this.repository.findLastRecord();

    let counter = 1;


    if (last) {
      const parts = last.invoiceNumber.split("-");
    
      counter = parseInt(parts[2]) + 1;
    }
    //  console.log(counter);
    const padded = counter.toString().padStart(4, "0");
    return `INV-${year}-${padded}`;
  }
  async getAll(page: number, limit: number) {
    const [total, invoices] = await Promise.all([
      this.repository.count(),
      this.repository.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: invoices,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: {
    registrationId: string;
    dueDate: Date;
    status: string;
    items: any[];
    vatRate?: number;
    notes?: string;
    invoiceNumber?: string;
  }) {
    return this.repository.create({
      invoiceNumber: await this.generateInvoiceId(data.dueDate), 
      registration: { connect: { id: data.registrationId } },
      dueDate: new Date(data.dueDate).toDateString(),
      status: data.status,
      vatRate: data.vatRate || 0.2,
      notes: data.notes,
      items: { create: data.items },
    });
  }

  async update(
    id: string,
    data: { status?: string; notes?: string; items?: any[] }
  ) {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }

    if (data.items) {
      await this.repository.deleteItems(id);
      return this.repository.update(id, {
        status: data.status,
        notes: data.notes,
        items: { create: data.items },
      });
    }

    return this.repository.update(id, {
      status: data.status,
      notes: data.notes,
    });
  }

  async delete(id: string) {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }
    await this.repository.delete(id);
    return id;
  }
}