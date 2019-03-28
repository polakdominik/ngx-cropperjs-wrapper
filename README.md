# Angular Cropper.js wrapper

This angular library is a wrapper of Javascript image cropper

## Getting Started

### Installing

1. Install package
```
npm install ngx-cropper-js-wrapper
```
2. Import module
```
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxCropperJsModule } from 'ngx-cropperjs-wrapper';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // Import this library
    NgxCropperJsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
## Usage example

### DEMO: Pass image from file input into cropper and get cropped image
Markup
```
<h1>Angular cropperjs demo</h1>
<input type="file" (change)="onFilePick($event)"/>
<lib-cropper [imageFile]="fileInput" [options]="options" (fail)="onFail($event)" (fileChange)="onFileChange($event)"></lib-cropper>
```
Component
```
import { Component } from '@angular/core';
import { CropperOptions } from 'ngx-cropperjs-wrapper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public fileInput: File = null;

  // Config for cropper.js (see official cropper.js repo for complete list of available options)
  public options = {
    minCropWidth: 750, // Implemented in wrapper (not supported in cropper.js)
    minCropHeight: 750, // Implemented in wrapper (not supported in cropper.js)
    movable: false,
    scalable: false,
    zoomable: false,
    viewMode: 3,
    aspectRatio: 1,
  } as CropperOptions;

  onFilePick(event: any) {
    // Feed selected file to cropper
    this.fileInput = event.target.files.item(0);
  }

  onFail(error) {
    console.error(error);
  }

  onFileChange(file: File) {
    // TODO: upload file to backend
  }

}
```
### Example with ngModel
```
<h1>Angular cropperjs demo</h1>
<input type="file" (change)="onFilePick($event)"/>
<lib-cropper [imageFile]="upload" [options]="options" [(ngModel)]="data" name="cropper"></lib-cropper>
<p>{{ data | json }}</p>
```
### Events
* This wrapper supports all events cropper.js emits
* You can bind to these events the Angular way
* Example of some cropper.js events:
```
<lib-cropper (ready)="onReady($event)" (crop)="onCrop($event)" (zoom)="onZoom($event)">
```
This wrapper also has few events on its own
* (init) emits instance of cropper.js after it's initialized
* (fileChange) emits cropped image as `File`
* (fail) emits error when library fails to initialize for example if you pass invalid input
### Access cropper.js
If you need more functionality than this wrapper provides you can still access cropper.js directly.
```
<lib-cropper [imageFile]="fileInput" (init)="onCropperInit($event)">
```
Init handler
```
onCropperInit(cropper: Cropper) {
  // cropper is cropper.js instance
}
```

## Additional features of this wrapper
* Option to set minimum width and height of cropped image
* File input
* File output
* Basic validation for minimum image dimensions and invalid file input

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to cropper.js creator Chen Fengyuan
