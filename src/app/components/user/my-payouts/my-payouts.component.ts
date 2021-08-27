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
  pagesArr = [];
  pagesToShow: [];
  @Input() userData;


  constructor(private postService: PostService) {
  }

  ngOnInit(): void {
    this.getPayouts();

  }

  getPayouts(from = 0, to = 5) {
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
        this.pagesArr = [];
        this.calcPages();
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

  goToPage(i) {
    if (i <= 1){
      i = 1;
    }
    if (i <= this.pagesArr.length){

      this.getPayouts((i * 5) - 5, i * 5);
    }
    this.pagesArr = [];
    this.calcPages(i);
  }

  allPages() {
    if (this.payouts) {
      return Math.ceil(this.payouts.eventsAmount / 5);
      //  return  10;
    }
    console.log(this.pagesToShow);
  }

  calcPages(i= 1 ) {
    this.pagesToShow = [] ;

    if (this.payouts) {
      for (let i = 1; i <= this.allPages(); i++) {
        this.pagesArr.push(i);
      }
      // for (let i = 1; i <= 10; i++ ){
      //   this.pagesArr.push(i);
      // }
      if (this.pagesArr.length < 5) {
        console.log(this.currentPage);
        this.pagesToShow = this.pagesArr as [];
        console.log(this.pagesToShow, 'pagestoshow');
        return;
      }
      if (i <= 1) {
        this.currentPage = 1;
        this.pagesToShow = this.pagesArr as [];
        return;
      }
      if (i >= this.pagesArr.length) {
        this.currentPage = this.pagesArr.length;
        this.pagesToShow = [...this.pagesArr.slice(i - 4, i)] as [];
        return;
      }
      this.currentPage = i;

      if (this.pagesArr.length > 5 && this.currentPage !== 1 && this.currentPage !== this.pagesArr.length) {
        this.pagesToShow = [...this.pagesArr.slice(i - 2, i + 2)] as [];
      }
      if (this.currentPage === this.pagesArr.length - 3) {
        this.pagesToShow = [...this.pagesArr.slice(i - 4, i)] as [];
      }
      console.log(this.pagesToShow, 'pagestoshow');
      if (this.pagesArr.length > 5 ) {
        this.pagesToShow = this.pagesArr.slice(0, 4) as [];

        return this.pagesToShow;
      }
    }

  }

  ngOnDestroy() {
    if (this.payoutsSub) {
      this.payoutsSub.unsubscribe();
    }
  }
}
