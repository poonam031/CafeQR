import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface UpiPaymentResponse {

  success: boolean;

  orderId: number;

  amount: number;

  currency: string;

  paymentId: number;

  merchantOrderId: string;

  status: string;

  expiresAt: string;

  upiId: string;

  upiUrl: string;

  message: string;
}


export interface UpiPaymentStatusResponse {

  success: boolean;

  orderId: number;

  amount: number;

  paymentId: number;

  merchantOrderId: string;

  paymentStatus: string;

  orderPaymentStatus: string;

  transactionId?: string;

  bankTxnId?: string;

  responseCode?: string;

  responseMessage?: string;

  paidAt?: string;

  expiresAt?: string;
}


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly baseUrl =
    'https://cafeqr-wds8.onrender.com';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // CREATE UPI PAYMENT
  // ==========================================

  createUpiPayment(
    orderId: number
  ): Observable<UpiPaymentResponse> {

    return this.http.post<UpiPaymentResponse>(

      `${this.baseUrl}/payments/upi/create/${orderId}`,

      {}

    );

  }


  // ==========================================
  // CHECK UPI PAYMENT STATUS
  // ==========================================

  getUpiPaymentStatus(
    orderId: number
  ): Observable<UpiPaymentStatusResponse> {

    return this.http.get<UpiPaymentStatusResponse>(

      `${this.baseUrl}/payments/upi/status/${orderId}`

    );

  }


  // ==========================================
  // GET COMPLETE PAYMENT
  // ==========================================

  getPayment(
    orderId: number
  ): Observable<any> {

    return this.http.get<any>(

      `${this.baseUrl}/payments/order/${orderId}`

    );

  }

}
