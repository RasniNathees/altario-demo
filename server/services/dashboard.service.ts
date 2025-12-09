import { RegistrationRepository, InvoiceRepository } from '../repositories';

export class DashboardService {
  private registrationRepo = new RegistrationRepository();
  private invoiceRepo = new InvoiceRepository();

  async getStats() {
    const [
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      invoices,
      recentActivity,
    ] = await Promise.all([
      this.registrationRepo.count(),
      this.registrationRepo.count({ status: 'PENDING' }),
      this.registrationRepo.count({ status: 'APPROVED' }),
      this.registrationRepo.count({ status: 'REJECTED' }),
      this.invoiceRepo.findMany({ include: { items: true } }),
      this.registrationRepo.getRecentActivity(5),
    ]);

    const totalRevenue = invoices.reduce((sum: number, inv: any) => {
      const sub = inv.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || 0;
      return sum + sub + sub * inv.vatRate;
    }, 0);

    return {
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      totalRevenue,
      recentActivity: recentActivity.map((r) => ({
        name: r.fullName,
        status: r.status,
        date: r.createdAt,
      })),
      statusDistribution: [
        { name: 'Pending', value: pendingRegistrations, color: '#f59e0b' },
        { name: 'Approved', value: approvedRegistrations, color: '#22c55e' },
        { name: 'Rejected', value: rejectedRegistrations, color: '#ef4444' },
      ],
    };
  }
}