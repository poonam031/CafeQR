import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reminder {
    id?: number;
    type: string;
    customerName: string;
    date: string;
    time: string;
    guests?: number;
    tableNumber?: string;
    notes?: string;
    remindBefore?: string;
    completed?: boolean;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReminderService {

    private apiUrl = 'https://cafeqr-wds8.onrender.com/reminders';

    constructor(
        private http: HttpClient
    ) {}


    createReminder(
        reminder: Reminder
    ): Observable<Reminder> {

        return this.http.post<Reminder>(
            this.apiUrl,
            reminder
        );

    }


    getReminders(): Observable<Reminder[]> {

        return this.http.get<Reminder[]>(
            this.apiUrl
        );

    }


    deleteReminder(
        id: number
    ): Observable<any> {

        return this.http.delete(
            `${this.apiUrl}/${id}`
        );

    }

}
