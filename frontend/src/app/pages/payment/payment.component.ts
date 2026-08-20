import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {

  @Output() paymentSelected =
    new EventEmitter<'Cash' | 'Online'>();

  @Output() closed =
    new EventEmitter<void>();

  selectedMethod: 'Cash' | 'Online' | null = null;

  selectPayment(method: 'Cash' | 'Online'): void {

    this.selectedMethod = method;

  }

  confirmPayment(): void {

    if (!this.selectedMethod) {
      return;
    }

    this.paymentSelected.emit(
      this.selectedMethod
    );

  }

  closePopup(): void {

    this.closed.emit();

  }

}
