import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SpinnerLoadingComponent} from './both/spinners/spinner-loading/spinner-loading.component';
import {InfoModalComponent} from './both/modals/info-modal/info-modal.component';
import {WelcomePageComponent} from './both/modals/welcome-page/welcome-page.component';
import {CommentComponent} from './both/comment/comment.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TimeAgoPipe} from './both/comment/pipe/time-ago.pipe';
import {NgxPageScrollModule} from 'ngx-page-scroll';
import {MetaMaskModalComponent} from './desktop/meta-mask-modal/meta-mask-modal.component';
import {ErrorLimitModalComponent} from './both/modals/error-limit-modal/error-limit-modal.component';
import {QuizTemplateComponent} from './desktop/quiz-template/quiz-template.component';
import {TimeComponent} from './both/time/time.component';
import {QuizErrorsComponent} from './desktop/quiz-template/quiz-errors/quiz-errors.component';
import {RouterModule} from '@angular/router';
import {QuizInfoComponent} from './desktop/quiz-template/quiz-info/quiz-info.component';
import {QuizChooseRoleComponent} from './desktop/quiz-template/quiz-choose-role/quiz-choose-role.component';
import {QuizActionComponent} from './desktop/quiz-template/quiz-action/quiz-action.component';
import {QuizEventFinishComponent} from './desktop/quiz-template/quiz-event-finish/quiz-event-finish.component';
import {ComingSoonComponent} from './desktop/coming-soon/coming-soon.component';
import {JustANoteModalComponent} from './mobile/just-note-modal/just-anote-modal.component';
import {SpinnerLoadMoreComponent} from './both/spinners/spinner-load-more/spinner-load-more.component';
import {MobilePlugPageComponent} from './desktop/mobile-plug-page/mobile-plug-page.component';
import {ImageLoaderComponent} from './both/image-loader/image-loader.component';
import {TextareaComponent} from './mobile/textarea/textarea.component';
import {SearchBarComponent} from './desktop/search-bar/search-bar.component';
import {SearchBarMobileComponent} from './mobile/search-bar-mobile/search-bar-mobile.component';
import {FilterTimelineComponent} from './desktop/filterTimeline/filterTimeline.component';
import {FilterTimeLineMobileComponent} from './mobile/filter-time-line-mobile/filter-time-line-mobile.component';
import {ComingSoonMobileComponent} from './mobile/coming-soon-mobile/coming-soon-mobile.component';
import {TuiImageEditorModule} from 'tui-image-editor-angular';
import {ImageCropperModule} from 'ngx-image-cropper';


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
    MobilePlugPageComponent,
    ImageLoaderComponent,
    MobilePlugPageComponent,
    TextareaComponent,
    SearchBarComponent,
    SearchBarMobileComponent,
    FilterTimelineComponent,
    FilterTimeLineMobileComponent,
    ComingSoonMobileComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxPageScrollModule,
    TuiImageEditorModule,
    ImageCropperModule,
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
    MobilePlugPageComponent,
    ImageLoaderComponent,
    TextareaComponent,
    SearchBarComponent,
    SearchBarMobileComponent,
    FilterTimelineComponent,
    FilterTimeLineMobileComponent,
    ComingSoonMobileComponent
  ]
})

export class ShareModule {
}
