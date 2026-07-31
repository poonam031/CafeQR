import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  email = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  login() {
    if (
      this.email === 'admin@cafe.com' &&
      this.password === 'adminCafe123'
    ) {
      localStorage.setItem('adminLoggedIn', 'true');
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.error = 'Invalid email or password';
    }
  }
}
