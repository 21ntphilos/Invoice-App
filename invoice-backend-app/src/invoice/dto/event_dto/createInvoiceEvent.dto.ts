export enum NotificationChannel{
    email = 'EMAIL',
    sms = 'SMS',
    push = 'PUSH',
}

export enum NotificationType{
    created = 'CREATED',
    updated = 'UPDATED'

}

export class CreateInvoiceEvent {



    constructor(
        public readonly customerName: string,
        public readonly customerEmail: string,
        public readonly customerPhone: string,
        public readonly totalAmount: number,
        public readonly invoiceNumber: string,
        public readonly channel: NotificationChannel = NotificationChannel.email,
        public readonly template: NotificationType = NotificationType.created,
        public readonly userId: string
    ) {}


   toString(): string {
        return JSON.stringify({
            userId: this.userId,
            channel: this.channel,
            template: this.template,
            channelAddress: this.channel == "SMS" ? this.customerPhone : this.customerEmail,
            data:{
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            totalAmount: this.totalAmount,
            invoiceNumber: this.invoiceNumber,
            }
        });
    }
}