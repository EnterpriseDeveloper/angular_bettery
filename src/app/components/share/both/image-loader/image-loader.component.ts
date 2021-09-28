import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import GradientJSON from '../../../../../files/gradients.json';
import {FormGroup} from '@angular/forms';
import {TuiImageEditorComponent} from 'tui-image-editor-angular';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.sass']
})
export class ImageLoaderComponent implements OnInit {
  @Output() imgEmmit = new EventEmitter<any>();
  @Output() colorEmmit = new EventEmitter<any>();
  @Output() isImgEditOpened = new EventEmitter<boolean>();
  @Input() form: FormGroup;
  @Input() formData;
  @Input() f;
  @Input() mobile;
  @ViewChild(TuiImageEditorComponent) editorComponent: TuiImageEditorComponent;
  gradietnNumber = 0;
  eventColor: string;
  loaderImg: boolean;
  @ViewChild('fileInput') fileInput: ElementRef;
  previewUrlImg;
  file;
  fileTooLarge: boolean;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  closeCropeWIndow = false;
  customizeModalShow = false;

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

  openCustomize() {
    console.log(this.customizeModalShow)
    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'image', {type: 'image/png'});
        this.resize(file);
        this.readerInit(false);
        this.closeCropeWIndow = true;
      });
    this.customizeModalShow = true;
    console.log(this.customizeModalShow)
    setTimeout(() => {
      const element = document.getElementsByClassName('tie-btn-draw')[0] as HTMLElement;
      console.log(element);
      element.click();
    }, 100);
  }

  imageCroped(event) {
    this.croppedImage = event.base64;
  }

  imageCropSubmit() {
    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'image', {type: 'image/png'});
        this.file = file;
        this.readerInit(false);
        this.closeCropeWIndow = true;
        this.isImgEditOpened.emit(false);
      });

  }

  click() {
    const dataUrl = this.editorComponent.imageEditor.toDataURL();
    console.log(dataUrl);
    fetch(dataUrl).then(res => {
      return res.blob();
    }).then(blob => {
      console.log(this.file.type);
      this.file = (new File([blob], 'image', {type: 'image/png'}));
      this.readerInit(false);

      this.closeCropeWIndow = true;
      this.customizeModalShow = false;
      this.isImgEditOpened.emit(false);


      // const link = document.createElement('a');
      // link.href = window.URL.createObjectURL(blob);
      // link.target = '_blank';
      // link.click();
    });

  }

  resize(file) {

    const url = URL.createObjectURL(file);

    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    // @ts-ignore
    // let canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = url;
    img.onload = () => {

      // set size proportional to image

      canvas.width = 1080;
      canvas.height = 1080;

      // step 1 - resize to 50%
      const oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

      oc.width = 1080;
      oc.height = 1080;

      octx.drawImage(img, 0, 0, oc.width, oc.height);
      //
      // // step 2

      octx.drawImage(oc, 0, 0, oc.width, oc.height);
      //
      // // step 3, resize to final size

      ctx.drawImage(oc, 0, 0, oc.width, oc.height,
        0, 0, canvas.width, canvas.height);

      const resizedUrl = (canvas.toDataURL('image/jpeg'));

      fetch(resizedUrl).then(res => {
        return res.blob();
      }).then(blob => {
        this.file = (new File([blob], 'image', {type: 'image/png'}));

        this.croppedImage = resizedUrl;
        this.readerInit(false);
      });

    };

    img.src = url;
  }

  cancel() {
    this.file = undefined;
    this.closeCropeWIndow = true;
    this.customizeModalShow = false;
    this.previewUrlImg = '';
    this.isImgEditOpened.emit(false);
  }

  loaderImgOpen(e) {
    if (e.target.classList.contains('trashRed') || e.target.classList.contains('trashWhite')) {
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
    this.isImgEditOpened.emit(true);
    this.closeCropeWIndow = false;
    this.imageChangedEvent = $event;

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
      this.imgEmmit.emit({img: this.previewUrlImg, valid});
    };
    if (this.file) {
      reader.readAsDataURL(this.file);
    }
  }

  resetImgandColor() {
    this.fileTooLarge = false;
    this.loaderImg = false;

    this.previewUrlImg = undefined;
    this.imgEmmit.emit({img: this.previewUrlImg, valid: false});

    this.eventColor = this.formData.roomColor;
    this.colorEmmit.emit(this.eventColor);
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
