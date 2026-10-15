import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  isRegister = signal(false);
  message = signal('');
  name = '';
  email = '';
  password = '';

  toggle() {
    this.isRegister.set(!this.isRegister());
    this.message.set('');
  }

  submit() {
    this.message.set('');
    if (this.isRegister()) {
      this.api.register(this.name, this.email, this.password).subscribe({
        next: () => this.doLogin(),
        error: (err) => this.message.set(err.error?.message ?? 'Registration failed'),
      });
    } else {
      this.doLogin();
    }
  }

  private doLogin() {
    this.api.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.saveLogin(res.token, res.user.name);
        this.router.navigate(['/']);
      },
      error: (err) => this.message.set(err.error?.message ?? 'Login failed'),
    });
  }
}