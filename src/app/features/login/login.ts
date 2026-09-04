import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  loading = false;

  errorMessage = '';
  successMessage = '';

  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  login(): void {

    this.errorMessage = '';
    this.successMessage = '';


    if (!this.email.trim()) {

      this.errorMessage =
        'Please enter your email.';

      return;
    }


    if (!this.password.trim()) {

      this.errorMessage =
        'Please enter your password.';

      return;
    }


    this.loading = true;


    this.authService
      .login({
        email: this.email.trim(),
        password: this.password
      })
      .subscribe({

        next: () => {

          this.loading = false;

          this.successMessage =
            'Login successful.';

          setTimeout(() => {

            this.router.navigate([
              '/admin/dashboard'
            ]);

          }, 500);
        },


        error: (error) => {

          console.error(
            'Login error:',
            error
          );

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Invalid email or password.';
        }

      });
  }


  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }
}