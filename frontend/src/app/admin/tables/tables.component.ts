import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';


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


interface TableSummary {

  total: number;

  booked: number;

  free: number;

}


@Component({

  selector: 'app-tables',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    HttpClientModule

  ],

  templateUrl:
    './tables.component.html',

  styleUrl:
    './tables.component.css'

})


export class TablesComponent
  implements OnInit, OnDestroy {


  // =====================================================
  // API
  // =====================================================

  private tablesApi =
    'http://localhost:3000/tables';


  private ordersApi =
    'http://localhost:3000/orders';


  // =====================================================
  // TABLE DATA
  // =====================================================

  tables: CafeTable[] = [];


  // =====================================================
  // ORDERS
  // =====================================================

  orders: Order[] = [];

  // =====================================================
  // SELECTED ORDER
  // =====================================================

  selectedOrder: Order | null = null;

  // Currently selected table in the live floor
  selectedTable: CafeTable | null = null;


  // =====================================================
  // SEARCH
  // =====================================================

  searchText = '';


  // =====================================================
  // FILTER
  // =====================================================

  selectedFilter:
    'ALL' |
    'FREE' |
    'BOOKED' = 'ALL';


  // =====================================================
  // MODAL
  // =====================================================

  showTableModal = false;


  modalMode:
    'ADD' | 'EDIT' = 'ADD';


  editingTableId:
    number | null = null;


  // =====================================================
  // TABLE FORM
  // =====================================================

  tableForm = {

    tableNumber: 1,

    seats: 2

  };


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;

  saving = false;


  // =====================================================
  // MESSAGES
  // =====================================================

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // REFRESH
  // =====================================================

  private refreshTimer: any;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private http: HttpClient

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

  // Initial load
  this.loadTables(true);
  this.loadOrders();

  // Background refresh without showing loading screen
  this.refreshTimer = setInterval(() => {

    this.loadTables(false);
    this.loadOrders();

  }, 5000);

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
  // TOTAL
  // =====================================================

  get totalTables(): number {

    return this.tables.length;

  }


  // =====================================================
  // BOOKED
  // =====================================================

  get bookedTables(): number {

    return this.tables.filter(

      table =>
        table.status === 'BOOKED'

    ).length;

  }


  // =====================================================
  // FREE
  // =====================================================

  get freeTables(): number {

    return this.tables.filter(

      table =>
        table.status === 'FREE'

    ).length;

  }


  // =====================================================
  // FILTERED TABLES
  // =====================================================

  get filteredTables(): CafeTable[] {

    let result =
      [...this.tables];


    if (
      this.selectedFilter !==
      'ALL'
    ) {

      result =
        result.filter(

          table =>
            table.status ===
            this.selectedFilter

        );

    }


    if (
      this.searchText.trim()
    ) {

      const search =
        this.searchText
          .toLowerCase()
          .trim();


      result =
        result.filter(

          table =>

            `table ${table.tableNumber}`
              .toLowerCase()
              .includes(search)

            ||

            table.tableNumber
              .toString()
              .includes(search)

        );

    }


    return result;

  }


  // =====================================================
  // LOAD TABLES
  // =====================================================

    loadTables(showLoading: boolean = false): void {

  // Only show loading on the first/manual load
  if (showLoading) {
    this.loading = true;
  }

  this.http
    .get<CafeTable[]>(
      this.tablesApi
    )
    .subscribe({

      next: (data) => {

        this.tables = data || [];

        // Select the first table on the initial load.
        if (!this.selectedTable && this.tables.length > 0) {
          this.selectedTable = this.tables[0];
        } else if (this.selectedTable) {
          const refreshed = this.tables.find(
            table => table.id === this.selectedTable?.id
          );

          if (refreshed) {
            this.selectedTable = refreshed;
          }
        }

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Load tables error:',
          error
        );

        this.loading = false;

        this.errorMessage =
          this.getErrorMessage(
            error,
            'Unable to load tables.'
          );

      }

    });

}


  // =====================================================
  // LOAD ORDERS
  // =====================================================

  loadOrders(): void {

    this.http
      .get<Order[]>(
        this.ordersApi
      )
      .subscribe({

        next: (data) => {

          this.orders =
            data || [];

        },


        error: (error) => {

          console.error(
            'Load orders error:',
            error
          );

        }

      });

  }


  // =====================================================
  // GET TABLE ORDERS
  // =====================================================

  getTableOrders(
    table: CafeTable
  ): Order[] {

    return this.orders.filter(

      order =>

        Number(order.tableId) ===
        Number(table.id)

        ||

        Number(order.tableId) ===
        Number(table.tableNumber)

    );

  }


  // =====================================================
  // GET ACTIVE ORDER
  // =====================================================

  getActiveOrder(
    table: CafeTable
  ): Order | null {

    const tableOrders =
      this.getTableOrders(
        table
      );


    if (
      tableOrders.length === 0
    ) {

      return null;

    }


    return tableOrders[0];

  }


  // =====================================================
  // TABLE FLOOR HELPERS
  // =====================================================

  selectTable(table: CafeTable): void {
    this.selectedTable = table;
  }


  getTableStatusLabel(table: CafeTable): string {
    if (table.status === 'FREE') {
      return 'FREE';
    }

    const order = this.getActiveOrder(table);

    if (!order) {
      return 'PENDING';
    }

    switch (order.status) {
      case 'Accepted':
        return 'ORDERED';
      case 'Preparing':
        return 'PREPARING';
      case 'Served':
        return 'SERVED';
      case 'Completed':
        return order.paymentStatus === 'Paid' ? 'PAID' : 'COMPLETED';
      default:
        return 'PENDING';
    }
  }


  getTableStatusClass(table: CafeTable): string {
    const status = this.getTableStatusLabel(table);

    switch (status) {
      case 'FREE':
        return 'status-free';
      case 'ORDERED':
        return 'status-ordered';
      case 'PREPARING':
        return 'status-preparing';
      case 'SERVED':
        return 'status-served';
      case 'PAID':
        return 'status-paid';
      default:
        return 'status-pending';
    }
  }


  getOrderStatusClass(status: Order['status']): string {
    switch (status) {
      case 'Accepted':
        return 'status-accepted';
      case 'Preparing':
        return 'status-preparing';
      case 'Served':
        return 'status-served';
      case 'Completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  }


  isOrderStageDone(
    status: Order['status'],
    stage: 'Pending' | 'Accepted' | 'Served'
  ): boolean {
    const orderStages: Order['status'][] = [
      'Pending',
      'Accepted',
      'Preparing',
      'Served',
      'Completed'
    ];

    const currentIndex = orderStages.indexOf(status);
    const stageIndex = orderStages.indexOf(stage);

    return currentIndex >= stageIndex && currentIndex >= 0;
  }


  // =====================================================
  // SET FILTER
  // =====================================================

  setFilter(

    filter:
      'ALL' |
      'FREE' |
      'BOOKED'

  ): void {

    this.selectedFilter =
      filter;

  }


  // =====================================================
  // OPEN ADD
  // =====================================================

  openAddTable(): void {

    this.modalMode =
      'ADD';


    this.editingTableId =
      null;


    const nextNumber =

      this.tables.length > 0

        ? Math.max(

            ...this.tables.map(

              table =>
                table.tableNumber

            )

          ) + 1

        : 1;


    this.tableForm = {

      tableNumber:
        nextNumber,

      seats:
        2

    };


    this.errorMessage = '';

    this.successMessage = '';

    this.showTableModal = true;

  }


  // =====================================================
  // OPEN EDIT
  // =====================================================

  openEditTable(
    table: CafeTable
  ): void {

    this.modalMode =
      'EDIT';


    this.editingTableId =
      table.id;


    this.tableForm = {

      tableNumber:
        table.tableNumber,

      seats:
        table.seats

    };


    this.errorMessage = '';

    this.successMessage = '';

    this.showTableModal = true;

  }


  // =====================================================
  // CLOSE
  // =====================================================

  closeModal(): void {

    this.showTableModal =
      false;

    this.editingTableId =
      null;

  }


  // =====================================================
  // SAVE TABLE
  // =====================================================

  saveTable(): void {

    const tableNumber =
      Number(
        this.tableForm.tableNumber
      );


    const seats =
      Number(
        this.tableForm.seats
      );


    if (
      !tableNumber ||
      tableNumber < 1
    ) {

      this.errorMessage =
        'Please enter a valid table number.';

      return;

    }


    if (
      !seats ||
      seats < 1
    ) {

      this.errorMessage =
        'Seats must be at least 1.';

      return;

    }


    this.saving = true;

    this.errorMessage = '';


    // ===================================================
    // EDIT
    // ===================================================

    if (

      this.modalMode === 'EDIT'

      &&

      this.editingTableId !== null

    ) {

      this.http

        .put(

          `${this.tablesApi}/${tableNumber}`,

          {
            seats
          }

        )

        .subscribe({

          next: () => {

            this.saving =
              false;

            this.closeModal();

            this.successMessage =
              `Table ${tableNumber} updated successfully.`;

            this.loadTables();

          },


          error: (error) => {

            this.saving =
              false;

            this.errorMessage =
              this.getErrorMessage(

                error,

                'Unable to update table.'

              );

          }

        });


      return;

    }


    // ===================================================
    // ADD
    // ===================================================

    this.http

      .post(

        this.tablesApi,

        {

          tableNumber,

          seats

        }

      )

      .subscribe({

        next: () => {

          this.saving =
            false;

          this.closeModal();

          this.successMessage =
            `Table ${tableNumber} added successfully.`;

          this.loadTables();

        },


        error: (error) => {

          this.saving =
            false;

          this.errorMessage =
            this.getErrorMessage(

              error,

              'Unable to add table.'

            );

        }

      });

  }


  // =====================================================
  // REMOVE
  // =====================================================

  removeTable(
    table: CafeTable
  ): void {

    if (
      table.status === 'BOOKED'
    ) {

      alert(

        'This table is currently booked. ' +

        'Free the table before removing it.'

      );

      return;

    }


    const confirmed =
      confirm(

        `Are you sure you want to remove Table ${table.tableNumber}?`

      );


    if (!confirmed) {

      return;

    }


    this.http

      .delete(

        `${this.tablesApi}/${table.tableNumber}`

      )

      .subscribe({

        next: () => {

          this.successMessage =
            `Table ${table.tableNumber} removed successfully.`;

          this.loadTables();

        },


        error: (error) => {

          this.errorMessage =
            this.getErrorMessage(

              error,

              'Unable to remove table.'

            );

        }

      });

  }


  // =====================================================
  // BOOK TABLE
  // =====================================================

  bookTable(
    table: CafeTable
  ): void {

    if (
      table.status === 'BOOKED'
    ) {

      return;

    }


    this.http

      .post(

        `${this.tablesApi}/${table.tableNumber}/scan`,

        {}

      )

      .subscribe({

        next: () => {

          this.successMessage =
            `Table ${table.tableNumber} is now booked.`;

          this.selectedTable = table;
          this.loadTables();

        },


        error: (error) => {

          this.errorMessage =
            this.getErrorMessage(

              error,

              'Unable to book table.'

            );

        }

      });

  }


  // =====================================================
  // FREE TABLE
  // =====================================================

  freeTable(
    table: CafeTable
  ): void {

    if (
      table.status === 'FREE'
    ) {

      return;

    }


    this.http

      .post(

        `${this.tablesApi}/${table.tableNumber}/free`,

        {}

      )

      .subscribe({

        next: () => {

          this.successMessage =
            `Table ${table.tableNumber} is now free.`;

          this.loadTables();

          this.loadOrders();

          if (this.selectedTable?.id === table.id) {
            this.selectedTable = null;
          }

        },


        error: (error) => {

          this.errorMessage =
            this.getErrorMessage(

              error,

              'Unable to free table.'

            );

        }

      });

  }


  // =====================================================
  // VIEW ORDER DETAILS
  // =====================================================

  viewOrderDetails(order: Order): void {

    this.selectedOrder = order;

  }


  // =====================================================
  // CLOSE ORDER DETAILS
  // =====================================================

  closeOrderDetails(): void {

    this.selectedOrder = null;

  }


  // =====================================================
  // FORMAT MONEY
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


  // =====================================================
  // ERROR
  // =====================================================

  private getErrorMessage(

    error: any,

    defaultMessage: string

  ): string {

    if (
      error?.error?.message
    ) {

      if (
        Array.isArray(
          error.error.message
        )
      ) {

        return error.error.message.join(
          ', '
        );

      }


      return error.error.message;

    }


    if (
      error?.message
    ) {

      return error.message;

    }


    return defaultMessage;

  }

}
