import { Module } from '@nestjs/common';
import { InvoiceService } from './services/invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './repositories/invoice.repository';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { InvoiceItem } from './entities/invoiceItem.entity';
import { InvoiceFile } from './entities/invoiceFile.entity';
import { Invoice } from './entities/invoice.entity';
import { UploadService } from './services/upload.service';
import { InvoiceFileRepository } from './repositories/invoiceFile.repository';
import { InvoiceItemRepository } from './repositories/InvoiceItem.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceFile, InvoiceItem]), ClientsModule.register([
      {
      name: 'NOTIFICATION_SERVICE',
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notification-service',
          brokers: ['localhost:9092'],
        },
        consumer:{
          groupId: 'notification-service-group',
        }
        
      },
    }
  ]), ],
  controllers: [InvoiceController],
  providers: [InvoiceRepository,InvoiceItemRepository, InvoiceFileRepository, InvoiceService, UploadService],
  
})
export class InvoiceModule {}
