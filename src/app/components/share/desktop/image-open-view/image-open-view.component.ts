import {Component, HostListener, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-image-open-view',
  templateUrl: './image-open-view.component.html',
  styleUrls: ['./image-open-view.component.sass']
})
export class ImageOpenViewComponent implements OnInit {
  @Input() imageSrc: string;

  @HostListener('document:keyup.escape', ['$event']) onKeydownHandler() {
    const modalBackground = document.getElementsByClassName('background-modal-none')[0];
    if ( modalBackground ){
      modalBackground.classList.remove('background-modal-none');
      this.activeModal.close();
    }
  }

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
  }

}
