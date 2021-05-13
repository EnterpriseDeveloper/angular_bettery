import {Component, OnInit, Input, HostListener} from '@angular/core';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.sass']
})
export class InfoModalComponent implements OnInit {
  @Input() boldName;
  @Input() name;
  @Input() name1;
  @Input() name2;
  @Input() link;



  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.close();
  }
}
