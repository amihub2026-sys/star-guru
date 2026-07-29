import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit{

  constructor(private router: Router) {}
ngAfterViewInit(): void {

  setTimeout(() => {

    this.animateCounter("daysCounter", 875, "+");
    this.animateCounter("mealsCounter", 100000, "+");
    this.animateCounter("peopleCounter", 1000, "+");

  }, 300);

}

animateCounter(id: string, target: number, suffix: string) {

  const element = document.getElementById(id) as HTMLElement | null;

  if (!element) {
    return;
  }

  let count = 0;
  const duration = 2500;
  const increment = target / (duration / 16);

  const update = () => {

    count += increment;

    if (count < target) {

      if (target >= 1000000) {
        element.innerHTML = Math.floor(count).toLocaleString() + suffix;
      } else {
        element.innerHTML = Math.floor(count) + suffix;
      }

      requestAnimationFrame(update);

    } else {

      if (target >= 1000000) {
        element.innerHTML = target.toLocaleString() + suffix;
      } else {
        element.innerHTML = target + suffix;
      }

    }
  };

  update();
}

  exploreJourney(){

    this.router.navigate(['/about']);

  }

  volunteer(){

    this.router.navigate(['/volunteer']);

  }

}