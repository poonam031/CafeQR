import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  image?: string;
  isAvailable: boolean;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  private productApi =
    'https://cafeqr-wds8.onrender.com/products';

  private categoryApi =
    'https://cafeqr-wds8.onrender.com/category';

  products: Product[] = [];

  categories: Category[] = [];

  searchText = '';

  selectedCategory = '';

  loading = false;

  saving = false;

  showModal = false;

  isEditMode = false;

  selectedProductId: number | null = null;

  selectedImage: File | null = null;

  imagePreview: string | null = null;

  product = {
    name: '',
    price: 0,
    stock: 0,
    unit: 'Kg',
    categoryId: null as number | null,
    isAvailable: true
  };

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    this.loadCategories();

    this.loadProducts();

  }

  // ==========================
  // LOAD PRODUCTS
  // ==========================

  loadProducts(): void {

    this.loading = true;

    let url = this.productApi;

    const params: string[] = [];

    if (this.searchText.trim()) {

      params.push(
        `search=${encodeURIComponent(
          this.searchText.trim()
        )}`
      );

    }

    if (this.selectedCategory) {

      params.push(
        `categoryId=${this.selectedCategory}`
      );

    }

    if (params.length > 0) {

      url += '?' + params.join('&');

    }

    this.http
      .get<Product[]>(url)
      .subscribe({

        next: (data) => {

          this.products = data;

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Products loading error:',
            error
          );

          this.loading = false;

          alert(
            'Unable to load products.'
          );

        }

      });

  }

  // ==========================
  // LOAD CATEGORIES
  // ==========================

  loadCategories(): void {

    this.http
      .get<Category[]>(
        this.categoryApi
      )
      .subscribe({

        next: (data) => {

          this.categories = data;

        },

        error: (error) => {

          console.error(
            'Category loading error:',
            error
          );

        }

      });

  }

  // ==========================
  // SEARCH
  // ==========================

  searchProducts(): void {

    this.loadProducts();

  }

  // ==========================
  // CATEGORY FILTER
  // ==========================

  filterProducts(): void {

    this.loadProducts();

  }

  // ==========================
  // ADD PRODUCT
  // ==========================

  addProduct(): void {

    this.isEditMode = false;

    this.selectedProductId = null;

    this.selectedImage = null;

    this.imagePreview = null;

    this.resetForm();

    this.showModal = true;

  }

  // ==========================
  // EDIT PRODUCT
  // ==========================

  editProduct(
    product: Product
  ): void {

    this.isEditMode = true;

    this.selectedProductId =
      product.id || null;

    this.product = {

      name: product.name,

      price: Number(product.price),

      stock: Number(product.stock),

      unit: product.unit || 'Kg',

      categoryId:
        product.categoryId,

      isAvailable:
        product.isAvailable

    };

    this.selectedImage = null;

    if (product.image) {

      this.imagePreview =
        this.getImageUrl(
          product.image
        );

    } else {

      this.imagePreview = null;

    }

    this.showModal = true;

  }

  // ==========================
  // IMAGE SELECT
  // ==========================

  onImageSelected(
    event: any
  ): void {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith('image/')
    ) {

      alert(
        'Please select an image.'
      );

      return;

    }

    if (
      file.size > 5 * 1024 * 1024
    ) {

      alert(
        'Image size must be less than 5MB.'
      );

      return;

    }

    this.selectedImage = file;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

    };

    reader.readAsDataURL(file);

  }

  // ==========================
  // SAVE PRODUCT
  // ==========================

  saveProduct(): void {

    if (!this.product.name.trim()) {

      alert(
        'Please enter product name.'
      );

      return;

    }

    if (
      this.product.price < 0
    ) {

      alert(
        'Price cannot be negative.'
      );

      return;

    }

    if (
      this.product.stock < 0
    ) {

      alert(
        'Stock cannot be negative.'
      );

      return;

    }

    if (
      !this.product.categoryId
    ) {

      alert(
        'Please select a category.'
      );

      return;

    }

    const formData =
      new FormData();

    formData.append(
      'name',
      this.product.name.trim()
    );

    formData.append(
      'price',
      this.product.price.toString()
    );

    formData.append(
      'stock',
      this.product.stock.toString()
    );

    formData.append(
      'unit',
      this.product.unit
    );

    formData.append(
      'categoryId',
      this.product.categoryId.toString()
    );

    formData.append(
      'isAvailable',
      this.product.isAvailable
        ? 'true'
        : 'false'
    );

    if (this.selectedImage) {

      formData.append(
        'image',
        this.selectedImage
      );

    }

    this.saving = true;

    // UPDATE

    if (
      this.isEditMode &&
      this.selectedProductId
    ) {

      this.http
        .put<Product>(
          `${this.productApi}/${this.selectedProductId}`,
          formData
        )
        .subscribe({

          next: () => {

            this.saving = false;

            this.closeModal();

            this.loadProducts();

            alert(
              'Product updated successfully.'
            );

          },

          error: (error) => {

            console.error(
              'Update error:',
              error
            );

            this.saving = false;

            alert(
              'Unable to update product.'
            );

          }

        });

      return;

    }

    // CREATE

    this.http
      .post<Product>(
        this.productApi,
        formData
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.closeModal();

          this.loadProducts();

          alert(
            'Product added successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Create error:',
            error
          );

          this.saving = false;

          alert(
            'Unable to add product.'
          );

        }

      });

  }

  // ==========================
  // DELETE
  // ==========================

  deleteProduct(
    product: Product
  ): void {

    if (!product.id) {
      return;
    }

    const confirmed =
      confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    this.http
      .delete(
        `${this.productApi}/${product.id}`
      )
      .subscribe({

        next: () => {

          this.loadProducts();

          alert(
            'Product deleted successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Delete error:',
            error
          );

          alert(
            'Unable to delete product.'
          );

        }

      });

  }

  // ==========================
  // STOCK STATUS
  // ==========================

  getStatus(
    product: Product
  ): string {

    if (!product.isAvailable) {

      return 'Unavailable';

    }

    const stock =
      Number(product.stock);

    if (stock <= 0) {

      return 'Out of Stock';

    }

    if (stock <= 5) {

      return 'Low Stock';

    }

    return 'Available';

  }

  // ==========================
  // STATUS CLASS
  // ==========================

  getStatusClass(
    product: Product
  ): string {

    if (!product.isAvailable) {

      return 'unavailable';

    }

    const stock =
      Number(product.stock);

    if (stock <= 0) {

      return 'out-stock';

    }

    if (stock <= 5) {

      return 'low';

    }

    return 'available';

  }

  // ==========================
  // IMAGE URL
  // ==========================

  getImageUrl(
    image?: string
  ): string {

    if (!image) {

      return 'assets/images/no-image.png';

    }

    if (
      image.startsWith('http')
    ) {

      return image;

    }

    return `https://cafeqr-wds8.onrender.com${image}`;

  }

  // ==========================
  // RESET
  // ==========================

  resetForm(): void {

    this.product = {

      name: '',

      price: 0,

      stock: 0,

      unit: 'Kg',

      categoryId: null,

      isAvailable: true

    };

  }

  // ==========================
  // CLOSE MODAL
  // ==========================

  closeModal(): void {

    this.showModal = false;

    this.selectedImage = null;

    this.imagePreview = null;

    this.selectedProductId = null;

    this.resetForm();

  }

}
