import { Component, OnInit, Input } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-quiz-errors',
  templateUrl: './quiz-errors.component.html',
  styleUrls: ['./quiz-errors.component.sass']
})
export class QuizErrorsComponent implements OnInit {
  @Input() errType: any; // 'time' or 'error'
  @Input() title: string;
  @Input() customMessage: string;
  @Input() description: string;
  @Input() editionDescription: object[]; // only for 1th "Insufficient BET"
  @Input() nameButton: string; // 'fine' or 'report'

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
