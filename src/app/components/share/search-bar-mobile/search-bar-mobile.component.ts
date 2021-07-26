import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-search-bar-mobile',
  templateUrl: './search-bar-mobile.component.html',
  styleUrls: ['./search-bar-mobile.component.sass']
})
export class SearchBarMobileComponent implements OnInit {

  searchWord = '';
  timeout: any;
  @Output() searchWordEmit = new EventEmitter();
  @Output() activeItemEmit = new EventEmitter();
  @Output() timelineActive = new EventEmitter();
  @Input() allAmountEvents: number;
  @Input() amount: number;
  @Input() active = 'trending';
  constructor() {
  }

  ngOnInit(): void {
  }

  changesActiveBtn(str): void {
    this.active = str;
    this.activeItemEmit.emit(this.active);
  }

  letsFindEvent() {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.searchWordEmit.emit(this.searchWord);
    }, 300);
  }

  openFilter() {
    this.timelineActive.emit(true);
  }

}
