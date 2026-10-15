import { Injectable, signal, computed } from '@angular/core';

export interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  description: string;
  cover: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>(JSON.parse(localStorage.getItem('cart') ?? '[]'));
  count = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  total = computed(() => this.items().reduce((sum, i) => sum + i.book.price * i.quantity, 0));

  add(book: Book) {
    const exists = this.items().some((i) => i.book._id === book._id);
    const list = exists
      ? this.items().map((i) => (i.book._id === book._id ? { ...i, quantity: i.quantity + 1 } : i))
      : [...this.items(), { book, quantity: 1 }];
    this.save(list);
  }

  decrease(bookId: string) {
    const list = this.items()
      .map((i) => (i.book._id === bookId ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    this.save(list);
  }

  clear() {
    this.save([]);
  }

  private save(list: CartItem[]) {
    this.items.set(list);
    localStorage.setItem('cart', JSON.stringify(list));
  }
}