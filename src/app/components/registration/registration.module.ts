import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShareModule } from '../share/share.module';
import { RouterModule } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { AuthComponent } from './auth/auth.component';
import { SeedPhraseModalComponent } from './auth/seed-phrase-modal/seed-phrase-modal.component';


@NgModule({
  declarations: [
    RegistrationComponent,
    AuthComponent,
    SeedPhraseModalComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    NgbModule,
    FormsModule,
    ShareModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'auth', component: AuthComponent }]),
  ]

})
export class RegistrationModule {}
