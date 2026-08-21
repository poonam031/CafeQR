import {
  Component,
  EventEmitter,
  Output,
  Input
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: [
    './payment.component.css'
  ]
})
export class PaymentComponent {

  // ==========================================
  // PAYMENT SELECTED
  // ==========================================

  @Output()
  paymentSelected =
    new EventEmitter<'Cash' | 'Online'>();


  // ==========================================
  // CLOSE POPUP
  // ==========================================

  @Output()
  closed =
    new EventEmitter<void>();


  // ==========================================
  // PAYMENT DATA
  // ==========================================

  @Input()
  amount: number = 1;

  @Input()
  upiId: string = 'poonammmali312001@oksbi';


  // ==========================================
  // OPEN GOOGLE PAY
  // ==========================================

  payWithGooglePay(): void {

    const upiUrl = this.createUpiUrl();

    // Google Pay
    const gpayUrl =
      'tez://upi/pay?' +
      upiUrl.substring(upiUrl.indexOf('?') + 1);

    this.openApp(gpayUrl, upiUrl);
  }


  // ==========================================
  // OPEN PHONEPE
  // ==========================================

  payWithPhonePe(): void {

    const upiUrl = this.createUpiUrl();

    // PhonePe
    const phonePeUrl =
      'phonepe://pay?' +
      upiUrl.substring(upiUrl.indexOf('?') + 1);

    this.openApp(phonePeUrl, upiUrl);
  }


  // ==========================================
  // OPEN PAYTM
  // ==========================================

  payWithPaytm(): void {

    const upiUrl = this.createUpiUrl();

    // Paytm
    const paytmUrl =
      'paytmmp://pay?' +
      upiUrl.substring(upiUrl.indexOf('?') + 1);

    this.openApp(paytmUrl, upiUrl);
  }


  // ==========================================
  // OPEN BHIM / OTHER UPI APP
  // ==========================================

  payWithUPI(): void {

    const upiUrl = this.createUpiUrl();

    window.location.href = upiUrl;
  }


  // ==========================================
  // CREATE UPI PAYMENT URL
  // ==========================================

  private createUpiUrl(): string {

    const params = new URLSearchParams();

    params.set('pa', this.upiId);

    params.set(
      'pn',
      'CafeQR'
    );

    params.set(
      'am',
      this.amount.toFixed(2)
    );

    params.set(
      'cu',
      'INR'
    );

    params.set(
      'tn',
      'CafeQR Order Payment'
    );

    return `upi://pay?${params.toString()}`;
  }


  // ==========================================
  // OPEN APP
  // ==========================================

  private openApp(
    appUrl: string,
    fallbackUrl: string
  ): void {

    const startTime = Date.now();

    window.location.href = appUrl;

    /*
     * If the app is not installed,
     * fall back to normal UPI.
     */
    setTimeout(() => {

      const elapsed =
        Date.now() - startTime;

      if (elapsed < 1800) {

        window.location.href =
          fallbackUrl;

      }

    }, 1500);
  }


  // ==========================================
  // CASH PAYMENT
  // ==========================================

  selectCash(): void {

    this.paymentSelected.emit(
      'Cash'
    );
  }


  // ==========================================
  // ONLINE PAYMENT
  // ==========================================

  selectOnline(): void {

    this.paymentSelected.emit(
      'Online'
    );
  }


  // ==========================================
  // CLOSE
  // ==========================================

  close(): void {

    this.closed.emit();
  }

}
