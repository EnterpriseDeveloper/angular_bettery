import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {PostService} from '../../../services/post.service';
import {Payouts} from '../../../models/Payouts.model';
import {Subscription} from 'rxjs';
import {PayoutEvent} from '../../../models/PayoutEvent.model';

@Component({
  selector: 'app-my-payouts',
  templateUrl: './my-payouts.component.html',
  styleUrls: ['./my-payouts.component.sass']
})
export class MyPayoutsComponent implements OnInit, OnDestroy, OnChanges {
  payouts: Payouts;
  payoutsSub: Subscription;
  currentPage = 1;
  @Input() userData;


  constructor(private postService: PostService) {
  }

  ngOnInit(): void {
    this.getPayouts();
  }

  getPayouts(from= 0, to = 5) {
    if (this.userData) {
      this.payoutsSub = this.postService.post('user/ref_list', {
        from,
        to
      }).subscribe((value: Payouts) => {
        this.payouts = value;
        // value.data.forEach(value => {
        //   for (let i = 0 ; i<5;i++){
        //     this.payouts.data.push(value);
        //   }
        // })

        console.log(this.payouts);
      });
    }
  }

  myReferralsCalculate(payout: PayoutEvent) {
    let myReferrals = 0;
    payout.parcipiantsAnswer.forEach(value => {
      value.byMyRef && myReferrals++;
    });
    return myReferrals;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.userData.currentValue !== undefined) {
      if (changes.userData.previousValue?._id !== changes.userData.currentValue?._id) {
        this.payouts = undefined;
        this.getPayouts();
      }
      this.getPayouts();
    }
  }
  goToPage(i){
    this.currentPage = i ;
    this.getPayouts(i * 5, (i * 5) - 5);
  }
  ngOnDestroy() {
    if (this.payoutsSub) {
      this.payoutsSub.unsubscribe();
    }
  }
}
