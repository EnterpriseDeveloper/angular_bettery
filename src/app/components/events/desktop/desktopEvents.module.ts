import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EventFeedComponent} from './eventFeed/eventFeed.component';
import {SearchBarComponent} from './search-bar/search-bar.component';
import {ShareModule} from '../../share/share.module';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {NgxPageScrollModule} from 'ngx-page-scroll';
import {NavigationModule} from '../../navigation/navigation.module';
import {FilterTimelineComponent} from './filterTimeline/filterTimeline.component';


@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        InfiniteScrollModule,
        RouterModule.forChild([
            {path: 'join', component: EventFeedComponent}
        ]),
        ShareModule,
        NgxPageScrollModule,
        NavigationModule
    ],
  exports: [
    FilterTimelineComponent
  ],
  declarations: [
    EventFeedComponent,
    SearchBarComponent,
    FilterTimelineComponent
  ]
})
export class DesktopEventsModule {
}
