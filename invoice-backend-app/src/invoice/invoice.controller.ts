import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InvoiceService } from './services/invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage, memoryStorage } from 'multer';
import path from 'path';


@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {

    return this.invoiceService.create(createInvoiceDto);
  }

  @Get('/all')
  async findAll(@Query() query: any) {
    const invoices = await this.invoiceService.findAll(query)
    console.log('Invoices retrieved in controller:', invoices);
    return invoices;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.invoiceService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    const upd = await this.invoiceService.update(id, updateInvoiceDto);
    console.log(upd)
    return upd
  }

  @Patch(':invoiceId/uploadFile')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: memoryStorage(),
    }),
  )
  async uploadFile(
    @Query('invoiceId') invoiceId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.invoiceService.uploadFile(invoiceId, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }
}
