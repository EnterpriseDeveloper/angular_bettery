import { Component, Input } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { EventsTemplatesDesktopComponent } from "../../../createEvent/desktop/events-templates-desktop/events-templates-desktop.component";

@Component({
  selector: 'spinner-load-more',
  templateUrl: './spinner-load-more.component.html',
  styleUrls: ['./spinner-load-more.component.sass']
})
export class SpinnerLoadMoreComponent {
  @Input() finishLoading: boolean

  activated = [
    'active1',
    'active2',
    'active3',
    'active4'
  ];

  constructor(
    private modalService: NgbModal,
    config: NgbModalConfig) {
    config.keyboard = false;
    config.backdrop = 'static';
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

  openCreateEventModal() {
    this.modalService.open(EventsTemplatesDesktopComponent, { centered: true });
  }

}
