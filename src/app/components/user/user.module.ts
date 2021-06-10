import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MyProfileComponent } from './my-profile/my-profile.component';



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
    ],
})

export class UserModule { }