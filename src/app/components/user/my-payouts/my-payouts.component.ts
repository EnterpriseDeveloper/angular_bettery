import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {PostService} from '../../../services/post.service';
import {Payouts} from '../../../models/Payouts.model';
import {Subscription} from 'rxjs';
import {PayoutEvent} from '../../../models/PayoutEvent.model';
import {GetService} from '../../../services/get.service';
import {ReferralsUsersModel} from '../../../models/ReferralsUsers.model';

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
  getSub: Subscription;
  payoutLevels = {lvl1: [], lvl2: [], lvl3: []};


  constructor(private postService: PostService, private getService: GetService) {
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
        this.pagesArr = [];
        this.calcPages();
      }, error => {
        console.log('from ref list', error);
      });
      this.getSub = this.getService.get('user/ref_info').subscribe((value: ReferralsUsersModel) => {
        this.payoutLevels = {lvl1: [], lvl2: [], lvl3: []};
        if (value.usersInvited) {
          value.usersInvited.forEach(value => {
            this.payoutLevels.lvl1.push(value._id);

            if (value.invited) {
              value.invited.forEach(value1 => {
                this.payoutLevels.lvl2.push(value1._id);

                if (value1.invited) {
                  value1.invited.forEach(value2 => {
                    this.payoutLevels.lvl3.push(value2._id);
                  });
                }
              });
            }

          });
        }
      }, error => {
        console.log('from get ref info payouts', error);
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
    if (i <= 1) {
      i = 1;
    }
    this.currentPage = i;

    if (i <= this.pagesArr.length) {

      this.getPayouts((i * 5) - 5, i * 5);
    }
    this.pagesArr = [];
    this.calcPages(i);
  }

  allPages() {
    if (this.payouts) {
      return Math.ceil(this.payouts.eventsAmount / 5);
    }
  }

  calcPages(i = 1) {
    this.pagesToShow = [];

    if (this.payouts) {
      for (let i = 1; i <= this.allPages(); i++) {
        this.pagesArr.push(i);
      }

      if (this.pagesArr.length < 5) {
        this.pagesToShow = this.pagesArr as [];
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

      if (this.pagesArr.length > 5) {
        this.pagesToShow = this.pagesArr.slice(0, 4) as [];
        return this.pagesToShow;
      }
    }

  }

  checkIsNumberInteger(str = 0) {
    return str.toString().includes('.') ? str.toFixed(2) : str;
  }

  checkRefLevel(payout: PayoutEvent) {
    let sum = 0;
    if (payout.parcipiantsAnswer) {
      payout.parcipiantsAnswer.forEach((value) => {

        if (this.payoutLevels.lvl1.includes(value.from._id)) {
          if (value.refAmount1) {

            sum += +value?.refAmount1;
          }
        }

        if (this.payoutLevels.lvl2.includes(value.from._id)) {
          if (value.refAmount2) {
            sum += +value?.refAmount2;
          }

        }

        if (this.payoutLevels.lvl3.includes(value.from._id)) {
          if (value.refAmount3) {
            sum += +value?.refAmount3;
          }
        }
      });
    }
    return this.checkIsNumberInteger(sum);
  }

  ngOnDestroy() {
    if (this.payoutsSub) {
      this.payoutsSub.unsubscribe();
    }

    if (this.getSub) {
      this.getSub.unsubscribe();
    }
  }
}
