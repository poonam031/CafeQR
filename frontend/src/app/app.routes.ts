import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './pages/menu/menu.component';
import { CartComponent } from './pages/cart/cart.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';

import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { MenuComponent as AdminMenuComponent } from './admin/menu/menu.component';
import { OrdersComponent } from './admin/orders/orders.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { TablesComponent } from './admin/tables/tables.component';
import { KitchenComponent } from './kitchen/dashboard/kitchen.component';
import { KitchenLoginComponent } from './auth/kitchen-login/kitchen-login.component';
import { AdminComponent } from './auth/admin/admin.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu/:tableId', component: MenuComponent },
  { path: 'cart', component: CartComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'success', component: OrderSuccessComponent },

  { path: 'admin/login', component: AdminComponent },
  { path: 'kitchen/login', component: KitchenLoginComponent },
    { path: 'kitchen', component: KitchenComponent },



  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/menu', component: AdminMenuComponent },
  { path: 'admin/orders', component: OrdersComponent },
  { path: 'admin/categories', component: CategoriesComponent },
  { path: 'admin/tables', component: TablesComponent },

  { path: '**', redirectTo: '' }
];
