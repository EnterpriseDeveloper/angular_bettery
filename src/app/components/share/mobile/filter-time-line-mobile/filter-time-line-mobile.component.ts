import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-filter-time-line-mobile',
  templateUrl: './filter-time-line-mobile.component.html',
  styleUrls: ['./filter-time-line-mobile.component.sass']
})
export class FilterTimeLineMobileComponent implements OnInit {

  @Input() statusMode: boolean;
  @Output() closeEmmit = new EventEmitter();
  @Output() filterData = new EventEmitter();
  form: FormGroup;
  disabled: boolean;
  value: boolean;

  constructor(
    private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    this.value = this.statusMode;
    this.initializeForm();
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      showEnd: [this.value, Validators.required],
    });
  }

  closeWindow() {
    this.closeEmmit.emit(true);
  }

  sendForm(form: FormGroup, $event: any) {

    if (this.disabled) {
      return;
    }
    this.disabled = true;

    if (form.value.showEnd === this.statusMode){
     this.closeWindow();
    }
    const data = {
      showEnd: form.value.showEnd
    };
    this.filterData.emit(data);
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

}
