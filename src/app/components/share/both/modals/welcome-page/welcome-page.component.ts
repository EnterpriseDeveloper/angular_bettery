import {Component, HostListener, OnDestroy} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { PostService } from '../../../../../services/post.service';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.sass']
})
export class WelcomePageComponent implements OnDestroy {
  postSub: Subscription
  userData = undefined;
  constructor(
    public activeModal: NgbActiveModal,
    public postService: PostService
  ) {
    let refId: any = sessionStorage.getItem('bettery_ref');
    if (refId !== null) {
      if (!isNaN(refId)) {
        let data = {
          id: refId
        }
        this.postSub = this.postService.post("user/getUserById", data).subscribe((x) => {
          this.userData = x[0];
          sessionStorage.removeItem('bettery_ref');
        }, (err) => {
          console.log(err)
        })
      } else {
        sessionStorage.removeItem('bettery_ref');
      }
    }

  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.close();
  }

  ngOnDestroy() {
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }

}
