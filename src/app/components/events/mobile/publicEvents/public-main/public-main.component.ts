import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PostService} from '../../../../../services/post.service';
import {Subscription} from 'rxjs';
import {PubEventMobile} from '../../../../../models/PubEventMobile.model';

@Component({
  selector: 'app-public-main',
  templateUrl: './public-main.component.html',
  styleUrls: ['./public-main.component.sass']
})
export class PublicMainComponent implements OnInit, OnDestroy {
  eventId: number;
  eventData: PubEventMobile;
  errorPage: boolean = false;
  routeSub: Subscription;
  postSub: Subscription;
  // TODO
  eventFinish: boolean = false;
  isReverted: boolean;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.params
      .subscribe((question) => {
        let data = {
          id: Number(question.id)
        };
        this.eventId = Number(question.id);
        this.getDataFromServer(data);
      });
  }

  getDataFromServer(data) {
    this.postSub = this.postService.post('publicEvents/get_by_id', data)
      .subscribe((x: PubEventMobile) => {
        if (x.finalAnswer !== null) {
          this.eventFinish = true;
        }

        if (x.status.includes('reverted')) {
          this.isReverted = true;
        }

        this.eventData = x;
        this.errorPage = false;
      }, (err) => {
        console.log(err);
        this.errorPage = true;
      });
  }

  interacDone(data) {
    let x = {
      id: Number(data)
    };
    this.getDataFromServer(x);
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }

}
