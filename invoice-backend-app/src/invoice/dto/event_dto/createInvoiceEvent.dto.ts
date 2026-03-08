export class CreateInvoiceEvent {

    constructor(
        public readonly customerName: string,
        public readonly customerEmail: string,
        public readonly totalAmount: number,
        public readonly invoiceNumber: string,
    ) {}

   toString(): string {
        return JSON.stringify({
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            totalAmount: this.totalAmount,
            invoiceNumber: this.invoiceNumber,
        });
    }
}