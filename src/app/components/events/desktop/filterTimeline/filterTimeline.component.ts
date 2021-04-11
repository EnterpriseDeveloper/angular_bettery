import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'filterTimeline',
  templateUrl: './filterTimeline.component.html',
  styleUrls: ['./filterTimeline.component.sass']
})
export class FilterTimelineComponent implements OnInit {
  @Output() closeEmmit = new EventEmitter();
  @Output() filterData = new EventEmitter();
  form: FormGroup;
  disabled: boolean;

  constructor(
    private formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      showEnd: [true, Validators.required],
    });
  }

  ngOnInit(): void {
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
