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
  @ViewChild('fileInput') fileInput: ElementRef;
  previewUrlImg;
  file;
  fileTooLarge: boolean;

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
      this.colorEmmit.emit(this.roomColor);
    }
  }

  loadImg() {
    // if (this.f.image.value == 'image') {
      this.fileInput.nativeElement.click();
    // }
  }

  changeColorFunc() {
    this.fileTooLarge = false;
  }

  changeImgLoad($event) {
    this.fileTooLarge = false
    this.file = $event.target.files[0];
    if (this.file.size > 5249880) {
      this.fileTooLarge = true;
      return;
    }

    if ( this.file && !this.file.type.match('image')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      this.previewUrlImg = e.target.result;
      this.imgEmmit.emit(this.previewUrlImg);
    };
    reader.readAsDataURL(this.file);
  }

  resetImgandColor() {
    this.previewUrlImg = null;
    this.fileTooLarge = false;
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) { return '0 Bytes'; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
