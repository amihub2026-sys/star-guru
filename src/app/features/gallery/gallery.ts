import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery {


  // Book states

  bookOpen = false;

  pageOpen = false;

  contentOpen = false;



  // Open book animation

  openBook(){


    if(this.bookOpen){
      return;
    }



    // Front cover opens

    this.bookOpen = true;



    // First page reveal

    setTimeout(()=>{

      this.pageOpen = true;

    },1200);




    // Content reveal

    setTimeout(()=>{

      this.contentOpen = true;

    },2200);



  }



}