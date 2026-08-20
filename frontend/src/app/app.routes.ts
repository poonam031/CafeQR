import { Routes } from '@angular/router';


// Customer Pages
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './pages/menu/menu.component';
import { CartComponent } from './pages/cart/cart.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';


// Authentication
import { AdminComponent } from './auth/admin/admin.component';
import { KitchenLoginComponent } from './auth/kitchen-login/kitchen-login.component';


// Layouts
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { KitchenLayoutComponent } from './layouts/kitchen-layout/kitchen-layout.component';


// Admin Components
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { MenuComponent as AdminMenuComponent } from './admin/menu/menu.component';
import { ProductsComponent } from './admin/products/products.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { TablesComponent } from './admin/tables/tables.component';
import { HistoryComponent } from './kitchen/history/history.component';
import { SettingComponent } from './admin/setting/setting.component';


// Kitchen Components
import { KitchenComponent } from './kitchen/dashboard/kitchen.component';
import { OnlinePaymentComponent } from './online-payment/online-payment.component';

export const routes: Routes = [

  // ==========================
  // CUSTOMER ROUTES
  // ==========================
  { path: '', component: HomeComponent },
  { path: 'menu/:tableId', component: MenuComponent },
  { path: 'cart', component: CartComponent },
  {
  path: 'online-payment/:orderId',component: OnlinePaymentComponent},
  { path: 'payment', component: PaymentComponent },
  { path: 'success', component: OrderSuccessComponent },

  // ==========================
  // LOGIN ROUTES
  // ==========================
  { path: 'admin/login', component: AdminComponent },
  { path: 'kitchen/login', component: KitchenLoginComponent },

  // ==========================
  // ADMIN LAYOUT
  // ==========================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'menu', component: AdminMenuComponent },
      {path: 'history',component: HistoryComponent},
      { path: 'products', component: ProductsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'settings', component: SettingComponent },
      { path: 'tables', component: TablesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ==========================
  // KITCHEN LAYOUT
  // ==========================
  {
    path: 'kitchen',
    component: KitchenLayoutComponent,
    children: [
      { path: '', component: KitchenComponent },

      { path: 'history', component: HistoryComponent }
    ]
  },

  // ==========================
  // NOT FOUND
  // ==========================
  { path: '**', redirectTo: '' }

];
