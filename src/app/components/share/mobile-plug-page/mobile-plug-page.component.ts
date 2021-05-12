import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mobile-plug-page',
  templateUrl: './mobile-plug-page.component.html',
  styleUrls: ['./mobile-plug-page.component.sass']
})
export class MobilePlugPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  heightCalculate() {
    const h = window.innerHeight;
    return {
      'height' : (h - 73) + 'px'
    };
  }
}
