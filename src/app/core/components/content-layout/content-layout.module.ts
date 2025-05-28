import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentLayoutComponent } from './content-layout.component';

@NgModule({
  declarations: [
    ContentLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ContentLayoutComponent
  ]
})
export class ContentLayoutModule { } 