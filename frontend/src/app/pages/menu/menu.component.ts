import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';

import { CartService } from '../../services/cart.service';

import {
  ActivatedRoute,
  Router
} from '@angular/router';


interface MenuItem {

  id: number;

  category: string;

  name: string;

  price: number;

  description: string;

  image: string;

  isAvailable: boolean;

  isVeg: boolean;

  addedToCart?: boolean;

}


@Component({

  selector: 'app-menu',

  standalone: true,

  imports: [
    CommonModule,
    HttpClientModule
  ],

  templateUrl: './menu.component.html',

  styleUrls: ['./menu.component.css']

})


export class MenuComponent implements OnInit {


  // =====================================================
  // API
  // =====================================================

  private apiUrl =
    'http://localhost:3000/menu';

  private tablesApi =
    'http://localhost:3000/tables';


  // =====================================================
  // NGROK HEADERS
  // =====================================================

  private apiHeaders = new HttpHeaders({

    'Content-Type': 'application/json',

    'ngrok-skip-browser-warning': 'true'

  });


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private cartService: CartService,

    private router: Router,

    private route: ActivatedRoute,

    private http: HttpClient

  ) {}


  // =====================================================
  // TABLE
  // =====================================================

  tableNo = 1;


  // =====================================================
  // CATEGORY
  // =====================================================

  selectedCategory = 'All';


  // =====================================================
  // SEARCH
  // =====================================================

  searchText = '';


  // =====================================================
  // MENU
  // =====================================================

  food: MenuItem[] = [];

  filteredFood: MenuItem[] = [];


  // =====================================================
  // STATES
  // =====================================================

  loading = false;

  errorMessage = '';

  tableConnected = false;

  tableConnecting = false;


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    console.log('====================================');
    console.log('CAFÉ QR MENU INITIALIZING');
    console.log('====================================');


    const tableId =
      this.route.snapshot.paramMap.get('tableId');


    console.log(
      'TABLE ID FROM URL:',
      tableId
    );


    if (!tableId) {

      console.warn(
        'No tableId found.'
      );

      this.tableNo = 1;

      localStorage.setItem(
        'tableId',
        '1'
      );

      this.loadMenu();

      return;

    }


    const parsedTableNo =
      Number(tableId);


    if (
      !Number.isInteger(parsedTableNo) ||
      parsedTableNo < 1
    ) {

      console.warn(
        'Invalid table number:',
        tableId
      );

      this.tableNo = 1;

      localStorage.setItem(
        'tableId',
        '1'
      );

      this.loadMenu();

      return;

    }


    this.tableNo =
      parsedTableNo;


    localStorage.setItem(
      'tableId',
      this.tableNo.toString()
    );


    console.log(
      'CURRENT TABLE:',
      this.tableNo
    );


    this.connectTable();

  }


  // =====================================================
  // CONNECT TABLE
  // =====================================================

  connectTable(): void {

    this.tableConnecting = true;

    console.log(
      'Connecting Table:',
      this.tableNo
    );


    this.http

      .post(
        `${this.tablesApi}/${this.tableNo}/scan`,
        {},
        {
          headers: this.apiHeaders
        }
      )

      .subscribe({

        next: (response: any) => {

          console.log(
            'TABLE QR CONNECTED:',
            response
          );


          this.tableConnected = true;

          this.tableConnecting = false;


          localStorage.setItem(
            'tableId',
            this.tableNo.toString()
          );


          this.loadMenu();

        },


        error: (error) => {

          console.error(
            'TABLE QR CONNECTION ERROR:',
            error
          );


          this.tableConnecting = false;

          this.tableConnected = false;


          /*
           * Table scan failed,
           * but menu should still load.
           */

          this.loadMenu();

        }

      });

  }


  // =====================================================
  // LOAD MENU
  // =====================================================

  loadMenu(): void {

    this.loading = true;

    this.errorMessage = '';


    console.log(
      '===================================='
    );

    console.log(
      'LOADING MENU:',
      this.apiUrl
    );

    console.log(
      '===================================='
    );


    this.http

      .get<any>(
        this.apiUrl,
        {
          headers: this.apiHeaders
        }
      )

      .subscribe({

        next: (response: any) => {

          console.log(
            'RAW MENU RESPONSE:',
            response
          );


          let items: any[] = [];


          // ------------------------------------------------
          // ARRAY RESPONSE
          // ------------------------------------------------

          if (
            Array.isArray(response)
          ) {

            items = response;

          }


          // ------------------------------------------------
          // { data: [] }
          // ------------------------------------------------

          else if (
            response &&
            Array.isArray(response.data)
          ) {

            items = response.data;

          }


          // ------------------------------------------------
          // { items: [] }
          // ------------------------------------------------

          else if (
            response &&
            Array.isArray(response.items)
          ) {

            items = response.items;

          }


          // ------------------------------------------------
          // { menu: [] }
          // ------------------------------------------------

          else if (
            response &&
            Array.isArray(response.menu)
          ) {

            items = response.menu;

          }


          console.log(
            'MENU ITEMS:',
            items
          );


          console.log(
            'MENU COUNT:',
            items.length
          );


          // =================================================
          // CONVERT API DATA
          // =================================================

          this.food =

            items.map(
              (item: any) => {

                return {

                  id:
                    Number(item.id),

                  name:
                    item.name ||
                    'Unnamed Item',

                  category:
                    item.category ||
                    '',

                  price:
                    Number(item.price || 0),

                  description:
                    item.description ||
                    '',

                  image:
                    this.getImageUrl(
                      item.image ||
                      ''
                    ),

                  isAvailable:
                    this.checkAvailability(
                      item.isAvailable
                    ),

                  isVeg:
                    Boolean(
                      item.isVeg
                    )

                };

              }
            );


          // =================================================
          // REMOVE ONLY UNAVAILABLE ITEMS
          // =================================================

          this.food =
            this.food.filter(
              item =>
                item.isAvailable
            );


          console.log(
            'FINAL FOOD:',
            this.food
          );


          console.log(
            'FINAL FOOD COUNT:',
            this.food.length
          );


          // =================================================
          // FILTER
          // =================================================

          this.applyFilters();


          this.loading = false;


          if (
            this.food.length === 0
          ) {

            this.errorMessage =
              'No menu items found.';

          }

        },


        error: (error) => {

          console.error(
            '===================================='
          );

          console.error(
            'MENU API ERROR:',
            error
          );

          console.error(
            '===================================='
          );


          this.loading = false;

          this.food = [];

          this.filteredFood = [];


          this.errorMessage =
            'Unable to load menu. Please try again.';

        }

      });

  }


  // =====================================================
  // CHECK AVAILABILITY
  // =====================================================

  private checkAvailability(
    value: any
  ): boolean {

    if (
      value === undefined ||
      value === null
    ) {

      return true;

    }


    if (
      typeof value === 'boolean'
    ) {

      return value;

    }


    if (
      typeof value === 'number'
    ) {

      return value === 1;

    }


    if (
      typeof value === 'string'
    ) {

      const result =
        value
          .toLowerCase()
          .trim();


      if (
        result === 'false' ||
        result === '0' ||
        result === 'no' ||
        result === 'unavailable'
      ) {

        return false;

      }


      return true;

    }


    return true;

  }


  // =====================================================
  // IMAGE URL
  // =====================================================

  getImageUrl(
    image: string
  ): string {

    if (!image) {

      return 'assets/images/food-placeholder.jpg';

    }


    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {

      return image;

    }


    if (
      image.startsWith('/')
    ) {

      return (
        'http://localhost:3000' +
        image
      );

    }


    return (
      'http://localhost:3000/' +
      image
    );

  }


  // =====================================================
  // SEARCH
  // =====================================================

  searchMenu(
    event: any
  ): void {

    this.searchText =
      event.target.value
        .toLowerCase()
        .trim();


    this.applyFilters();

  }


  // =====================================================
  // CATEGORY
  // =====================================================

  selectCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;


    this.applyFilters();

  }


  // =====================================================
  // FILTER
  // =====================================================

  private applyFilters(): void {

    let result =
      [...this.food];


    // CATEGORY

    if (
      this.selectedCategory !== 'All'
    ) {

      result =
        result.filter(
          item =>
            item.category
              .toLowerCase() ===
            this.selectedCategory
              .toLowerCase()
        );

    }


    // SEARCH

    if (
      this.searchText
    ) {

      result =
        result.filter(
          item => {

            const name =
              item.name
                .toLowerCase();


            const description =
              item.description
                .toLowerCase();


            const category =
              item.category
                .toLowerCase();


            return (

              name.includes(
                this.searchText
              )

              ||

              description.includes(
                this.searchText
              )

              ||

              category.includes(
                this.searchText
              )

            );

          }
        );

    }


    this.filteredFood =
      result;


    console.log(
      'FILTERED FOOD:',
      this.filteredFood
    );

  }


  // =====================================================
  // ADD TO CART
  // =====================================================

  addToCart(
    item: MenuItem
  ): void {

    if (
      !item.isAvailable
    ) {

      return;

    }


    const cartItem = {

      ...item,

      tableId:
        this.tableNo

    };


    this.cartService.addToCart(
      cartItem
    );


    item.addedToCart =
      true;


    setTimeout(() => {

      item.addedToCart =
        false;

    }, 1000);

  }


  // =====================================================
  // CART
  // =====================================================

  goToCart(): void {

    this.router.navigate([
      '/cart'
    ]);

  }


  // =====================================================
  // CART COUNT
  // =====================================================

  get cartCount(): number {

    return this.cartService
      .getCartCount();

  }

}
