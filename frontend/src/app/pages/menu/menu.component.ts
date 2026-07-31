import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CartService} from "../../services/cart.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  constructor(private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  )

  {}


addToCart(item: any) {
  item.tableId = this.tableNo;
  this.cartService.addToCart(item);
  item.addedToCart = true;

  setTimeout(() => {
    item.addedToCart = false;
  }, 1000);
}

goToCart() {
  this.router.navigate(['/cart']);
}

get cartCount() {
  return this.cartService.getCartCount();
}

  tableNo = 1;



  selectedCategory = 'All';

  food = [
    // Pizza
{
  id: 1,
  category: 'Pizza',
  name: 'Cheese Burst Pizza',
  price: 180,
  description: 'Loaded with extra cheese.',
  image: 'assets/images/pizza/cheese-burst.jpg'
},
{
  id: 2,
  category: 'Pizza',
  name: 'Italian Pizza',
  price: 200,
  description: 'Authentic Italian style pizza.',
  image: 'assets/images/pizza/italian.jpg'
},
{
  id: 3,
  category: 'Pizza',
  name: 'Mix Loaded Pizza',
  price: 165,
  description: 'Loaded with fresh vegetables and cheese.',
  image: 'assets/images/pizza/mix-loaded.jpg'
},
{
  id: 4,
  category: 'Pizza',
  name: 'Corn Delight Pizza',
  price: 145,
  description: 'Sweet corn with mozzarella cheese.',
  image: 'assets/images/pizza/corn-delight.jpg'
},
{
  id: 5,
  category: 'Pizza',
  name: 'Golden Corn Pizza',
  price: 130,
  description: 'Golden roasted corn with herbs.',
  image: 'assets/images/pizza/golden-corn.jpg'
},
{
  id: 6,
  category: 'Pizza',
  name: 'Mushroom Pizza',
  price: 135,
  description: 'Fresh mushroom and cheese pizza.',
  image: 'assets/images/pizza/mushroom.jpg'
},
{
  id: 7,
  category: 'Pizza',
  name: 'Paneer Tikka Pizza',
  price: 145,
  description: 'Paneer tikka with spicy toppings.',
  image: 'assets/images/pizza/paneer-tikka.jpg'
},
{
  id: 8,
  category: 'Pizza',
  name: 'Baby Corn Pizza',
  price: 130,
  description: 'Baby corn with capsicum and cheese.',
  image: 'assets/images/pizza/baby-corn.jpg'
},
{
  id: 9,
  category: 'Pizza',
  name: 'Margherita Pizza',
  price: 105,
  description: 'Classic cheese Margherita pizza.',
  image: 'assets/images/pizza/margherita.jpg'
},
{
  id: 10,
  category: 'Pizza',
  name: 'Veggie Delight Pizza',
  price: 110,
  description: 'Loaded with fresh garden vegetables.',
  image: 'assets/images/pizza/veggie-delight.jpg'
},
{
  id: 11,
  category: 'Pizza',
  name: 'Chocolate Pizza',
  price: 110,
  description: 'Chocolate dessert pizza.',
  image: 'assets/images/pizza/chocolate.jpg'
},
{
  id: 12,
  category: 'Pizza',
  name: 'Jain Pizza',
  price: 110,
  description: 'Prepared without onion and garlic.',
  image: 'assets/images/pizza/jain.jpg'
},

   // Coffee
{
  id: 13,
  category: 'Coffee',
  name: 'Roasted Coffee',
  price: 100,
  description: 'Freshly roasted premium coffee.',
  image: 'assets/images/coffee.jpg'
},
{
  id: 14,
  category: 'Coffee',
  name: 'Roasted Mocha Coffee',
  price: 110,
  description: 'Rich roasted coffee with mocha.',
  image: 'assets/images/coffee.jpg'
},
{
  id: 15,
  category: 'Coffee',
  name: 'Classic Cold Coffee',
  price: 60,
  description: 'Refreshing chilled coffee.',
  image: 'assets/images/coffee.jpg'
},
{
  id: 16,
  category: 'Coffee',
  name: 'Classic Mocha Cold Coffee',
  price: 70,
  description: 'Cold coffee blended with mocha.',
  image: 'assets/images/coffee.jpg'
},
{
  id: 17,
  category: 'Coffee',
  name: 'Hot Coffee',
  price: 35,
  description: 'Fresh hot coffee.',
  image: 'assets/images/coffee.jpg'
},
{
  id: 18,
  category: 'Coffee',
  name: 'Hot Bournvita',
  price: 55,
  description: 'Creamy hot Bournvita.',
  image: 'assets/images/coffee.jpg'
},
{
  id: 19,
  category: 'Coffee',
  name: 'Hot Chocolate',
  price: 55,
  description: 'Rich hot chocolate.',
  image: 'assets/images/coffee.jpg'
},
{
  id: 20,
  category: 'Coffee',
  name: 'Chocolate Kad-B',
  price: 100,
  description: 'Special chocolate coffee.',
  image: 'assets/images/coffee.jpg'
},

// Shakes
{
  id: 21,
  category: 'Shakes',
  name: 'Blueberry Frappe',
  price: 130,
  description: 'Blueberry flavoured frappe shake.',
  image: 'assets/images/shake.jpg'
},
{
  id: 22,
  category: 'Shakes',
  name: 'Chocolate Frappe',
  price: 120,
  description: 'Chocolate frappe shake.',
  image: 'assets/images/shake.jpg'
},
{
  id: 23,
  category: 'Shakes',
  name: 'Saffron Frappe',
  price: 120,
  description: 'Premium saffron frappe.',
  image: 'assets/images/shake.jpg'
},
{
  id: 24,
  category: 'Shakes',
  name: 'Mango Shake',
  price: 120,
  description: 'Fresh mango milkshake.',
  image: 'assets/images/shake.jpg'
},
{
  id: 25,
  category: 'Shakes',
  name: 'Butterscotch Shake',
  price: 95,
  description: 'Creamy butterscotch shake.',
  image: 'assets/images/shake.jpg'
},
{
  id: 26,
  category: 'Shakes',
  name: 'Strawberry Shake',
  price: 95,
  description: 'Fresh strawberry shake.',
  image: 'assets/images/shake.jpg'
},
{
  id: 27,
  category: 'Shakes',
  name: 'Vanilla Shake',
  price: 90,
  description: 'Classic vanilla shake.',
  image: 'assets/images/shake.jpg'
},
{
  id: 28,
  category: 'Shakes',
  name: 'Bubblegum Shake',
  price: 125,
  description: 'Bubblegum flavoured milkshake.',
  image: 'assets/images/shake.jpg'
},

// Burger
{
  id: 29,
  category: 'Burger',
  name: 'Spicy Paneer Burger',
  price: 140,
  description: 'Spicy paneer patty with fresh veggies.',
  image: 'assets/images/burger.jpg'
},
{
  id: 30,
  category: 'Burger',
  name: 'Paneer Burger',
  price: 130,
  description: 'Classic paneer burger with cheese.',
  image: 'assets/images/burger.jpg'
},
{
  id: 31,
  category: 'Burger',
  name: 'Veg Burger',
  price: 85,
  description: 'Fresh vegetable burger.',
  image: 'assets/images/burger.jpg'
},
{
  id: 32,
  category: 'Burger',
  name: 'Crispy Veg Burger',
  price: 85,
  description: 'Crispy veg patty with lettuce.',
  image: 'assets/images/burger.jpg'
},
{
  id: 33,
  category: 'Burger',
  name: 'Corn Spinach Burger',
  price: 85,
  description: 'Corn and spinach burger.',
  image: 'assets/images/burger.jpg'
},
{
  id: 34,
  category: 'Burger',
  name: 'Mexican Aloo Tikki Burger',
  price: 75,
  description: 'Mexican style aloo tikki burger.',
  image: 'assets/images/burger.jpg'
},
{
  id: 35,
  category: 'Burger',
  name: 'Aloo Tikki Burger',
  price: 65,
  description: 'Classic aloo tikki burger.',
  image: 'assets/images/burger.jpg'
},
{
  id: 36,
  category: 'Burger',
  name: 'Masala Aloo Tikki Burger',
  price: 70,
  description: 'Spicy masala aloo tikki burger.',
  image: 'assets/images/burger.jpg'
},

// Fries
{
  id: 37,
  category: 'Fries',
  name: "Heaven's Special Peri Peri Fries",
  price: 145,
  description: 'Special peri peri seasoned fries.',
  image: 'assets/images/fries.jpg'
},
{
  id: 38,
  category: 'Fries',
  name: "Heaven's Special Fries",
  price: 130,
  description: 'House special crispy fries.',
  image: 'assets/images/fries.jpg'
},
{
  id: 39,
  category: 'Fries',
  name: 'Sweet Mustard Peri Peri Fries',
  price: 115,
  description: 'Sweet mustard with peri peri seasoning.',
  image: 'assets/images/fries.jpg'
},
{
  id: 40,
  category: 'Fries',
  name: 'Sweet Mustard Fries',
  price: 100,
  description: 'Sweet mustard flavoured fries.',
  image: 'assets/images/fries.jpg'
},
{
  id: 41,
  category: 'Fries',
  name: 'Masala Fries',
  price: 85,
  description: 'Indian masala seasoned fries.',
  image: 'assets/images/fries.jpg'
},
{
  id: 42,
  category: 'Fries',
  name: 'Salted Fries',
  price: 70,
  description: 'Classic salted french fries.',
  image: 'assets/images/fries.jpg'
},
{
  id: 43,
  category: 'Fries',
  name: 'Peri Peri Fries',
  price: 85,
  description: 'Spicy peri peri fries.',
  image: 'assets/images/fries.jpg'
},

  ];

  filteredFood: any[] = [];

  ngOnInit(): void {

    this.tableNo = Number(this.route.snapshot.paramMap.get('tableId'));
    localStorage.setItem('tableId', this.tableNo.toString());
    this.filteredFood = this.food;
  }

  selectCategory(category: string): void {

    this.selectedCategory = category;

    if (category === 'All') {
      this.filteredFood = this.food;
      return;
    }


    this.filteredFood = this.food.filter(
      item => item.category === category
    );
  }

}
