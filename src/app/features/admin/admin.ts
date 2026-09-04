import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }
}