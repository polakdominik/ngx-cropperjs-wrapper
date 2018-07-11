import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import Cropper from 'cropperjs';

export interface CropperOptions extends Cropper.Options {
  minCropWidth: number;
  minCropHeight: number;
}

@Component({
  selector: 'lib-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss']
})
export class CropperComponent implements OnDestroy {

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

  dataUrl: string;
  private cropper: Cropper;
  private originalFile: File;

  ngOnDestroy() {
    this.destroyCropperIfExists();
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;

    this.destroyCropperIfExists();

    if ((this.options.minCropWidth && img.naturalWidth < this.options.minCropWidth)
      || (this.options.minCropHeight && img.naturalHeight < this.options.minCropHeight)) {
      delete this.dataUrl;
      this.fail.emit(new Error('Input image is too small'));
      return;
    }

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

    this.crop.emit(event);
  }

  private onCropMove(event: CustomEvent) {
    if (this.options.viewMode === 0) {
      this.correctCropArea();
    }

    this.cropMove.emit(event);
  }

  private onCropStart(event: CustomEvent) {
    this.cropStart.emit(event);
  }

  private onCropEnd(event: CustomEvent) {
    this.correctCropArea();
    this.updateFile();
    this.cropEnd.emit(event);
  }

  private onReady(event: CustomEvent) {
    this.correctCropArea();
    this.ready.emit(event);
    this.updateFile();
  }

  private onZoom(event: CustomEvent) {
    this.zoom.emit(event);
  }

  private updateFile() {
    this.cropper.getCroppedCanvas().toBlob((blob: any) => {
      blob.lastModifiedDate = new Date();
      blob.name = this.originalFile.name;
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

  private destroyCropperIfExists() {
    if (!this.cropper) {
      return;
    }

    this.cropper.destroy();
    delete this.cropper;
  }

}
