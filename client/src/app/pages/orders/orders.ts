import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Order } from '../../services/api';

@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  templateUrl: './orders.html',
})
export class Orders implements OnInit {
  private api = inject(ApiService);
  orders = signal<Order[]>([]);
  message = signal('');

  ngOnInit() {
    this.api.myOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: () => this.message.set('Please log in to see your orders.'),
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleString();
  }
}