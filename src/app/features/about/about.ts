import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements AfterViewInit {

  @ViewChild('journeySection')
  journeySection!: ElementRef<HTMLElement>;

  journeyProgress = 0;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateJourneyProgress();
    }, 0);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateJourneyProgress();
  }

  private updateJourneyProgress(): void {

    if (!this.journeySection) {
      return;
    }

    const rect =
      this.journeySection.nativeElement.getBoundingClientRect();

    const viewportHeight =
      window.innerHeight;

    const startPoint =
      viewportHeight * 0.85;

    const endPoint =
      viewportHeight * 0.25;

    const totalDistance =
      startPoint - endPoint;

    const movedDistance =
      startPoint - rect.top;

    const progress =
      movedDistance / totalDistance;

    this.journeyProgress =
      Math.max(
        0,
        Math.min(100, progress * 100)
      );
  }
}