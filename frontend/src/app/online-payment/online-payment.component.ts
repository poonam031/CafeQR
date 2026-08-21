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
  Subscription,
  interval
} from 'rxjs';

import {
  switchMap
} from 'rxjs/operators';

import {
  PaymentService,
  UpiPaymentResponse,
  UpiPaymentStatusResponse
} from '../services/payment.service';


@Component({

  selector:
    'app-online-payment',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './online-payment.component.html',

  styleUrl:
    './online-payment.component.css'

})


export class OnlinePaymentComponent
  implements OnInit, OnDestroy {


  // ==========================================
  // ORDER
  // ==========================================

  orderId = 0;


  // ==========================================
  // PAYMENT
  // ==========================================

  amount = 0;

  currency = 'INR';

  paymentId = 0;

  merchantOrderId = '';

  upiId = '';

  upiUrl = '';

  paymentStatus = 'PENDING';

  transactionId = '';


  // ==========================================
  // UI
  // ==========================================

  loading = true;

  paymentProcessing = false;

  paymentSuccess = false;

  paymentFailed = false;

  paymentExpired = false;

  errorMessage = '';

  showUpiApps = false;


  // ==========================================
  // POLLING
  // ==========================================

  private pollingSubscription:
    Subscription | null = null;


  constructor(

    private route:
      ActivatedRoute,

    private router:
      Router,

    private paymentService:
      PaymentService

  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.route.params.subscribe(
      params => {

        this.orderId =
          Number(
            params['orderId']
          );


        if (
          !this.orderId ||
          this.orderId <= 0
        ) {

          this.loading = false;

          this.errorMessage =
            'Invalid order ID.';

          return;

        }


        this.createUpiPayment();

      }
    );

  }


  // ==========================================
  // CREATE UPI PAYMENT
  // ==========================================

  createUpiPayment(): void {

    this.loading = true;

    this.paymentProcessing = false;

    this.paymentSuccess = false;

    this.paymentFailed = false;

    this.paymentExpired = false;

    this.errorMessage = '';


    this.paymentService
      .createUpiPayment(
        this.orderId
      )
      .subscribe({

        next:
          (response:
            UpiPaymentResponse) => {

            console.log(
              'UPI PAYMENT CREATED:',
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
                'Unable to create UPI payment.';

              return;

            }


            // ==================================
            // SAVE PAYMENT DATA
            // ==================================

            this.amount =
              Number(
                response.amount
              );


            this.currency =
              response.currency ||
              'INR';


            this.paymentId =
              Number(
                response.paymentId
              );


            this.merchantOrderId =
              response.merchantOrderId;


            this.upiId =
              response.upiId;


            this.upiUrl =
              response.upiUrl;


            this.paymentStatus =
              response.status ||
              'PENDING';


            this.loading = false;


            console.log(
              'UPI URL:',
              this.upiUrl
            );


            // ==================================
            // START STATUS POLLING
            // ==================================

            this.startPolling();

          },


        error:
          (error) => {

            console.error(
              'UPI CREATE ERROR:',
              error
            );


            this.loading = false;

            this.paymentFailed = true;

            this.errorMessage =
              error?.error?.message ||
              'Unable to create UPI payment.';

          }

      });

  }


  // ==========================================
  // OPEN UPI APP
  // ==========================================

  payWithUpi(): void {

    if (!this.upiUrl) {

      this.errorMessage =
        'UPI payment link is not available.';

      return;

    }


    this.paymentProcessing = true;

    this.errorMessage = '';


    console.log(
      'Opening UPI:',
      this.upiUrl
    );


    // ========================================
    // OPEN UPI INTENT
    // ========================================

    window.location.href =
      this.upiUrl;


    // ========================================
    // DO NOT MARK PAYMENT SUCCESS HERE
    //
    // Backend status remains PENDING until
    // trusted payment verification changes it.
    // ========================================

  }


  // ==========================================
// GOOGLE PAY
// ==========================================

payWithGooglePay(): void {

  if (!this.upiUrl) {

    this.errorMessage =
      'UPI payment link is not available.';

    return;
  }

  this.paymentProcessing = true;

  this.errorMessage = '';

  const query =
    this.upiUrl.substring(
      this.upiUrl.indexOf('?') + 1
    );

  const googlePayUrl =
    `tez://upi/pay?${query}`;

  console.log(
    'Opening Google Pay:',
    googlePayUrl
  );

  this.openUpiApp(
    googlePayUrl
  );
}


// ==========================================
// PHONEPE
// ==========================================

payWithPhonePe(): void {

  if (!this.upiId || !this.amount) {
    this.errorMessage = 'Invalid payment details.';
    return;
  }

  const params = new URLSearchParams();

  params.set('pa', this.upiId);
  params.set('pn', 'CafeQR');
  params.set('am', Number(this.amount).toFixed(2));
  params.set('cu', 'INR');

  if (this.merchantOrderId) {
    params.set('tr', this.merchantOrderId);
  }

  params.set(
    'tn',
    `CafeQR Order ${this.orderId}`
  );

  const phonePeUrl =
    `phonepe://pay?${params.toString()}`;

  console.log(
    'PHONEPE PAYMENT URL:',
    phonePeUrl
  );

  this.paymentProcessing = true;

  window.location.href = phonePeUrl;

  setTimeout(() => {
    this.paymentProcessing = false;
  }, 3000);
}


// ==========================================
// PAYTM
// ==========================================

payWithPaytm(): void {

  if (!this.upiUrl) {

    this.errorMessage =
      'UPI payment link is not available.';

    return;
  }

  this.paymentProcessing = true;

  this.errorMessage = '';

  const query =
    this.upiUrl.substring(
      this.upiUrl.indexOf('?') + 1
    );

  const paytmUrl =
    `paytmmp://pay?${query}`;

  console.log(
    'Opening Paytm:',
    paytmUrl
  );

  this.openUpiApp(
    paytmUrl
  );
}


// ==========================================
// OPEN SELECTED UPI APP
// ==========================================

private openUpiApp(
  appUrl: string
): void {

  const startTime =
    Date.now();

  window.location.href =
    appUrl;

  setTimeout(() => {

    const elapsed =
      Date.now() - startTime;

    if (elapsed < 2000) {

      this.paymentProcessing = false;

      if (this.upiUrl) {

        window.location.href =
          this.upiUrl;

      }

    }

  }, 1500);
}

  // ==========================================
  // SHOW UPI APPS
  // ==========================================

  showPaymentApps(): void {

    this.showUpiApps = true;

  }


  // ==========================================
  // HIDE UPI APPS
  // ==========================================

  hidePaymentApps(): void {

    this.showUpiApps = false;

  }


  // ==========================================
  // POLL PAYMENT STATUS
  // ==========================================

  startPolling(): void {

    this.stopPolling();


    this.pollingSubscription =
      interval(3000)

        .pipe(

          switchMap(() =>

            this.paymentService
              .getUpiPaymentStatus(
                this.orderId
              )

          )

        )

        .subscribe({

          next:
            (
              response:
                UpiPaymentStatusResponse
            ) => {

              console.log(
                'UPI STATUS:',
                response
              );


              this.paymentStatus =
                response.paymentStatus;


              this.transactionId =
                response.transactionId ||
                '';


              // ==================================
              // PAYMENT SUCCESS
              // ==================================

              if (
                response.paymentStatus ===
                'PAID'
              ) {

                this.paymentSuccess =
                  true;

                this.paymentProcessing =
                  false;

                this.paymentFailed =
                  false;

                this.paymentExpired =
                  false;


                this.stopPolling();


                // =================================
                // CLEAR CART ONLY AFTER PAID
                // =================================

                localStorage.removeItem(
                  'cart'
                );

                localStorage.removeItem(
                  'pendingPaymentOrderId'
                );


                return;

              }


              // ==================================
              // PAYMENT EXPIRED
              // ==================================

              if (
                response.paymentStatus ===
                'EXPIRED'
              ) {

                this.paymentExpired =
                  true;

                this.paymentProcessing =
                  false;

                this.stopPolling();


                return;

              }


              // ==================================
              // PAYMENT FAILED
              // ==================================

              if (
                response.paymentStatus ===
                'FAILED'
              ) {

                this.paymentFailed =
                  true;

                this.paymentProcessing =
                  false;

                this.errorMessage =
                  response.responseMessage ||
                  'UPI payment failed.';

                this.stopPolling();

              }

            },


          error:
            (error) => {

              // Do NOT show failure just because
              // one polling request failed.

              console.warn(
                'UPI STATUS CHECK ERROR:',
                error
              );

            }

        });

  }


  // ==========================================
  // STOP POLLING
  // ==========================================

  stopPolling(): void {

    if (
      this.pollingSubscription
    ) {

      this.pollingSubscription.unsubscribe();

      this.pollingSubscription =
        null;

    }

  }


  // ==========================================
  // RETRY
  // ==========================================

  retryPayment(): void {

    this.stopPolling();

    this.paymentFailed =
      false;

    this.paymentExpired =
      false;

    this.paymentSuccess =
      false;

    this.paymentProcessing =
      false;

    this.errorMessage =
      '';

    this.createUpiPayment();

  }


  // ==========================================
  // BACK TO CART
  // ==========================================

  cancelPayment(): void {

    if (
      this.paymentProcessing
    ) {

      // Allow customer to leave even if
      // UPI app was opened.

    }


    this.stopPolling();


    this.router.navigate([
      '/cart'
    ]);

  }


  // ==========================================
  // SUCCESS
  // ==========================================

  continueToSuccess(): void {

    this.stopPolling();


    this.router.navigate([
      '/order-success'
    ]);

  }


  // ==========================================
  // COPY UPI ID
  // ==========================================

  copyUpiId(): void {

    if (!this.upiId) {
      return;
    }


    navigator.clipboard
      .writeText(
        this.upiId
      )
      .then(() => {

        alert(
          'UPI ID copied'
        );

      })

      .catch(() => {

        alert(
          'Unable to copy UPI ID'
        );

      });

  }


  // ==========================================
  // DESTROY
  // ==========================================

  ngOnDestroy(): void {

    this.stopPolling();

  }

}
