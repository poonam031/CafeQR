import {
  Component,
  EventEmitter,
  Output
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
  // ONLINE PAYMENT
  // ==========================================

  selectOnline(): void {

    this.paymentSelected.emit(
      'Online'
    );

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
  // CLOSE
  // ==========================================

  close(): void {

    this.closed.emit();

  }

}
