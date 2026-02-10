import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceItem } from '../entities/invoiceItem.entity';
import { BaseRepository } from '../../database/database.repository';

@Injectable()
export class InvoiceItemRepository extends BaseRepository<InvoiceItem> {
  constructor(
    @InjectRepository(InvoiceItem)
    repo: Repository<InvoiceItem>,
  ) {
    super(repo);
  }
}