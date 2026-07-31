import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen.component.html',
  styleUrls: ['./kitchen.component.css']
})
export class KitchenComponent implements OnInit {

  orders: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
  this.orderService.getOrders().subscribe({
    next: (res: any) => {

      this.orders = res
        .filter((o: any) => o.status !== 'Completed')
        .sort((a: any, b: any) => {

          if (a.status === 'Pending' && b.status !== 'Pending') return -1;
          if (a.status !== 'Pending' && b.status === 'Pending') return 1;

          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

    }
  });
}

  acceptOrder(order: any) {
    this.orderService.updateOrderStatus(order.id, 'Accepted')
      .subscribe(() => this.getOrders());
  }

  cancelOrder(order: any) {
    this.orderService.updateOrderStatus(order.id, 'Cancelled')
      .subscribe(() => this.getOrders());
  }

  updateStatus(order: any) {

    let status = '';

    switch (order.status) {

      case 'Pending':
        status = 'Accepted';
        break;

      case 'Accepted':
        status = 'Preparing';
        break;

      case 'Preparing':
        status = 'Ready';
        break;

      case 'Ready':
        status = 'Completed';
        break;
    }

    this.orderService.updateOrderStatus(order.id, status)
      .subscribe(() => this.getOrders());

  }

}
