import { FindManyOptions, Repository } from 'typeorm';
import { Invoice, PaymentStatus } from './entities/invoice.entity';
import { BaseRepository } from 'src/database/database.repository';
import { InjectRepository } from '@nestjs/typeorm';

export interface InvoiceFindOptions extends FindManyOptions<Invoice> {
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: PaymentStatus;
  customerId?: string;
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

async findAll(options?: InvoiceFindOptions): Promise<Invoice[]> {
  const invoices = await this.findAllPaginated(options);
  return invoices.data;
}

async findAllPaginated(options?: InvoiceFindOptions) {
  const {
    paymentStatus,
    customerId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = options || {};


  const qb = this.buildFilterQuery({
    alias: 'invoice',
    relations: ['items', 'files'],
    order: { createdAt: 'DESC' },
  });

  if (startDate && endDate) {
    qb.andWhere('invoice.invoiceDate BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
  } else if (startDate) {
    qb.andWhere('invoice.invoiceDate >= :startDate', {
      startDate: startDate,
    });
  } else if (endDate) {
    qb.andWhere('invoice.invoiceDate <= :endDate', {
      endDate: endDate,
    });
  }

  if (paymentStatus) {
    qb.andWhere('invoice.paymentStatus = :paymentStatus', {
      paymentStatus: paymentStatus,
    });
  }

  if (customerId) {
    qb.andWhere('invoice.customerId = :customerId', {
      customerId: customerId,
    });
  }

 
  qb.skip((page - 1) * limit).take(limit);

     const [data, total] = await qb.getManyAndCount();

     return {
       data,
       total,
       page,
       lastPage: Math.ceil(total / limit),
     };

}

  update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return this.repo.save({ ...data, id });
  }
}
