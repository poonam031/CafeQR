import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kitchen-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kitchen-login.component.html',
  styleUrls: ['./kitchen-login.component.css']
})
export class KitchenLoginComponent {

  email = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  login() {
    if (
      this.email === 'Chef@cafe.com' &&
      this.password === 'ChefCafe123'
    ) {
      localStorage.setItem('chefLoggedIn', 'true');
      this.router.navigate(['/kitchen']);
    } else {
      this.error = 'Invalid email or password';
    }
  }
}
