import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private router: Router)
   {}

   placeOrder() {

    const order = {
      tableId: Number(localStorage.getItem('tableId')),
      items: this.cartService.getCartItems(),
      total: this.cartService.getTotal()
    };

    this.orderService.placeOrder(order).subscribe({

      next: () => {

        alert('Order Placed Successfully');

        this.cartService.clearCart();

        this.router.navigate(['/order-success']);

      },

      error: (err) => {

        console.error(err);

        alert('Failed to place order');

      }

    });

  }

}
