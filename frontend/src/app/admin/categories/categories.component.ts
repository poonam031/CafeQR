import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

interface Category {
  id: number;
  name: string;
  description?: string;
  image: string;
  items: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {

  // =====================================
  // BACKEND API
  // =====================================

  private apiUrl =
    'http://localhost:3000/category';


  // =====================================
  // CATEGORIES
  // =====================================

  categories: Category[] = [];


  // =====================================
  // SEARCH
  // =====================================

  searchText: string = '';


  // =====================================
  // MODAL
  // =====================================

  showModal: boolean = false;

  isEditMode: boolean = false;


  // =====================================
  // LOADING
  // =====================================

  loading: boolean = false;

  saving: boolean = false;


  // =====================================
  // SELECTED CATEGORY
  // =====================================

  selectedCategory: Category = {

    id: 0,

    name: '',

    description: '',

    image: '',

    items: 0,

    status: 'Active'

  };


  // =====================================
  // SELECTED IMAGE FILE
  // =====================================

  selectedImage: File | null = null;


  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

    this.loadCategories();

  }


  // =====================================
  // GET CATEGORIES
  // =====================================

  loadCategories(): void {

    this.loading = true;

    this.http
      .get<any[]>(this.apiUrl)
      .subscribe({

        next: (data) => {

          this.categories =
            data.map(category => ({

              id: category.id,

              name: category.name,

              description:
                category.description || '',

              image:
                category.image || '',

              items:
                Number(category.items) || 0,

              status:
                category.status === 'Inactive'
                  ? 'Inactive'
                  : 'Active'

            }));

          this.loading = false;

          console.log(
            'Categories:',
            this.categories
          );

        },

        error: (error) => {

          console.error(
            'Category loading error:',
            error
          );

          this.loading = false;

          alert(
            'Unable to load categories.'
          );

        }

      });

  }


  // =====================================
  // IMAGE URL
  // =====================================

  getImageUrl(
    image?: string
  ): string {

    if (!image) {

      return '';

    }


    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {

      return image;

    }


    return `http://localhost:3000${image}`;

  }


  // =====================================
  // SEARCH
  // =====================================

  get filteredCategories(): Category[] {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    if (!search) {

      return this.categories;

    }


    return this.categories.filter(
      category =>
        category.name
          .toLowerCase()
          .includes(search)
    );

  }


  // =====================================
  // ADD CATEGORY
  // =====================================

  addCategory(): void {

    this.isEditMode = false;

    this.selectedCategory = {

      id: 0,

      name: '',

      description: '',

      image: '',

      items: 0,

      status: 'Active'

    };

    this.selectedImage = null;

    this.showModal = true;

  }


  // =====================================
  // EDIT CATEGORY
  // =====================================

  editCategory(
    category: Category
  ): void {

    this.isEditMode = true;

    this.selectedCategory = {

      ...category

    };

    this.selectedImage = null;

    this.showModal = true;

  }


  // =====================================
  // DELETE CATEGORY
  // =====================================

  deleteCategory(
    category: Category
  ): void {

    if (!category.id) {

      return;

    }


    const confirmDelete =
      confirm(
        `Are you sure you want to delete "${category.name}" category?`
      );


    if (!confirmDelete) {

      return;

    }


    this.http
      .delete(
        `${this.apiUrl}/${category.id}`
      )
      .subscribe({

        next: () => {

          this.categories =
            this.categories.filter(
              item =>
                item.id !== category.id
            );

          alert(
            'Category deleted successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Delete category error:',
            error
          );

          alert(
            'Unable to delete category.'
          );

        }

      });

  }


  // =====================================
  // IMAGE UPLOAD
  // =====================================

  onImageSelected(
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


    // =================================
    // IMAGE TYPE CHECK
    // =================================

    if (
      !file.type.startsWith('image/')
    ) {

      alert(
        'Please select a valid image.'
      );

      return;

    }


    // =================================
    // IMAGE PREVIEW
    // =================================

    const reader =
      new FileReader();


    reader.onload = () => {

      this.selectedCategory.image =
        reader.result as string;

    };


    reader.readAsDataURL(file);


    // =================================
    // STORE FILE
    // =================================

    this.selectedImage = file;

  }


  // =====================================
  // REMOVE IMAGE
  // =====================================

  removeImage(): void {

    this.selectedCategory.image = '';

    this.selectedImage = null;

  }


  // =====================================
  // SAVE CATEGORY
  // =====================================

  saveCategory(): void {

    // =================================
    // VALIDATION
    // =================================

    if (
      !this.selectedCategory.name.trim()
    ) {

      alert(
        'Please enter category name.'
      );

      return;

    }


    // =================================
    // FORM DATA
    // =================================

    const formData =
      new FormData();


    // =================================
    // NAME
    // =================================

    formData.append(
      'name',
      this.selectedCategory.name.trim()
    );


    // =================================
    // DESCRIPTION
    // =================================

    formData.append(
      'description',
      this.selectedCategory.description || ''
    );


    // =================================
    // NUMBER OF ITEMS
    // =================================

    formData.append(
      'items',
      String(
        this.selectedCategory.items || 0
      )
    );


    // =================================
    // STATUS
    // =================================

    formData.append(
      'status',
      this.selectedCategory.status
    );


    // =================================
    // IMAGE
    // =================================

    if (this.selectedImage) {

      formData.append(
        'image',
        this.selectedImage
      );

    }


    // =================================
    // DEBUG
    // =================================

    console.log(
      'CATEGORY FORM DATA:'
    );

    formData.forEach(
      (value, key) => {

        console.log(
          key,
          value
        );

      }
    );


    this.saving = true;


    // =================================
    // UPDATE CATEGORY
    // =================================

    if (
      this.isEditMode &&
      this.selectedCategory.id
    ) {

      this.http
        .put(
          `${this.apiUrl}/${this.selectedCategory.id}`,
          formData
        )
        .subscribe({

          next: (response) => {

            console.log(
              'CATEGORY UPDATED:',
              response
            );

            this.saving = false;

            this.closeModal();

            this.loadCategories();

            alert(
              'Category updated successfully.'
            );

          },

          error: (error) => {

            console.error(
              'Update category error:',
              error
            );

            this.saving = false;

            alert(
              'Unable to update category.'
            );

          }

        });

      return;

    }


    // =================================
    // CREATE CATEGORY
    // =================================

    this.http
      .post(
        this.apiUrl,
        formData
      )
      .subscribe({

        next: (response) => {

          console.log(
            'CATEGORY CREATED:',
            response
          );

          this.saving = false;

          this.closeModal();

          this.loadCategories();

          alert(
            'Category added successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Create category error:',
            error
          );

          this.saving = false;

          alert(
            'Unable to create category.'
          );

        }

      });

  }


  // =====================================
  // CLOSE MODAL
  // =====================================

  closeModal(): void {

    this.showModal = false;

    this.selectedImage = null;

    this.selectedCategory = {

      id: 0,

      name: '',

      description: '',

      image: '',

      items: 0,

      status: 'Active'

    };

  }

}
