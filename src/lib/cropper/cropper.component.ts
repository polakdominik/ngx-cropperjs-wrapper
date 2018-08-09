import { Component, EventEmitter, Input, OnDestroy, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Cropper from 'cropperjs';

export interface CropperOptions extends Cropper.Options {
  minCropWidth: number;
  minCropHeight: number;
}

@Component({
  selector: 'lib-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CropperComponent),
      multi: true
    }
  ],
})
export class CropperComponent implements OnDestroy, ControlValueAccessor {

  @Output() crop = new EventEmitter<CustomEvent>();
  @Output() cropMove = new EventEmitter<CustomEvent>();
  @Output() cropStart = new EventEmitter<CustomEvent>();
  @Output() cropEnd = new EventEmitter<CustomEvent>();
  @Output() ready = new EventEmitter<CustomEvent>();
  @Output() zoom = new EventEmitter<CustomEvent>();
  @Output() init = new EventEmitter<Cropper>();
  @Output() fail = new EventEmitter<Error>();
  @Output() fileChange = new EventEmitter<File>();

  @Input() options = {} as CropperOptions;

  get imageFile(): File {
    return this.originalFile;
  }

  @Input('imageFile') set imageFile(value: File) {
    delete this.dataUrl;
    this.destroyCropperIfExists();

    if (!value) {
      return;
    }

    if (['image/gif', 'image/jpeg', 'image/png'].indexOf(value.type) === -1) {
      this.fail.emit(new Error('Invalid input file type'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.dataUrl = reader.result;
    };

    this.originalFile = value;
    reader.readAsDataURL(this.originalFile);
  }

  @Input('imageUrl') set imageUrl(value: string) {
    delete this.dataUrl;
    this.destroyCropperIfExists();

    if (!value) {
      return;
    }

    this.dataUrl = value;
  }

  dataUrl: string;
  private cropper: Cropper;
  private isReady: boolean;
  private originalFile: File;
  private data = {} as Cropper.SetDataOptions;

  propagateChange = (value: Cropper.SetDataOptions) => {};

  writeValue(value: Cropper.SetDataOptions) {
    this.data = value;

    if (this.data && this.cropper) {
      this.cropper.setData(this.data);
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  ngOnDestroy() {
    this.destroyCropperIfExists();
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;

    this.destroyCropperIfExists();

    if ((this.options.minCropWidth && img.naturalWidth < this.options.minCropWidth)
      || (this.options.minCropHeight && img.naturalHeight < this.options.minCropHeight)) {
      delete this.dataUrl;
      this.fail.emit(new Error('Input image is too small'));
      return;
    }

    this.isReady = false;
    this.cropper = new Cropper(img, Object.assign({
      crop: this.onCrop.bind(this),
      cropmove: this.onCropMove.bind(this),
      cropstart: this.onCropStart.bind(this),
      cropend: this.onCropEnd.bind(this),
      ready: this.onReady.bind(this),
      zoom: this.onZoom.bind(this),
    }, this.options));

    this.init.emit(this.cropper);
  }

  private onCrop(event: CustomEvent) {
    if (this.options.viewMode !== 0) {
      this.correctCropArea();
    }

    if (this.isReady) {
      this.update();
    }

    this.crop.emit(event);
  }

  private onCropMove(event: CustomEvent) {
    if (this.options.viewMode === 0) {
      this.correctCropArea();
    }

    this.update();
    this.cropMove.emit(event);
  }

  private onCropStart(event: CustomEvent) {
    this.update();
    this.cropStart.emit(event);
  }

  private onCropEnd(event: CustomEvent) {
    this.correctCropArea();
    this.updateFile();
    this.update();
    this.cropEnd.emit(event);
  }

  private onReady(event: CustomEvent) {
    if (this.data) {
      this.cropper.setData(this.data);
      this.correctCropArea();
    } else {
      this.correctCropArea();
      this.update();
    }

    this.isReady = true;
    this.ready.emit(event);
    this.updateFile();
  }

  private onZoom(event: CustomEvent) {
    this.update();
    this.zoom.emit(event);
  }

  private updateFile() {
    const urlParams = this.dataUrl.split('/');

    this.cropper.getCroppedCanvas().toBlob((blob: any) => {
      blob.lastModifiedDate = new Date();
      blob.name = this.originalFile ? this.originalFile.name : urlParams[urlParams.length - 1];
      this.fileChange.emit(blob);
    });
  }

  private correctCropArea() {
    const data = this.cropper.getData();

    if (data.height < this.options.minCropHeight || data.width < this.options.minCropWidth) {
      data.width = Math.max(data.width, this.options.minCropWidth || 0);
      data.height = Math.max(data.height, this.options.minCropHeight || 0);
      this.cropper.setData(data);
    }
  }

  private update() {
    this.data = this.cropper.getData();
    this.propagateChange(this.data);
  }

  private destroyCropperIfExists() {
    if (!this.cropper) {
      return;
    }

    this.cropper.destroy();
    delete this.cropper;
  }

}
