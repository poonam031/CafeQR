import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  

  cartItems: any[] = JSON.parse(localStorage.getItem('cart') || '[]');

  constructor() {}

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  addToCart(item: any) {

    const existingItem = this.cartItems.find(x => x.id === item.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({
        ...item,
        quantity: 1
      });
    }

    this.saveCart();
  }

  getCartItems() {
    return this.cartItems;
  }

  getTotal() {
    return this.cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  increase(item: any) {
    item.quantity++;
    this.saveCart();
  }

  decrease(item: any) {

    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.remove(item);
      return;
    }

    this.saveCart();
  }

  remove(item: any) {
    this.cartItems = this.cartItems.filter(x => x.id !== item.id);
    this.saveCart();
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  getCartCount() {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

}
