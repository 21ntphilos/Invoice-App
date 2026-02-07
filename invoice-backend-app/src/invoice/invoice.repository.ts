import { FindManyOptions, Repository } from 'typeorm';
import { Invoice, PaymentStatus } from './entities/invoice.entity';
import { BaseRepository } from 'src/database/database.repository';
import { InjectRepository } from '@nestjs/typeorm';

export interface InvoiceFindOptions extends FindManyOptions<Invoice> {
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: PaymentStatus;
  limit?: number;
  page?: number;
}

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor(
    @InjectRepository(Invoice)
    repo: Repository<Invoice>,
  ) {
    super(repo);
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['items', 'files'],
    });
  }

  async markAsPaid(id: string) {
    return this.repo.update(id, {
      paymentStatus: PaymentStatus.PAID,
      //   paidAt: new Date(),
    });
  }
  async markAsUnpaid(id: string) {
    return this.repo.update(id, {
      paymentStatus: PaymentStatus.UNPAID,
    });
  }

  findAll(options?: InvoiceFindOptions): Promise<Invoice[]> {
    const qb = this.buildFilterQuery({
      alias: 'invoice',
      relations: ['items', 'files'],
      order: { createdAt: 'DESC' },
    });

    if (options?.startDate && options?.endDate) {
      qb.andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    } else if (options?.startDate) {
      qb.andWhere('invoice.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    } else if (options?.endDate) {
      qb.andWhere('invoice.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options?.paymentStatus) {
      qb.andWhere('invoice.paymentStatus = :paymentStatus', {
        paymentStatus: options.paymentStatus,
      });
    }

    qb.take(options?.limit || 15);
    // qb.skip(((options?.page || 1) - 1) * (options?.limit || 15));
    return qb.getMany();
  }

  update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return this.repo.save({ ...data, id });
  }
}
