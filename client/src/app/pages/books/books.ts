import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { CartService, Book } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-books',
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  cart = inject(CartService);
  auth = inject(AuthService);

  books = signal<Book[]>([]);
  categories = ['All', 'Novels', 'Self-Development'];
  selected = signal('All');
  message = signal('');
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const category = this.selected() === 'All' ? '' : this.selected();
    this.api.getBooks(category).subscribe({
      next: (data) => {
        this.books.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.set('Could not load books. Is the server running?');
        this.loading.set(false);
      },
    });
  }

  selectCategory(c: string) {
    this.selected.set(c);
    this.load();
  }

  placeOrder() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.api.placeOrder(this.cart.items()).subscribe({
      next: () => {
        this.cart.clear();
        this.router.navigate(['/orders']);
      },
      error: () => this.message.set('Could not place the order. Please try again.'),
    });
  }
}