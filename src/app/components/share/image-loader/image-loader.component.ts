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
  eventColor: string;
  loaderImg: boolean;
  @ViewChild('fileInput') fileInput: ElementRef;
  previewUrlImg;
  file;
  fileTooLarge: boolean;

  constructor() {
  }

  ngOnInit(): void {
    if (!this.eventColor) {
      this.eventColor = this.formData.roomColor;
      this.colorEmmit.emit(this.eventColor);
    }
    if (this.formData.thumImage == 'undefined') {
      this.eventColor = this.formData.thumColor;
      this.previewUrlImg = undefined;
      this.loaderImg = true;
      this.colorEmmit.emit(this.eventColor);
    }
    if (this.formData.thumColor == 'undefined') {
      this.previewUrlImg = this.formData.thumImage;
      this.loaderImg = true;
      this.imgEmmit.emit({img: this.previewUrlImg, valid: false});
    }
  }

  loaderImgOpen(e) {
    if (e.target.classList.contains('trashRed')) {
      return;
    }

    this.loaderImg = !this.loaderImg;
  }

  generateGradient() {
    if (this.f.image.value == 'color') {
      this.gradietnNumber == Number(Object.keys(GradientJSON).length) - 1 ? this.gradietnNumber = 0 : this.gradietnNumber++;
      this.eventColor = GradientJSON[this.gradietnNumber];
      this.colorEmmit.emit(this.eventColor);
    }
  }

  loadImg() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  changeColorFunc() {
    this.formData.imgOrColor = 'color';
    this.fileTooLarge = false;
    this.colorEmmit.emit(this.eventColor);
  }

  changeImgLoad($event) {
    this.formData.imgOrColor = 'image';
    this.fileTooLarge = false;
    this.file = $event.target.files[0];

    if (this.file && !this.file.type.match('image')) {
      return;
    }
    if (this.file && this.file.size > 5249880) {
      this.fileTooLarge = true;
      this.readerInit(this.fileTooLarge);
      return;
    }
    this.readerInit(this.fileTooLarge);
  }

  readerInit(valid: boolean): void {
    const reader = new FileReader();
    reader.onload = e => {
      this.previewUrlImg = e.target.result;
      this.imgEmmit.emit({img: this.previewUrlImg, valid: valid});
    };
    if (this.file) {
      reader.readAsDataURL(this.file);
    }
  }

  resetImgandColor() {
    this.fileTooLarge = false;
    this.previewUrlImg = undefined;
    this.imgEmmit.emit({img: this.previewUrlImg, valid: false});
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
