import { Component } from '@angular/core';

@Component({
  selector: 'app-impact',
  imports: [],
  templateUrl: './impact.html',
  styleUrl: './impact.css',
})
export class Impact {


  toggleImpactVideo(event:any){

    const card = event.currentTarget;

    const video = card.querySelector('video') as HTMLVideoElement;


    if(video){

      if(video.paused){

        video.play();

      }
      else{

        video.pause();

      }

    }

  }




  openVideo(event:any){

  const card = event.currentTarget;

  const video = card.querySelector('video');

  if(video){

    if(video.paused){

      video.play();

    }
    else{

      video.pause();

    }

  }

}


}
