import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';


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


}