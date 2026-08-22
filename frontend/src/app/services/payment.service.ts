import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


// ==========================================
// CASHFREE PAYMENT RESPONSE
// ==========================================

export interface CashfreePaymentResponse {

  success: boolean;

  orderId: number;

  amount: number;

  currency: string;

  paymentId: number;

  merchantOrderId: string;

  paymentSessionId: string;

  status: string;

  expiresAt?: string;

  message: string;

}


// ==========================================
// CASHFREE PAYMENT STATUS
// ==========================================

export interface CashfreePaymentStatusResponse {

  success: boolean;

  orderId: number;

  amount: number;

  paymentStatus: string;

  orderPaymentStatus: string;

  transactionId?: string;

  bankTxnId?: string;

  responseCode?: string;

  responseMessage?: string;

  paidAt?: string;

}


@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  // ==========================================
  // BACKEND URL
  // ==========================================

  private readonly baseUrl =
    'https://cafeqr-wds8.onrender.com';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // CREATE CASHFREE PAYMENT
  // ==========================================

  createCashfreePayment(
    orderId: number
  ): Observable<CashfreePaymentResponse> {

    return this.http.post<CashfreePaymentResponse>(

      `${this.baseUrl}/payments/cashfree/create/${orderId}`,

      {}

    );

  }


  // ==========================================
  // CHECK CASHFREE PAYMENT STATUS
  // ==========================================

  getCashfreePaymentStatus(
    orderId: number
  ): Observable<CashfreePaymentStatusResponse> {

    return this.http.get<CashfreePaymentStatusResponse>(

      `${this.baseUrl}/payments/cashfree/verify/${orderId}`

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


  // ==========================================
  // OLD UPI PAYMENT
  // ==========================================

  createUpiPayment(
    orderId: number
  ): Observable<any> {

    return this.http.post<any>(

      `${this.baseUrl}/payments/upi/create/${orderId}`,

      {}

    );

  }


  // ==========================================
  // OLD UPI STATUS
  // ==========================================

  getUpiPaymentStatus(
    orderId: number
  ): Observable<any> {

    return this.http.get<any>(

      `${this.baseUrl}/payments/upi/status/${orderId}`

    );

  }

}
