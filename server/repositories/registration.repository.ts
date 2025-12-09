import { prisma } from '../config';
import { Prisma } from '@prisma/client';

export class RegistrationRepository {
  async count(where?: Prisma.RegistrationWhereInput) {
    return prisma.registration.count({ where });
  }

  async findMany(params: Prisma.RegistrationFindManyArgs) {
    return prisma.registration.findMany(params);
  }

  async findById(id: string, include?: Prisma.RegistrationInclude) {
    return prisma.registration.findUnique({
      where: { id },
      include: include || { _count: { select: { invoices: true } } },
    });
  }

  async create(data: Prisma.RegistrationCreateInput) {
    return prisma.registration.create({ data });
  }

  async update(id: string, data: Prisma.RegistrationUpdateInput) {
    return prisma.registration.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.registration.delete({ where: { id } });
  }

  async getRecentActivity(take: number) {
    return prisma.registration.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      select: { fullName: true, status: true, createdAt: true },
    });
  }
}