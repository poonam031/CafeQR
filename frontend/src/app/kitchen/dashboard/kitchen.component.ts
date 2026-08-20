import {
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { OrderService } from '../../services/order.service';

import {
    io,
    Socket
} from 'socket.io-client';


@Component({
    selector: 'app-kitchen',

    standalone: true,

    imports: [
        CommonModule
    ],

    templateUrl: './kitchen.component.html',

    styleUrls: [
        './kitchen.component.css'
    ]
})
export class KitchenComponent
    implements OnInit, OnDestroy {


    /* =========================================
       ORDERS
    ========================================== */

    orders: any[] = [];


    /* =========================================
       SOCKET
    ========================================== */

    private socket!: Socket;


    /* =========================================
       CONSTRUCTOR
    ========================================== */

    constructor(
        private orderService: OrderService
    ) {}


    /* =========================================
       INIT
    ========================================== */

    ngOnInit(): void {

        /*
         * Get existing orders from database
         */

        this.getOrders();


        /*
         * Connect to WebSocket
         */

        this.connectToOrderSocket();

    }


    /* =========================================
       SOCKET CONNECTION
    ========================================== */

    connectToOrderSocket(): void {

        this.socket = io(
            'http://localhost:3000'
        );


        /*
         * Listen for NEW ORDER
         */

        this.socket.on(
            'newOrder',
            (order: any) => {

                console.log(
                    'Kitchen received NEW ORDER:',
                    order
                );


                /*
                 * Ignore completed/cancelled
                 * orders in kitchen
                 */

                if (
                    order.status === 'Completed' ||
                    order.status === 'Cancelled'
                ) {

                    return;

                }


                /*
                 * Prevent duplicate order
                 */

                const alreadyExists =
                    this.orders.some(
                        existingOrder =>
                            existingOrder.id === order.id
                    );


                if (alreadyExists) {

                    return;

                }


                /*
                 * Add new order
                 */

                this.orders.push(order);


                /*
                 * Sort orders
                 */

                this.sortOrders();


                console.log(
                    'Kitchen orders updated:',
                    this.orders
                );

            }
        );

    }


    /* =========================================
       GET ORDERS
    ========================================== */

   getOrders(): void {
  this.orderService.getOrders().subscribe({
    next: (orders: any[]) => {

      this.orders = orders.filter(order =>
        order.status === 'Pending' ||
        order.status === 'Accepted' ||
        order.status === 'Preparing'
      );

    },

    error: (error) => {
      console.error('Failed to load kitchen orders:', error);
    }
  });
}


    /* =========================================
       SORT ORDERS
    ========================================== */

    sortOrders(): void {

        this.orders.sort(
            (a: any, b: any) => {

                /*
                 * Pending orders first
                 */

                if (
                    a.status === 'Pending' &&
                    b.status !== 'Pending'
                ) {

                    return -1;

                }


                if (
                    a.status !== 'Pending' &&
                    b.status === 'Pending'
                ) {

                    return 1;

                }


                /*
                 * Older orders first
                 */

                return (
                    new Date(
                        a.createdAt
                    ).getTime()

                    -

                    new Date(
                        b.createdAt
                    ).getTime()
                );

            }
        );

    }


    /* =========================================
       ACCEPT ORDER
    ========================================== */

    acceptOrder(order: any): void {

        this.orderService
            .updateOrderStatus(
                order.id,
                'Accepted'
            )
            .subscribe({

                next: () => {

                    this.getOrders();

                },

                error: (error) => {

                    console.error(
                        'Error accepting order:',
                        error
                    );

                }

            });

    }


    /* =========================================
       CANCEL ORDER
    ========================================== */

    cancelOrder(order: any): void {

        this.orderService
            .updateOrderStatus(
                order.id,
                'Cancelled'
            )
            .subscribe({

                next: () => {

                    this.getOrders();

                },

                error: (error) => {

                    console.error(
                        'Error cancelling order:',
                        error
                    );

                }

            });

    }


/* =========================================
   UPDATE ORDER STATUS
========================================== */

updateStatus(order: any): void {

    let status = '';

    switch (order.status) {

        case 'Pending':
            status = 'Accepted';
            break;

        case 'Accepted':
            status = 'Preparing';
            break;

        case 'Preparing':
            // MARK READY → MOVE TO HISTORY
            status = 'Completed';
            break;

        default:
            return;
    }

    this.orderService
        .updateOrderStatus(
            order.id,
            status
        )
        .subscribe({

            next: () => {

                console.log(
                    `Order #${order.id} updated to ${status}`
                );

                // Reload kitchen orders.
                // Completed orders are automatically removed.
                this.getOrders();

            },

            error: (error) => {

                console.error(
                    'Error updating order:',
                    error
                );

            }

        });
}


    /* =========================================
       DESTROY
    ========================================== */

    ngOnDestroy(): void {

        if (this.socket) {

            this.socket.disconnect();

        }

    }

}
