import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerLoadingComponent } from './spinner-loading/spinner-loading.component';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { CommentComponent } from './comment/comment.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TimeAgoPipe } from './comment/pipe/time-ago.pipe';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { MetaMaskModalComponent } from './meta-mask-modal/meta-mask-modal.component';
import { ErrorLimitModalComponent } from './error-limit-modal/error-limit-modal.component';
import { QuizTemplateComponent } from './quiz-template/quiz-template.component';
import { TimeComponent } from './quiz-template/time/time.component';
import { QuizErrorsComponent } from './quiz-template/quiz-errors/quiz-errors.component';
import { RouterModule } from '@angular/router';
import { QuizInfoComponent } from './quiz-template/quiz-info/quiz-info.component';
import { QuizChooseRoleComponent } from './quiz-template/quiz-choose-role/quiz-choose-role.component';
import { QuizActionComponent } from './quiz-template/quiz-action/quiz-action.component';
import { QuizEventFinishComponent } from './quiz-template/quiz-event-finish/quiz-event-finish.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { JustANoteModalComponent } from './just-note-modal/just-anote-modal.component';
import { SpinnerLoadMoreComponent } from './spinner-load-more/spinner-load-more.component';
import { MobilePlugPageComponent } from './mobile-plug-page/mobile-plug-page.component';



@NgModule({
  declarations: [
    SpinnerLoadingComponent,
    InfoModalComponent,
    WelcomePageComponent,
    CommentComponent,
    TimeAgoPipe,
    MetaMaskModalComponent,
    ErrorLimitModalComponent,
    QuizTemplateComponent,
    TimeComponent,
    QuizErrorsComponent,
    QuizInfoComponent,
    QuizChooseRoleComponent,
    QuizActionComponent,
    QuizEventFinishComponent,
    ComingSoonComponent,
    JustANoteModalComponent,
    SpinnerLoadMoreComponent,
    MobilePlugPageComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        NgxPageScrollModule,
        RouterModule.forChild([
            {path: 'host', component: ComingSoonComponent},
            {path: 'my-events', component: ComingSoonComponent},
            {path: 'achievements', component: ComingSoonComponent},
            {path: 'friends', component: ComingSoonComponent},
            {path: 'help', component: ComingSoonComponent},
        ]),
        ReactiveFormsModule,
    ],
    exports: [
        SpinnerLoadMoreComponent,
        SpinnerLoadingComponent,
        CommentComponent,
        QuizTemplateComponent,
        TimeComponent,
        JustANoteModalComponent,
        MobilePlugPageComponent
    ]
})

export class ShareModule {
}
