import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { PaymentComponent } from '../payment/payment.component';

@Component({
  selector: 'app-cart',
  standalone: true,

  imports: [
    CommonModule,
    PaymentComponent
  ],

  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  showPaymentPopup = false;

  placingOrder = false;

  constructor(
    public cartService: CartService,

    private orderService: OrderService,

    private router: Router
  ) {}

  // =========================================
  // OPEN PAYMENT POPUP
  // =========================================

  placeOrder(): void {

    if (
      this.cartService.getCartItems().length === 0
    ) {

      alert('Your cart is empty');

      return;
    }

    const tableId =
      Number(
        localStorage.getItem('tableId')
      );

    if (
      !tableId ||
      tableId < 1
    ) {

      alert('Table information is missing');

      return;
    }

    this.showPaymentPopup = true;
  }


  // =========================================
  // PAYMENT SELECTED
  // =========================================

  onPaymentSelected(
    paymentMethod: 'Cash' | 'Online'
  ): void {

    this.showPaymentPopup = false;

    this.createOrder(paymentMethod);
  }


  // =========================================
  // CREATE ORDER
  // =========================================

  private createOrder(
    paymentMethod: 'Cash' | 'Online'
  ): void {

    if (this.placingOrder) {
      return;
    }

    const tableId =
      Number(
        localStorage.getItem('tableId')
      );

    const items =
      this.cartService.getCartItems();

    const order = {

      tableId: tableId,

      customerName: 'QR Customer',

      items: items.map((item: any) => ({

        menuItemId:
          item.menuItemId ||
          item.id ||
          null,

        name:
          item.name,

        price:
          Number(item.price),

        quantity:
          Number(item.quantity)

      })),

      total:
        this.cartService.getTotal(),

      paymentMethod:
        paymentMethod,

      paymentStatus:
        'Pending'

    };

    console.log(
      'ORDER REQUEST:',
      order
    );

    this.placingOrder = true;

    this.orderService
      .placeOrder(order)
      .subscribe({

        next: (response) => {

          console.log(
            'ORDER CREATED:',
            response
          );

          this.placingOrder = false;


          // ==================================================
          // GET ORDER ID FROM BACKEND
          // ==================================================

          const orderId =
            response?.id ??
            response?.order?.id ??
            response?.data?.id ??
            response?.data?.order?.id;


          console.log(
            'ORDER ID:',
            orderId
          );


          // ==================================================
          // ONLINE PAYMENT
          // ==================================================

          if (
            paymentMethod === 'Online'
          ) {

            if (!orderId) {

              console.error(
                'Backend did not return order ID:',
                response
              );

              alert(
                'Order created, but order ID was not returned by server.'
              );

              return;
            }


            // Store order ID
            localStorage.setItem(
              'pendingPaymentOrderId',
              String(orderId)
            );


            // IMPORTANT:
            // DO NOT CLEAR CART YET.
            //
            // Customer still needs to complete payment.
            // ==================================================

            this.router.navigate([
              '/online-payment',
              orderId
            ]);

            return;
          }


          // ==================================================
          // CASH PAYMENT
          // ==================================================

          this.cartService.clearCart();

          this.router.navigate([
            '/order-success'
          ]);

        },


        error: (err) => {

          console.error(
            'ORDER ERROR:',
            err
          );

          this.placingOrder = false;

          const message =
            err?.error?.message ||
            err?.message ||
            'Failed to place order';

          alert(message);

        }

      });

  }


  // =========================================
  // CLOSE PAYMENT POPUP
  // =========================================

  closePaymentPopup(): void {

    if (this.placingOrder) {
      return;
    }

    this.showPaymentPopup = false;
  }

}
