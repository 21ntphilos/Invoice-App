import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceFindOptions, InvoiceRepository } from './invoice.repository';
import { CUSTOMERS } from 'src/data/customer';


@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

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

  async findAll(options?: InvoiceFindOptions)
  // : Promise<Invoice[]>
   {


    console.log('Finding invoices with options:', options);
    const invoices = await this.invoiceRepository.findAllPaginated(options);
    console.log('Found invoices:', invoices);
    return invoices;
  }
 
  async findOne(id: string) {
    return this.invoiceRepository.findById(id);
  }

  // async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
  //   return this.invoiceRepository.update(id, updateInvoiceDto);
  // }

  async remove(id: string) {
    return this.invoiceRepository.delete(id);
  }
}
