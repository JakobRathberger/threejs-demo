import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SchoolComponent } from './school/school.component';

import {MatButtonModule} from "@angular/material/button";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const MaterialComponents = [
  MatButtonModule
]

@NgModule({
  declarations: [
    AppComponent,
    SchoolComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    NoopAnimationsModule
  ],
  exports: [MaterialComponents],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

@NgModule({
  imports: [MaterialComponents],
  exports: [MaterialComponents]
})
export class MaterialModule { }
