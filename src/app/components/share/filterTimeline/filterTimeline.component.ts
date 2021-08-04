import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'filterTimeline',
  templateUrl: './filterTimeline.component.html',
  styleUrls: ['./filterTimeline.component.sass']
})
export class FilterTimelineComponent implements OnInit {
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
    const data = {
      showEnd: form.value.showEnd
    };
    this.filterData.emit(data);
  }

  stopPropagation(e) {
    e.stopPropagation();
  }
}
