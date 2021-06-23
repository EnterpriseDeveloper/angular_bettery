import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import {FormsModule} from '@angular/forms';



@NgModule({
    declarations: [
        ProfileComponent,
        MyProfileComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: 'profile', component: ProfileComponent },
        ]),
        FormsModule,
    ],
})

export class UserModule { }
