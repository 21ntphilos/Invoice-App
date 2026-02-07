import { Injectable } from '@nestjs/common';
import { CUSTOMERS } from './data/customer';

@Injectable()
export class AppService {
  getCustomers(): { [key: string]: string }[] {
    return CUSTOMERS;
  }
}
