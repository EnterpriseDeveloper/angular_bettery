import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavbarComponent} from './navbar/navbar.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {RouterModule} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ShareModule} from '../share/share.module';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReferalsComponent } from './referals/referals.component';
import { ChainTransferComponent } from './chainTransfer/chainTransfer.component';
import { SwapBetComponent } from './swap-bet/swap-bet.component';
import {DownBarComponentMobile} from './down-bar-mobile/down-bar.component';


@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    NotificationsComponent,
    ReferalsComponent,
    ChainTransferComponent,
    SwapBetComponent,
    DownBarComponentMobile
  ],
    exports: [
        NavbarComponent,
        SidebarComponent,
        ReferalsComponent,
        DownBarComponentMobile
    ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ShareModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'ref/:id', component: ReferalsComponent },

    ]),
  ]
})
export class NavigationModule { }
