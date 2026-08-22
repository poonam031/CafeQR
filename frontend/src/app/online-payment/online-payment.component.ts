import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  Subscription,
  interval
} from 'rxjs';

declare const Cashfree: any;

interface CashfreeCreateResponse {
  success: boolean;
  orderId: number;
  amount: number;
  currency: string;
  paymentId?: number;
  cashfreeOrderId?: string;
  paymentSessionId?: string;
  status?: string;
  message?: string;
}

interface CashfreeVerifyResponse {
  success: boolean;
  orderId: number;

  paymentStatus?: string;
  orderPaymentStatus?: string;

  transactionId?: string;
  bankTxnId?: string;

  responseCode?: string;
  responseMessage?: string;

  message?: string;
}

@Component({
  selector: 'app-online-payment',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './online-payment.component.html',
  styleUrl: './online-payment.component.css'
})
export class OnlinePaymentComponent
  implements OnInit, OnDestroy {

  // =====================================================
  // ORDER
  // =====================================================

  orderId = 0;


  // =====================================================
  // PAYMENT DATA
  // =====================================================

  amount = 0;

  currency = 'INR';

  paymentId = 0;

  cashfreeOrderId = '';

  paymentSessionId = '';

  transactionId = '';

  bankTxnId = '';

  paymentStatus = 'PENDING';


  // =====================================================
  // UI STATES
  // =====================================================

  loading = true;

  paymentProcessing = false;

  paymentSuccess = false;

  paymentFailed = false;

  paymentExpired = false;

  errorMessage = '';

  paymentMessage =
    'Complete the payment to continue.';


  // =====================================================
  // POLLING
  // =====================================================

  private pollingSubscription:
    Subscription | null = null;


  // =====================================================
  // BACKEND
  // =====================================================

  private readonly apiUrl =
    'https://cafeqr-wds8.onrender.com';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.route.params.subscribe(params => {

      this.orderId =
        Number(params['orderId']);

      console.log(
        'ONLINE PAYMENT ORDER ID:',
        this.orderId
      );

      if (
        !this.orderId ||
        this.orderId <= 0
      ) {

        this.loading = false;

        this.paymentFailed = true;

        this.errorMessage =
          'Invalid order ID.';

        return;
      }

      this.createCashfreePayment();

    });

  }


  // =====================================================
  // CREATE CASHFREE PAYMENT
  // =====================================================

  createCashfreePayment(): void {

    this.loading = true;

    this.paymentProcessing = false;

    this.paymentSuccess = false;

    this.paymentFailed = false;

    this.paymentExpired = false;

    this.errorMessage = '';

    this.transactionId = '';

    this.bankTxnId = '';

    this.paymentMessage =
      'Creating secure Cashfree payment...';


    this.http
      .post<CashfreeCreateResponse>(
        `${this.apiUrl}/payments/cashfree/create/${this.orderId}`,
        {}
      )
      .subscribe({

        next: (response) => {

          console.log(
            'CASHFREE CREATE RESPONSE:',
            response
          );


          if (
            !response ||
            !response.success
          ) {

            this.loading = false;

            this.paymentFailed = true;

            this.errorMessage =
              response?.message ||
              'Unable to create Cashfree payment.';

            return;
          }


          // ---------------------------------------------
          // SAVE PAYMENT INFORMATION
          // ---------------------------------------------

          this.amount =
            Number(response.amount || 0);

          this.currency =
            response.currency || 'INR';

          this.paymentId =
            Number(response.paymentId || 0);

          this.cashfreeOrderId =
            response.cashfreeOrderId || '';

          this.paymentSessionId =
            response.paymentSessionId || '';

          this.paymentStatus =
            this.normalizeStatus(
              response.status || 'PENDING'
            );


          // ---------------------------------------------
          // CHECK SESSION
          // ---------------------------------------------

          if (!this.paymentSessionId) {

            this.loading = false;

            this.paymentFailed = true;

            this.errorMessage =
              'Cashfree payment session was not received.';

            return;
          }


          this.loading = false;

          this.paymentMessage =
            'Click Proceed to Pay to open Cashfree checkout.';


        },

        error: (error) => {

          console.error(
            'CASHFREE CREATE ERROR:',
            error
          );

          this.loading = false;

          this.paymentFailed = true;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to create Cashfree payment.';

        }

      });

  }


  // =====================================================
  // OPEN CASHFREE CHECKOUT
  // =====================================================

  openCashfreeCheckout(): void {

    if (!this.paymentSessionId) {

      this.errorMessage =
        'Cashfree payment session is missing.';

      return;
    }


    if (
      typeof Cashfree === 'undefined'
    ) {

      this.paymentFailed = true;

      this.errorMessage =
        'Cashfree SDK is not loaded. Add the Cashfree script in index.html.';

      return;
    }


    this.paymentProcessing = true;

    this.paymentFailed = false;

    this.paymentExpired = false;

    this.errorMessage = '';

    this.paymentMessage =
      'Complete the payment in Cashfree checkout.';


    try {

      // IMPORTANT:
      // Your Cashfree dashboard is currently
      // using Test/Sandbox environment.

      const cashfree =
        Cashfree({
          mode: 'sandbox'
        });


      const checkoutOptions = {

        paymentSessionId:
          this.paymentSessionId,

        redirectTarget:
          '_modal'

      };


      console.log(
        'OPENING CASHFREE CHECKOUT'
      );


      cashfree
        .checkout(checkoutOptions)

        .then((result: any) => {

          console.log(
            'CASHFREE CHECKOUT RESULT:',
            result
          );


          this.paymentProcessing =
            false;


          /*
           * IMPORTANT
           *
           * Do NOT trust the checkout callback
           * as the final payment status.
           *
           * Always ask our backend.
           */

          this.verifyPayment(true);

          this.startPolling();

        })

        .catch((error: any) => {

          console.error(
            'CASHFREE CHECKOUT ERROR:',
            error
          );


          this.paymentProcessing =
            false;


          this.paymentMessage =
            'Checkout closed. Checking payment status...';


          /*
           * Customer may have completed
           * payment before closing checkout.
           */

          this.verifyPayment(true);

          this.startPolling();

        });


    }

    catch (error) {

      console.error(
        'CASHFREE SDK ERROR:',
        error
      );

      this.paymentProcessing =
        false;

      this.paymentFailed =
        true;

      this.errorMessage =
        'Unable to open Cashfree checkout.';

    }

  }


  // =====================================================
  // VERIFY CASHFREE PAYMENT
  // =====================================================

  verifyPayment(
    showPendingMessage = true
  ): void {

    if (
      !this.orderId
    ) {

      return;
    }


    this.http
      .get<CashfreeVerifyResponse>(
        `${this.apiUrl}/payments/cashfree/verify/${this.orderId}`
      )

      .subscribe({

        next: (response) => {

          console.log(
            'CASHFREE VERIFY RESPONSE:',
            response
          );


          const status =
            this.getPaymentStatus(response);


          this.paymentStatus =
            status;


          if (
            response?.transactionId
          ) {

            this.transactionId =
              response.transactionId;

          }


          if (
            response?.bankTxnId
          ) {

            this.bankTxnId =
              response.bankTxnId;

          }


          // =================================================
          // PAID
          // =================================================

          if (
            status === 'PAID'
          ) {

            console.log(
              'PAYMENT SUCCESSFULLY VERIFIED'
            );


            this.paymentSuccess =
              true;

            this.paymentFailed =
              false;

            this.paymentExpired =
              false;

            this.paymentProcessing =
              false;


            this.paymentMessage =
              'Payment verified successfully.';


            this.stopPolling();


            /*
             * Clear cart ONLY after backend
             * verification.
             */

            localStorage.removeItem(
              'cart'
            );

            localStorage.removeItem(
              'pendingPaymentOrderId'
            );


            return;
          }


          // =================================================
          // FAILED
          // =================================================

          if (
            status === 'FAILED'
          ) {

            console.log(
              'PAYMENT FAILED'
            );


            this.paymentFailed =
              true;

            this.paymentSuccess =
              false;

            this.paymentExpired =
              false;

            this.paymentProcessing =
              false;


            this.errorMessage =
              response?.responseMessage ||
              response?.message ||
              'Payment failed or was not completed.';


            this.paymentMessage =
              'Payment failed or was not completed.';


            this.stopPolling();


            return;
          }


          // =================================================
          // EXPIRED
          // =================================================

          if (
            status === 'EXPIRED'
          ) {

            this.paymentExpired =
              true;

            this.paymentSuccess =
              false;

            this.paymentFailed =
              false;

            this.paymentProcessing =
              false;


            this.paymentMessage =
              'Payment request expired.';


            this.stopPolling();


            return;
          }


          // =================================================
          // PENDING
          // =================================================

          this.paymentStatus =
            'PENDING';

          this.paymentSuccess =
            false;

          this.paymentFailed =
            false;

          this.paymentExpired =
            false;


          if (
            showPendingMessage
          ) {

            this.paymentMessage =
              'Payment is pending. We are checking the status automatically.';

          }

        },

        error: (error) => {

          /*
           * IMPORTANT:
           *
           * Network/backend error does NOT mean
           * payment failed.
           *
           * Continue polling.
           */

          console.warn(
            'CASHFREE VERIFY ERROR:',
            error
          );

        }

      });

  }


  // =====================================================
  // GET STATUS
  // =====================================================

  private getPaymentStatus(
    response: CashfreeVerifyResponse
  ): string {

    const rawStatus =
      String(
        response?.paymentStatus ||
        response?.orderPaymentStatus ||
        'PENDING'
      ).toUpperCase();


    return this.normalizeStatus(
      rawStatus
    );

  }


  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  private normalizeStatus(
    status: string
  ): string {

    const value =
      String(status || '')
        .trim()
        .toUpperCase();


    // SUCCESS

    if (
      value === 'PAID' ||
      value === 'SUCCESS' ||
      value === 'COMPLETED'
    ) {

      return 'PAID';

    }


    // FAILED

    if (
      value === 'FAILED' ||
      value === 'FAILURE' ||
      value === 'CANCELLED' ||
      value === 'USER_DROPPED'
    ) {

      return 'FAILED';

    }


    // EXPIRED

    if (
      value === 'EXPIRED' ||
      value === 'EXPIRE'
    ) {

      return 'EXPIRED';

    }


    // Everything else remains pending.

    return 'PENDING';

  }


  // =====================================================
  // START POLLING
  // =====================================================

  startPolling(): void {

    this.stopPolling();


    this.pollingSubscription =
      interval(3000)
        .subscribe(() => {

          if (
            this.paymentSuccess ||
            this.paymentFailed ||
            this.paymentExpired
          ) {

            this.stopPolling();

            return;

          }


          this.verifyPayment(true);

        });

  }


  // =====================================================
  // STOP POLLING
  // =====================================================

  stopPolling(): void {

    if (
      this.pollingSubscription
    ) {

      this.pollingSubscription.unsubscribe();

      this.pollingSubscription =
        null;

    }

  }


  // =====================================================
  // RETRY
  // =====================================================

  retryPayment(): void {

    this.stopPolling();


    this.loading = true;

    this.paymentSuccess =
      false;

    this.paymentFailed =
      false;

    this.paymentExpired =
      false;

    this.paymentProcessing =
      false;

    this.errorMessage = '';

    this.transactionId = '';

    this.bankTxnId = '';

    this.paymentSessionId = '';

    this.cashfreeOrderId = '';

    this.paymentStatus =
      'PENDING';


    this.createCashfreePayment();

  }


  // =====================================================
  // BACK TO CART
  // =====================================================

  cancelPayment(): void {

    this.stopPolling();

    this.router.navigate([
      '/cart'
    ]);

  }


  // =====================================================
  // SUCCESS
  // =====================================================

  continueToSuccess(): void {

    this.stopPolling();

    this.router.navigate([
      '/order-success'
    ]);

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.stopPolling();

  }

}
