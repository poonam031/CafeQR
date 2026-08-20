/* eslint-disable prettier/prettier */
export class CreateReminderDto {

    type: string;

    customerName: string;

    date: string;

    time: string;

    guests?: number;

    tableNumber?: string;

    notes?: string;

    remindBefore?: string;
}