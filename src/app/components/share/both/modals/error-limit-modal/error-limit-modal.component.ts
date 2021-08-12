import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-error-limit-modal',
  templateUrl: './error-limit-modal.component.html',
  styleUrls: ['./error-limit-modal.component.sass']
})
export class ErrorLimitModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
