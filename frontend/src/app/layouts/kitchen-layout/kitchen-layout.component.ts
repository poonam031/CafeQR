import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';


@Component({
  selector: 'app-kitchen-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './kitchen-layout.component.html',
  styleUrl: './kitchen-layout.component.css'
})
export class KitchenLayoutComponent {

    sidebarOpen = true;


    toggleSidebar(): void {

        this.sidebarOpen = !this.sidebarOpen;

    }


    closeSidebarOnMobile(): void {

        if (window.innerWidth <= 768) {

            this.sidebarOpen = false;

        }

    }

}
