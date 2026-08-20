import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  Router
} from '@angular/router';


interface CafeTable {

  id: number;

  tableNumber: number;

  seats: number;

  status: 'FREE' | 'BOOKED';

  customerName?: string;

  bookingTime?: string;

}


interface Order {

  id: number;

  tableId: number;

  customerName?: string;

  items: any[];

  total: number;

  paymentMethod:
    | 'Cash'
    | 'Online';

  paymentStatus:
    | 'Paid'
    | 'Pending';

  status:
    | 'Pending'
    | 'Accepted'
    | 'Preparing'
    | 'Served'
    | 'Completed';

  transactionId?: string;

  paidAt?: string;

  createdAt?: string;

}


@Component({

  selector: 'app-dashboard',

  standalone: true,

  imports: [

    CommonModule,

    HttpClientModule

  ],

  templateUrl:
    './dashboard.component.html',

  styleUrl:
    './dashboard.component.css'

})


export class DashboardComponent
  implements OnInit, OnDestroy {


  // =====================================================
  // API
  // =====================================================

  private tablesApi =
    'http://localhost:3000/tables';


  private ordersApi =
    'http://localhost:3000/orders';


  // =====================================================
  // DATA
  // =====================================================

  tables: CafeTable[] = [];

  orders: Order[] = [];


  // =====================================================
  // TABLE COUNTS
  // =====================================================

  totalTables = 0;

  bookedTables = 0;

  freeTables = 0;


  // =====================================================
  // ORDER COUNTS
  // =====================================================

  pendingOrders = 0;

  acceptedOrders = 0;

  preparingOrders = 0;

  servedOrders = 0;


  // =====================================================
  // SALES
  // =====================================================

  todaysSale = 0;

  averageOrder = 0;


  // =====================================================
  // LOADING
  // =====================================================

  loadingTables = false;

  loadingOrders = false;


  // =====================================================
  // REFRESH
  // =====================================================

  private refreshTimer: any;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private http: HttpClient,

    private router: Router

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadDashboard();

    this.refreshTimer =
      setInterval(
        () => {

          this.loadDashboard();

        },
        5000
      );

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    if (this.refreshTimer) {

      clearInterval(
        this.refreshTimer
      );

    }

  }


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  loadDashboard(): void {

    this.loadTables();

    this.loadOrders();

  }


  // =====================================================
  // LOAD TABLES
  // =====================================================

  loadTables(): void {

    this.loadingTables = true;


    this.http
      .get<CafeTable[]>(
        this.tablesApi
      )
      .subscribe({

        next: (data) => {

          this.tables =
            data || [];

          this.calculateTableCounts();

          this.loadingTables =
            false;

        },


        error: (error) => {

          console.error(
            'Dashboard table error:',
            error
          );

          this.loadingTables =
            false;

        }

      });

  }


  // =====================================================
  // CALCULATE TABLE COUNTS
  // =====================================================

  calculateTableCounts(): void {

    this.totalTables =
      this.tables.length;


    this.bookedTables =
      this.tables.filter(
        table =>
          table.status === 'BOOKED'
      ).length;


    this.freeTables =
      this.tables.filter(
        table =>
          table.status === 'FREE'
      ).length;

  }


  // =====================================================
  // LOAD ORDERS
  // =====================================================

  loadOrders(): void {

    this.loadingOrders = true;


    this.http
      .get<Order[]>(
        this.ordersApi
      )
      .subscribe({

        next: (data) => {

          this.orders =
            data || [];

          this.calculateOrderStats();

          this.loadingOrders =
            false;

        },


        error: (error) => {

          console.error(
            'Dashboard order error:',
            error
          );

          this.loadingOrders =
            false;

        }

      });

  }


  // =====================================================
  // ORDER STATISTICS
  // =====================================================

  calculateOrderStats(): void {


    this.pendingOrders =
      this.orders.filter(
        order =>
          order.status === 'Pending'
      ).length;


    this.acceptedOrders =
      this.orders.filter(
        order =>
          order.status === 'Accepted'
      ).length;


    this.preparingOrders =
      this.orders.filter(
        order =>
          order.status === 'Preparing'
      ).length;


    this.servedOrders =
      this.orders.filter(
        order =>
          order.status === 'Served'
      ).length;


    // ---------------------------------------------------
    // TODAY'S SALE
    // ---------------------------------------------------

    const today =
      new Date();


    this.todaysSale =
      this.orders

        .filter(order => {

          if (!order.createdAt) {

            return false;

          }


          const orderDate =
            new Date(
              order.createdAt
            );


          return (

            orderDate.getDate() ===
              today.getDate()

            &&

            orderDate.getMonth() ===
              today.getMonth()

            &&

            orderDate.getFullYear() ===
              today.getFullYear()

            &&

            order.paymentStatus ===
              'Paid'

          );

        })

        .reduce(

          (
            total,
            order
          ) =>

            total +
            Number(order.total),

          0

        );


    // ---------------------------------------------------
    // AVERAGE ORDER
    // ---------------------------------------------------

    if (this.orders.length > 0) {

      const total =
        this.orders.reduce(

          (
            sum,
            order
          ) =>

            sum +
            Number(order.total),

          0

        );


      this.averageOrder =
        total /
        this.orders.length;

    }

    else {

      this.averageOrder = 0;

    }

  }


  // =====================================================
  // MANAGE TABLES
  // =====================================================

  manageTables(): void {

    this.router.navigate([
      '/admin/tables'
    ]);

  }


  // =====================================================
  // TABLE CLICK
  //
  // Dashboard only needs status/counts.
  // Clicking goes to Manage Tables.
  // =====================================================

  openTables(): void {

    this.manageTables();

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    value: number
  ): string {

    return Number(
      value || 0
    ).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2
      }
    );

  }

}
