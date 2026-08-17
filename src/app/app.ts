import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {


  router = inject(Router);



  isAdminRoute(): boolean {

    return this.router.url.startsWith('/admin');

  }


}