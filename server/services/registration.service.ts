import { RegistrationRepository } from '../repositories';
import { ApiError } from '../utils';
import type { Prisma } from '@prisma/client';

export class RegistrationService {
  private repository = new RegistrationRepository();

  async getAll(page: number, limit: number, search?: string) {
    const where: Prisma.RegistrationWhereInput = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [total, registrations] = await Promise.all([
      this.repository.count(where),
      this.repository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { invoices: true } } },
      }),
    ]);

    return {
      data: registrations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllSimple() {
    return this.repository.findMany({
      select: { id: true, fullName: true, company: true },
      orderBy: { company: 'asc' },
    });
  }

  async create(data: { fullName: string; email: string; company: string }) {
    return this.repository.create({
      ...data,
      status: 'PENDING',
    });
  }

  async updateStatus(id: string, status: string) {
    const registration = await this.repository.findById(id);
    if (!registration) {
      throw new ApiError(404, 'Registration not found');
    }
    return this.repository.update(id, { status });
  }

  async delete(id: string) {
    const registration = await this.repository.findById(id);
    if (!registration) {
      throw new ApiError(404, 'Registration not found');
    }
    await this.repository.delete(id);
    return id;
  }
}