import {Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.sass']
})
export class TextareaComponent implements OnInit {
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChildren('answers') answers: QueryList<any>;
  isLimit: boolean;
  isDuplicate: boolean;
  @Input() questionForm;
  @Input() submitted;
  @Input() status;
  @Input()  title: string;
  @Input()  limit: number;
  @Input()  limitEnd: number;
  @Input() i;
  @Input() answer;
  @Input() answerForm;


  constructor() {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateTextarea();
    });
  }

  updateTextarea() {
    if (this.status == 'single') {
      this.textareaGrow();
    }
    if (this.status == 'multi') {
      this.textareaGrowAnswer();
    }
  }

  limitError(param, i) {
    if (param == 'question') {
      const length = this.f.question.value.length;
      this.isLimit = length > 115;
    }
    if (param === 'answer' && this.f.answers.value[i].name.length >= 55) {
      return 'answer' + i;
    }
  }

  get f() {
    return this.questionForm.controls;
  }

  textareaGrow(): void {
    if (this.textarea) {
      this.calculateRows(this.textarea);
    }
  }

  textareaGrowAnswer(): void {
    this.calculateRows(this.answers.first);
  }

  calculateRows(el) {
    const paddingTop = parseInt(getComputedStyle(el.nativeElement).paddingTop, 10);
    const paddingBottom = parseInt(getComputedStyle(el.nativeElement).paddingBottom, 10);
    const lineHeight = parseInt(getComputedStyle(el.nativeElement).lineHeight, 10);
    el.nativeElement.rows = 1;
    const innerHeight = el.nativeElement.scrollHeight - paddingTop - paddingBottom;
    el.nativeElement.rows = innerHeight / lineHeight;
  }

  letsSlice(control, start, finish) {
    return control.slice(start, finish);
  }

  colorError(length, numYel, numMain) {
    if (length > numYel && length <= numMain) {
      return {
        'color': '#7d7d7d'
      };
    }
    if (length > numMain) {
      return {
        'color': '#FF3232'
      };
    }
  }

  checkingEqual(value, status) {
    const valueArr = this.f.answers.value.map((item) => {
      return item.name.trim();
    });
    const result = (valueArr.filter((item, index) => valueArr.indexOf(item) != index));
    if (status === 'check') {
      return result.length > 0;
    }
    if (value !== null) {
      const arr = valueArr.filter((el) => {
        return el.trim() === value.trim() && value.trim().length !== 0;
      });
      return this.submitted && result.length !== 0 && arr.length > 1;
    }
  }
}

