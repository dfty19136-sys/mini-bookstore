import { Routes } from '@angular/router';
import { Books } from './pages/books/books';
import { Login } from './pages/login/login';
import { Orders } from './pages/orders/orders';

export const routes: Routes = [
  { path: '', component: Books, title: 'Books - Mini Bookstore' },
  { path: 'login', component: Login, title: 'Log in - Mini Bookstore' },
  { path: 'orders', component: Orders, title: 'My Orders - Mini Bookstore' },
  { path: '**', redirectTo: '' },
];