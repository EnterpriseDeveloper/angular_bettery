import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {GetService} from '../../../services/get.service';
import {ReferralsUsersModel} from '../../../models/ReferralsUsers.model';
import {InvitedUser} from '../../../models/InvitedUser';
import {Subscription} from 'rxjs';
import {ClipboardService} from 'ngx-clipboard';

@Component({
  selector: 'my-referrals',
  templateUrl: './my-referrals.component.html',
  styleUrls: ['./my-referrals.component.sass']
})
export class MyReferralsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userData;
  refData: ReferralsUsersModel;
  invitedUsers: InvitedUser[];
  refDataSub: Subscription;
  copyLinkFlag: boolean;

  constructor(private getService: GetService, private _clipboardService: ClipboardService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.userData.currentValue !== undefined) {
        if (changes.userData.previousValue?._id !== changes.userData.currentValue?._id) {
          this.refData = undefined;
          this.invitedUsers = undefined;
          this.getRefData();
        }
        this.getRefData();
    }
  }

  ngOnDestroy() {
    if (this.refDataSub) {
      this.refDataSub.unsubscribe();
    }
  }

  getRefData() {
    if (this.userData) {
      this.refDataSub = this.getService.get('user/ref_info').subscribe((value: ReferralsUsersModel) => {
        if (value.usersInvited) {
          this.invitedUsers = value.usersInvited.map((x, z) => {
            return {
              opened: z !== 0,
              ...x,
              invited: x.invited ? x.invited.map(value1 => {
                return {
                  opened: z !== 0 ,
                  ...value1
                };
              }) : [],
              thirdLvlRefs: x.invited ? x.invited.reduce((previousValue, currentValue) => {
                if (currentValue.invited) {
                  return previousValue += currentValue.invited.length;
                }
                return previousValue;
              }, 0) : 0,
            };
          }) as InvitedUser[];
          this.refData = value;
        }
      });
    }
  }
  copyRefLink() {
    this.copyLinkFlag = true;
    const href = window.location.hostname;
    const path = href === 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/ref/${this.userData._id}`);
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
  }
}
