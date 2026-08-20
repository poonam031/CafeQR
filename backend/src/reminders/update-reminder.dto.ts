/* eslint-disable prettier/prettier */
export class UpdateReminderDto {

    type?: string;

    customerName?: string;

    date?: string;

    time?: string;

    guests?: number;

    tableNumber?: string;

    notes?: string;

    remindBefore?: string;

    completed?: boolean;
}