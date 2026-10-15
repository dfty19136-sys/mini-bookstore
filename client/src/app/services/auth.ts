import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  token = signal(localStorage.getItem('token') ?? '');
  userName = signal(localStorage.getItem('userName') ?? '');
  isLoggedIn = computed(() => this.token() !== '');

  saveLogin(token: string, name: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    this.token.set(token);
    this.userName.set(name);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.token.set('');
    this.userName.set('');
  }
}