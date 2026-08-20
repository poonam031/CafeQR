import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

interface MenuItem {
  id?: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
  isVeg: boolean;
}

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  // =========================================
  // API
  // =========================================

  private apiUrl = 'http://localhost:3000/menu';


  // =========================================
  // MENU DATA
  // =========================================

  menuItems: MenuItem[] = [];

  filteredItems: MenuItem[] = [];


  // =========================================
  // SEARCH / FILTER
  // =========================================

  searchText = '';

  selectedCategory = 'All';

  categories: string[] = [
    'All',
    'Pizza',
    'Burger',
    'Fries',
    'Pasta',
    'Sandwich',
    'Rolls',
    'Desserts',
    'Coffee',
    'Drinks',
    'Shakes',
    'Combo'
  ];


  // =========================================
  // MODAL
  // =========================================

  showModal = false;

  isEditMode = false;


  // =========================================
  // FORM
  // =========================================

  menuForm: MenuItem =
    this.getEmptyForm();


  // =========================================
  // IMAGE FILE
  // =========================================

  selectedImageFile: File | null = null;


  // =========================================
  // STATES
  // =========================================

  loading = false;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.loadMenu();

  }


  // =========================================
  // GET MENU
  // =========================================

  loadMenu(): void {

    this.loading = true;

    this.http
      .get<MenuItem[]>(this.apiUrl)
      .subscribe({

        next: (items) => {

          this.menuItems = items;

          this.applyFilters();

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Menu API Error:',
            error
          );

          this.errorMessage =
            'Unable to load menu items.';

          this.loading = false;

        }

      });

  }


  // =========================================
  // FILTER
  // =========================================

  applyFilters(): void {

    let result =
      [...this.menuItems];


    // Search

    if (this.searchText.trim()) {

      const search =
        this.searchText
          .trim()
          .toLowerCase();

      result =
        result.filter(item =>

          item.name
            .toLowerCase()
            .includes(search)

          ||

          item.description
            .toLowerCase()
            .includes(search)

        );

    }


    // Category

    if (
      this.selectedCategory !== 'All'
    ) {

      result =
        result.filter(item =>

          item.category ===
          this.selectedCategory

        );

    }


    this.filteredItems =
      result;

  }


  // =========================================
  // CATEGORY
  // =========================================

  selectCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;

    this.applyFilters();

  }


  // =========================================
  // ADD ITEM
  // =========================================

  addItem(): void {

    this.isEditMode = false;

    this.menuForm =
      this.getEmptyForm();

    this.selectedImageFile =
      null;

    this.errorMessage = '';

    this.successMessage = '';

    this.showModal = true;

  }


  // =========================================
  // EDIT ITEM
  // =========================================

  editItem(
    item: MenuItem
  ): void {

    this.isEditMode = true;

    this.menuForm = {
      ...item
    };

    this.selectedImageFile =
      null;

    this.errorMessage = '';

    this.successMessage = '';

    this.showModal = true;

  }


  // =========================================
  // SAVE ITEM
  // =========================================

  saveItem(): void {

    // =====================================
    // VALIDATION
    // =====================================

    if (
      !this.menuForm.name.trim()
    ) {

      this.errorMessage =
        'Please enter item name.';

      return;

    }


    if (
      !this.menuForm.category
    ) {

      this.errorMessage =
        'Please select category.';

      return;

    }


    if (
      this.menuForm.price <= 0
    ) {

      this.errorMessage =
        'Please enter a valid price.';

      return;

    }


    this.saving = true;

    this.errorMessage = '';


    // =====================================
    // UPDATE EXISTING ITEM
    // =====================================

    if (
      this.isEditMode &&
      this.menuForm.id
    ) {

      const updateData = {

        name:
          this.menuForm.name,

        category:
          this.menuForm.category,

        price:
          this.menuForm.price,

        description:
          this.menuForm.description,

        isAvailable:
          this.menuForm.isAvailable,

        isVeg:
          this.menuForm.isVeg

      };


      this.http
        .patch<MenuItem>(
          `${this.apiUrl}/${this.menuForm.id}`,
          updateData
        )
        .subscribe({

          next: () => {

            this.successMessage =
              'Menu item updated successfully.';

            this.saving = false;

            this.closeModal();

            this.loadMenu();

          },

          error: (error) => {

            console.error(
              'UPDATE MENU ERROR:',
              error
            );

            this.errorMessage =
              error.error?.message ||
              'Unable to update menu item.';

            this.saving = false;

          }

        });

      return;

    }


    // =====================================
    // CREATE NEW ITEM
    // =====================================

    const formData =
      new FormData();


    formData.append(
      'name',
      this.menuForm.name
    );


    formData.append(
      'category',
      this.menuForm.category
    );


    formData.append(
      'price',
      String(this.menuForm.price)
    );


    formData.append(
      'description',
      this.menuForm.description || ''
    );


    formData.append(
      'isVeg',
      String(this.menuForm.isVeg)
    );


    formData.append(
      'isAvailable',
      String(this.menuForm.isAvailable)
    );


    // =====================================
    // ACTUAL IMAGE FILE
    // =====================================

    if (this.selectedImageFile) {

      formData.append(
        'image',
        this.selectedImageFile
      );

    }


    console.log(
      'Sending menu item:',
      this.menuForm
    );

    console.log(
      'Image file:',
      this.selectedImageFile
    );


    // =====================================
    // POST
    // =====================================

    this.http
      .post<MenuItem>(
        this.apiUrl,
        formData
      )
      .subscribe({

        next: (item) => {

          console.log(
            'MENU CREATED:',
            item
          );


          this.successMessage =
            'Menu item added successfully.';

          this.saving = false;

          this.closeModal();

          this.loadMenu();

        },

        error: (error) => {

          console.error(
            'ADD MENU ERROR:',
            error
          );


          console.error(
            'Status:',
            error.status
          );


          console.error(
            'Response:',
            error.error
          );


          this.errorMessage =
            error.error?.message ||
            'Unable to add menu item.';

          this.saving = false;

        }

      });

  }


  // =========================================
  // DELETE
  // =========================================

  deleteItem(
    item: MenuItem
  ): void {

    if (!item.id) {

      return;

    }


    const confirmed =
      window.confirm(
        `Delete "${item.name}"?`
      );


    if (!confirmed) {

      return;

    }


    this.http
      .delete(
        `${this.apiUrl}/${item.id}`
      )
      .subscribe({

        next: () => {

          this.menuItems =
            this.menuItems.filter(
              menu =>
                menu.id !== item.id
            );


          this.applyFilters();


          this.successMessage =
            'Menu item deleted successfully.';

        },

        error: (error) => {

          console.error(
            'DELETE MENU ERROR:',
            error
          );


          this.errorMessage =
            'Unable to delete menu item.';

        }

      });

  }


  // =========================================
  // AVAILABILITY
  // =========================================

  toggleAvailability(
    item: MenuItem
  ): void {

    if (!item.id) {

      return;

    }


    const newValue =
      !item.isAvailable;


    this.http
      .patch<MenuItem>(
        `${this.apiUrl}/${item.id}`,
        {
          isAvailable: newValue
        }
      )
      .subscribe({

        next: (updatedItem) => {

          item.isAvailable =
            updatedItem.isAvailable;

        },

        error: (error) => {

          console.error(
            'AVAILABILITY ERROR:',
            error
          );


          this.errorMessage =
            'Unable to update availability.';

        }

      });

  }


  // =========================================
  // IMAGE CHANGE
  // =========================================

  onImageChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    // =====================================
    // SAVE ACTUAL FILE
    // =====================================

    this.selectedImageFile =
      file;


    // =====================================
    // PREVIEW ONLY
    // =====================================

    const reader =
      new FileReader();


    reader.onload = () => {

      this.menuForm.image =
        reader.result as string;

    };


    reader.readAsDataURL(file);

  }


  // =========================================
  // CLOSE MODAL
  // =========================================

  closeModal(): void {

    this.showModal = false;

    this.menuForm =
      this.getEmptyForm();

    this.selectedImageFile =
      null;

  }


  // =========================================
  // EMPTY FORM
  // =========================================

  getEmptyForm(): MenuItem {

    return {

      name: '',

      category: 'Pizza',

      price: 0,

      description: '',

      image: '',

      isAvailable: true,

      isVeg: true

    };

  }

  getImageUrl(image: string): string {

  if (!image) {
    return 'assets/images/food-placeholder.jpg';
  }

  // If already a full URL
  if (
    image.startsWith('http://') ||
    image.startsWith('https://')
  ) {
    return image;
  }

  // Backend image
  return `http://localhost:3000${image}`;
}

}
