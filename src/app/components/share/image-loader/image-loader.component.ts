import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import GradientJSON from '../../../../assets/gradients.json';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.sass']
})
export class ImageLoaderComponent implements OnInit {
  @Output() imgEmmit = new EventEmitter<any>();
  @Output() colorEmmit = new EventEmitter<any>();
  @Input() form: FormGroup;
  @Input() formData;
  @Input() f;
  gradietnNumber: number = 0;
  roomColor: string;
  loaderImg: boolean;
  @ViewChild('file') file: ElementRef;
  previewUrlImg;

  constructor() { }

  ngOnInit(): void {
    this.roomColor = this.formData.roomColor;
  }

  loaderImgOpen() {
    this.loaderImg = !this.loaderImg;
  }

  generateGradient() {
    if (this.f.image.value == 'color') {
      this.gradietnNumber == Number(Object.keys(GradientJSON).length) - 1 ? this.gradietnNumber = 0 : this.gradietnNumber++;
      this.roomColor = GradientJSON[this.gradietnNumber];
      this.colorEmmit.emit(this.roomColor)
    }
  }

  loadImg() {
    if (this.f.image.value == 'image') {
      this.file.nativeElement.click();
    }
  }

  changeImgLoad($event) {
    const file = $event.target.files[0];

    if ( file && !file.type.match('image')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      this.previewUrlImg = e.target.result;
      this.imgEmmit.emit(this.previewUrlImg);
    };
    reader.readAsDataURL(file);
  }

  resetImgandColor() {
    this.previewUrlImg = null;
  }
}
