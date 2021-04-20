import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventsTemplatesDesktopComponent } from './events-templates-desktop/events-templates-desktop.component';
import { SetQuestionDesktopComponent } from './set-question-desktop/set-question-desktop.component';
import {ShareModule} from "../../share/share.module";
import { CreateRoomDesktopComponent } from './create-room-desktop/create-room-desktop.component';
import { MakeRulesDesktopComponent } from './make-rules-desktop/make-rules-desktop.component';
import { PublicEventDesktopComponent } from './public-event-desktop/public-event-desktop.component';
import { PrivateEventDesktopComponent } from './private-event-desktop/private-event-desktop.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    ShareModule,
    RouterModule,
  ],
    declarations: [
      EventsTemplatesDesktopComponent,
      SetQuestionDesktopComponent,
      CreateRoomDesktopComponent,
      MakeRulesDesktopComponent,
      PublicEventDesktopComponent,
      PrivateEventDesktopComponent,
    ]
})
export class CreateEventDesktopModule { }
