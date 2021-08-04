import { NgModule } from '@angular/core';
import { MobileEventsModule } from './mobile/mobileEvents.module';
import { DesktopEventsModule } from './desktop/desktopEvents.module';





@NgModule({
    imports: [
        MobileEventsModule,
        DesktopEventsModule,
    ],
})
export class EventsModule { }
