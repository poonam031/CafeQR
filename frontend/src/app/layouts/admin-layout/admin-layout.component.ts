import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {


   sidebarOpen = true;

  toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;

  console.log('Sidebar Open:', this.sidebarOpen);
}

closeSidebarOnMobile(): void {

    if (window.innerWidth <= 768) {

        this.sidebarOpen = false;

    }

}

}
