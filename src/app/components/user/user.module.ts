import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import {FormsModule} from '@angular/forms';
import { MyReferralsComponent } from './my-referrals/my-referrals.component';
import { ReferralComponent } from './my-referrals/referral/referral.component';
import { MyPayoutsComponent } from './my-payouts/my-payouts.component';



@NgModule({
    declarations: [
        ProfileComponent,
        MyProfileComponent,
        MyReferralsComponent,
        ReferralComponent,
        MyPayoutsComponent
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
