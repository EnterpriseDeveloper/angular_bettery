import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavbarComponent} from './navbar/navbar.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {RouterModule} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ShareModule} from '../share/share.module';
import { TimelineComponent } from './timeline/timeline.component';


@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    TimelineComponent
  ],
    exports: [
        NavbarComponent,
        SidebarComponent,
        TimelineComponent
    ],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    FormsModule,
    FontAwesomeModule,
    ShareModule,
    ReactiveFormsModule
  ]
})
export class NavigationModule { }
