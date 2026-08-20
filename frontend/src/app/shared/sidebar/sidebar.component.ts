import {
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

import { RouterLinkActive } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';


interface MenuItem {
    label: string;
    icon: string;
    route: string;
}


@Component({
    selector: 'app-sidebar',

    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive
    ],

    templateUrl: './sidebar.component.html',

    styleUrl: './sidebar.component.css'
})


export class SidebarComponent {

    @Input()
    isOpen = true;


    @Output()
    closeMenu = new EventEmitter<void>();


    role = 'ADMIN';


    menuItems: MenuItem[] = [

        {
            label: 'Dashboard',
            icon: 'bi bi-house',
            route: '/admin/dashboard'
        },

        {
            label: 'Kitchen Orders',
            icon: 'bi bi-receipt',
            route: '/kitchen'
        },

        {
            label: 'History',
            icon: 'bi bi-clock-history',
            route: '/kitchen/history'
        },

        {
            label: 'Menu',
            icon: 'bi bi-menu-button',
            route: '/admin/menu'
        },

        {
            label: 'Products',
            icon: 'bi bi-box',
            route: '/admin/products'
        },

        {
            label: 'Categories',
            icon: 'bi bi-grid',
            route: '/admin/categories'
        },

        {
            label: 'Settings',
            icon: 'bi bi-gear',
            route: '/admin/settings'
        }

    ];


    /* =========================================
       CLOSE MOBILE MENU
    ========================================== */

    menuItemClick(): void {

        this.closeMenu.emit();

    }


    /* =========================================
       LOGOUT
    ========================================== */

    logout(): void {

        console.log('Logout');

    }

}
