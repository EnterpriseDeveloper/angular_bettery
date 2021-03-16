import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SetQuestionTabComponent } from './set-question-tab/set-question-tab.component';
import { CreateRoomTabComponent } from './create-room-tab/create-room-tab.component';
import { MakeRulesTabComponent } from './make-rules-tab/make-rules-tab.component';
import { PrivateEventComponent } from './private-event/private-event.component';
import { PublicEventComponent } from './public-event/public-event.component';
import { AvatarModule } from 'ngx-avatar';
import {ShareModule} from "../../share/share.module";
import { EventsTemplateNewComponent } from './events-template-new/events-template-new.component';
import {AuthGuard} from "./guards/auth.guard";


@NgModule({
    imports: [
        AvatarModule,
        CommonModule,
        BrowserModule,
        FontAwesomeModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            {path: 'create-event', component: SetQuestionTabComponent},
            {path: 'create-room', component: CreateRoomTabComponent, canActivate: [AuthGuard]},
            {path: 'make-rules', component: MakeRulesTabComponent, canActivate: [AuthGuard]},
            {path: 'create-private-event', component: PrivateEventComponent, canActivate: [AuthGuard]},
            {path: 'create-public-event', component: PublicEventComponent, canActivate: [AuthGuard]},
        ]),
        ShareModule,
    ],
    declarations: [
        SetQuestionTabComponent,
        CreateRoomTabComponent,
        MakeRulesTabComponent,
        PrivateEventComponent,
        PublicEventComponent,
        EventsTemplateNewComponent
    ]
})
export class CreateEventMobileModule { }
