import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_files')
export class InvoiceFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.files, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column()
  fileName: string;

  @Column({ unique: true })
  googleDriveFileId: string;

  @Column()
  webViewLink: string;

  @Column()
  webContentLink: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;
}
