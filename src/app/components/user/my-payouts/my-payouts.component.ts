import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostService} from "../../../services/post.service";
import {Payouts} from "../../../models/Payouts.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-my-payouts',
  templateUrl: './my-payouts.component.html',
  styleUrls: ['./my-payouts.component.sass']
})
export class MyPayoutsComponent implements OnInit , OnDestroy{
  payouts: Payouts;
  payoutsSub: Subscription;

  constructor(private postService: PostService) {
  }

  ngOnInit(): void {
    this.getPayouts();
  }

  getPayouts() {
   this.payoutsSub = this.postService.post('user/ref_list', {
      from: 0,
      to: 5
    }).subscribe((value: Payouts) => {
      this.payouts = value;
      console.log(this.payouts);
    });
  }
  ngOnDestroy() {
    // this.payoutsSub.unsubscribe();
  }
}
