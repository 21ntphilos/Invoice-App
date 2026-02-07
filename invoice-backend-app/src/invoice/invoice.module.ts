import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './invoice.repository';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { InvoiceItem } from './entities/invoiceItem.entity';
import { InvoiceFile } from './entities/invoiceFile.entity';
import { Invoice } from './entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceFile, InvoiceItem])],
  controllers: [InvoiceController],
  providers: [InvoiceRepository, InvoiceService],
  exports: [InvoiceRepository],
})
export class InvoiceModule {}
