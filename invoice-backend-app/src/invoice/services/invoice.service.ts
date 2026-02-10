import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { Invoice } from '../entities/invoice.entity';
import {
  InvoiceFindOptions,
  InvoiceRepository,
} from '../repositories/invoice.repository';
import { CUSTOMERS } from 'src/data/customer';
import { UploadService } from './upload.service';
import path from 'path';
import { InvoiceFileRepository } from '../repositories/invoiceFile.repository';
import { InvoiceItemRepository } from '../repositories/InvoiceItem.repository';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private uploadService: UploadService,
    private invoiceFileRepository: InvoiceFileRepository,
    private invoiceItemRepository: InvoiceItemRepository,
  ) {}

  private getCustomer = (id: string): { [key: string]: string } => {
    return CUSTOMERS.filter((customer) => customer.id === id)[0];
  };

  private calculateInvoiceTotal = (
    items: { quantity: number; unitPrice: number }[],
    taxRate = 0,
    discount = 0,
  ) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const totalAmount = subtotal - discount + taxAmount;
    return { totalAmount, subtotal };
  };

  private generateInvoiceNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${timestamp}-${randomStr}`;
  };

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoiceNumber = this.generateInvoiceNumber();

    const { totalAmount, subtotal } = this.calculateInvoiceTotal(
      createInvoiceDto.items,
      createInvoiceDto.taxRate || 0,
      createInvoiceDto.discount || 0,
    );

    const items = createInvoiceDto.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }));

    const customer = this.getCustomer(createInvoiceDto.customerId);

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      invoiceNumber,
      customerEmail: customer.email || 'Unknown Customer Email',
      customerName: customer.name || 'Unknown Customer Name',
      subtotal,
      total: totalAmount,
      items,
    });

    return await this.invoiceRepository.save(await invoice);
  }

  async findAll(options?: InvoiceFindOptions) {
    // : Promise<Invoice[]>
    console.log('Finding invoices with options:', options);
    const invoices = await this.invoiceRepository.findAllPaginated(options);
    return invoices;
  }

  async findOne(id: string) {
    return this.invoiceRepository.findById(id);
  }

  async uploadFile(invoiceId: string, file: Express.Multer.File) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `invoice-${uniqueSuffix}${ext}`;

    const { id, webViewLink, webContentLink } =
      await this.uploadService.uploadFile(file, filename);

    const invoiceFile = this.invoiceFileRepository.create({
      fileName: file.originalname,
      webViewLink,
      webContentLink,
      invoice,
      googleDriveFileId: id,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    invoice.files.push(invoiceFile);

    return this.invoiceRepository.save(invoice);
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const updateData = { ...updateInvoiceDto } as unknown as Partial<Invoice>;

    const invoice = await this.invoiceRepository.findOne({ where: { id } });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if(updateData.items && updateData.items.length < invoice.items.length) {
   const updatedItems = new Set(updateData.items.map(item => item.id));
    const itemsToRemove = invoice.items.filter(item => !updatedItems.has(item.id));

    itemsToRemove.forEach(item => {
      this.invoiceItemRepository.delete(item.id);
    })

    if(updateData.items) {
      updateData.items = updateData.items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
        invoice: { id } as Invoice,
      })) as any;
    }
    
    return this.invoiceRepository.update(id, updateData);
  }

}

  async remove(id: string) {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.invoiceRepository.delete(id);
  }

  async removeFile(invoiceId: string, fileId: string) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const file = invoice.files.find((f) => f.id === fileId);
    const invoiceFile = await this.invoiceFileRepository.findById(fileId);
    if (!file || !invoiceFile) {
      throw new NotFoundException('File not found');
    }

    await this.uploadService.deleteFile(file.googleDriveFileId);
    return await this.invoiceFileRepository.delete(fileId);
  }
}
