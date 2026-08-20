import { Component, OnInit, OnDestroy } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  io,
  Socket
} from 'socket.io-client';


interface Order {

  id: number;

  tableId: number;

  items: any[];

  total: number;

  status: string;

  createdAt: string;

  paymentMethod?: string;

}


@Component({

  selector: 'app-history',

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],

  templateUrl: './history.component.html',

  styleUrl: './history.component.css'

})


export class HistoryComponent
  implements OnInit, OnDestroy {


  // =========================================
  // ORDERS
  // =========================================

  orders: Order[] = [];

  filteredOrders: Order[] = [];


  // =========================================
  // FILTERS
  // =========================================

  searchOrderId = '';

  selectedDate = '';

  selectedPayment = 'All Payments';

  selectedStatus = 'All Status';


  // =========================================
  // SUMMARY
  // =========================================

  totalOrders = 0;

  completedOrders = 0;

  cancelledOrders = 0;


  // =========================================
  // STATES
  // =========================================

  loading = false;

  errorMessage = '';


  // =========================================
  // SOCKET
  // =========================================

  private socket!: Socket;


  // =========================================
  // BACKEND URL
  // =========================================

  private apiUrl =
    'https://cafeqr-wds8.onrender.com/orders';

  private socketUrl =
    'https://cafeqr-wds8.onrender.com';



  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // INITIALIZE
  // =========================================

  ngOnInit(): void {

    this.loadHistory();

    this.connectSocket();

  }


  // =========================================
  // LOAD HISTORY FROM DATABASE
  // =========================================

  loadHistory(): void {

    this.loading = true;

    this.http
      .get<Order[]>(this.apiUrl)
      .subscribe({

        next: (orders) => {

          this.orders = orders;

          this.applyFilters();

          this.loading = false;

          this.errorMessage = '';

        },

        error: (error) => {

          console.error(
            'History API Error:',
            error
          );

          this.errorMessage =
            'Unable to load order history.';

          this.loading = false;

        }

      });

  }


  // =========================================
  // CONNECT SOCKET
  // =========================================

  connectSocket(): void {

    this.socket = io(
      this.socketUrl
    );


    // Socket connected

    this.socket.on(
      'connect',
      () => {

        console.log(
          'History WebSocket connected'
        );

      }
    );


    // =========================================
    // ORDER STATUS UPDATED
    // =========================================

    this.socket.on(
      'orderUpdated',
      (updatedOrder: Order) => {

        console.log(
          'Real-time order update:',
          updatedOrder
        );


        const index =
          this.orders.findIndex(
            order =>
              order.id ===
              updatedOrder.id
          );


        if (index !== -1) {

          // Update existing order

          this.orders[index] =
            updatedOrder;

        }
        else {

          // Add new order

          this.orders.push(
            updatedOrder
          );

        }


        // Refresh table

        this.applyFilters();

      }
    );


    // =========================================
    // NEW ORDER
    // =========================================

    this.socket.on(
      'newOrder',
      (newOrder: Order) => {

        console.log(
          'New order received:',
          newOrder
        );


        const exists =
          this.orders.some(
            order =>
              order.id ===
              newOrder.id
          );


        if (!exists) {

          this.orders.push(
            newOrder
          );

        }


        this.applyFilters();

      }
    );


    // =========================================
    // DISCONNECTED
    // =========================================

    this.socket.on(
      'disconnect',
      () => {

        console.log(
          'History WebSocket disconnected'
        );

      }
    );

  }


  // =========================================
  // APPLY FILTERS
  // =========================================

  applyFilters(): void {

    let result =
      [...this.orders];


    // =========================================
    // ONLY HISTORY ORDERS
    // COMPLETED + CANCELLED
    // =========================================

    result =
      result.filter(
        order => {

          const status =
            order.status.toLowerCase();

          return (
            status === 'completed' ||
            status === 'cancelled'
          );

        }
      );


    // =========================================
    // SEARCH ORDER ID
    // =========================================

    if (
      this.searchOrderId.trim()
    ) {

      result =
        result.filter(
          order =>

            order.id
              .toString()
              .includes(
                this.searchOrderId.trim()
              )

        );

    }


    // =========================================
    // DATE FILTER
    // =========================================

    if (this.selectedDate) {

      result =
        result.filter(
          order => {

            const orderDate =
              new Date(
                order.createdAt
              )
                .toISOString()
                .split('T')[0];

            return (
              orderDate ===
              this.selectedDate
            );

          }
        );

    }


    // =========================================
    // PAYMENT FILTER
    // =========================================

    if (
      this.selectedPayment !==
      'All Payments'
    ) {

      result =
        result.filter(
          order =>

            order.paymentMethod ===
            this.selectedPayment

        );

    }


    // =========================================
    // STATUS FILTER
    // =========================================

    if (
      this.selectedStatus !==
      'All Status'
    ) {

      result =
        result.filter(
          order =>

            order.status ===
            this.selectedStatus

        );

    }


    // =========================================
    // NEWEST FIRST
    // =========================================

    result.sort(
      (a, b) =>

        new Date(
          b.createdAt
        ).getTime()

        -

        new Date(
          a.createdAt
        ).getTime()

    );


    this.filteredOrders =
      result;


    this.calculateSummary();

  }


  // =========================================
  // SUMMARY
  // =========================================

  calculateSummary(): void {

    const historyOrders =
      this.orders.filter(
        order => {

          const status =
            order.status.toLowerCase();

          return (
            status === 'completed' ||
            status === 'cancelled'
          );

        }
      );


    this.totalOrders =
      historyOrders.length;


    this.completedOrders =
      historyOrders.filter(
        order =>

          order.status.toLowerCase()
          === 'completed'

      ).length;


    this.cancelledOrders =
      historyOrders.filter(
        order =>

          order.status.toLowerCase()
          === 'cancelled'

      ).length;

  }


  // =========================================
  // TABLE NAME
  // =========================================

  getTableName(
    order: Order
  ): string {

    return (
      'T-' +
      order.tableId
        .toString()
        .padStart(2, '0')
    );

  }


  // =========================================
  // DATE
  // =========================================

  getDate(
    order: Order
  ): string {

    return new Date(
      order.createdAt
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  // =========================================
  // TIME
  // =========================================

  getTime(
    order: Order
  ): string {

    return new Date(
      order.createdAt
    ).toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }


  // =========================================
  // STATUS CSS CLASS
  // =========================================

  getStatusClass(
    status: string
  ): string {

    switch (
      status.toLowerCase()
    ) {

      case 'completed':

        return 'completed';


      case 'cancelled':

        return 'cancelled';


      default:

        return 'pending';

    }

  }


  // =========================================
  // PAYMENT CSS CLASS
  // =========================================

  getPaymentClass(
    payment: string
  ): string {

    if (
      payment === 'Cash'
    ) {

      return 'cash';

    }


    if (
      payment === 'Online'
    ) {

      return 'online';

    }


    return '';

  }


  // =========================================
  // VIEW ORDER
  // =========================================

  viewOrder(
    order: Order
  ): void {

    console.log(
      'Order details:',
      order
    );

  }


  // =========================================
  // DESTROY
  // =========================================

  ngOnDestroy(): void {

    if (this.socket) {

      this.socket.disconnect();

    }

  }

}
