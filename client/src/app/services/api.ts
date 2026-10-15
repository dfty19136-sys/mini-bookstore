import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../config';
import { AuthService } from './auth';
import { Book, CartItem } from './cart';

export interface Order {
  _id: string;
  items: { title: string; price: number; quantity: number }[];
  total: number;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private authHeaders() {
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + this.auth.token() }) };
  }

  getBooks(category: string) {
    const url = category
      ? API_URL + '/books?category=' + encodeURIComponent(category)
      : API_URL + '/books';
    return this.http.get<Book[]>(url);
  }

  register(name: string, email: string, password: string) {
    return this.http.post(API_URL + '/auth/register', { name, email, password });
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: { name: string } }>(
      API_URL + '/auth/login',
      { email, password }
    );
  }

  placeOrder(items: CartItem[]) {
    const body = { items: items.map((i) => ({ bookId: i.book._id, quantity: i.quantity })) };
    return this.http.post(API_URL + '/orders', body, this.authHeaders());
  }

  myOrders() {
    return this.http.get<Order[]>(API_URL + '/orders/my', this.authHeaders());
  }
}