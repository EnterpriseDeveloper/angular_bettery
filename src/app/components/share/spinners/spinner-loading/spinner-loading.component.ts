import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-spinner-loading',
  templateUrl: './spinner-loading.component.html',
  styleUrls: ['./spinner-loading.component.sass']
})
export class SpinnerLoadingComponent implements OnInit {
  activated = [
    'active1',
    'active2',
    'active3',
    'active4'
  ];

  @Input() withoutSpinner: boolean;
  @Input() desktop: boolean;

  constructor() {
    this.forActiveAll();
    setInterval(() => {
      this.forActiveAll();
    }, 700);
  }

  forActive(num, el1, el2, el3, el4): void {
    setTimeout(() => {
      this.activated[num] = el1;
    }, 100);
    setTimeout(() => {
      this.activated[num] = el2;
    }, 300);
    setTimeout(() => {
      this.activated[num] = el3;
    }, 500);
    setTimeout(() => {
      this.activated[num] = el4;
    }, 700);
  }

  forActiveAll(): void {
    this.forActive(0, 'active1', 'active2', 'active3', 'active4');
    this.forActive(1, 'active2', 'active3', 'active4', 'active1');
    this.forActive(2, 'active3', 'active4', 'active1', 'active2');
    this.forActive(3, 'active4', 'active1', 'active2', 'active3');
  }

  styleDesktop() {
    if (this.desktop) {
      return {
        'position': 'relative',
        'background': 'none'
      };
    }
  }

  ngOnInit(): void {
  }

}
