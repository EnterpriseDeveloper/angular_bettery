import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {GetService} from "../../../services/get.service";
import {ReferralsUsersModel} from "../../../models/ReferralsUsers.model";
import {InvitedUser} from "../../../models/InvitedUser";
import {Subscription} from "rxjs";

@Component({
  selector: 'my-referrals',
  templateUrl: './my-referrals.component.html',
  styleUrls: ['./my-referrals.component.sass']
})
export class MyReferralsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userData
  refData: ReferralsUsersModel
  invitedUsers: InvitedUser[]
  refDataSub: Subscription

  constructor(private getService: GetService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.userData.currentValue !== undefined) {
      if (this.userData) {
        this.refDataSub = this.getService.get('user/ref_info').subscribe((value: ReferralsUsersModel) => {
          if (value.usersInvited) {
            this.invitedUsers = value.usersInvited.map((x) => {
              return {
                opened: false,
                ...x,
                invited: x.invited ? x.invited.map(value1 => {
                  return {
                    opened: false,
                    ...value1
                  }
                }) : [],
                thirdLvlRefs: x.invited ? x.invited.reduce((previousValue, currentValue) => {
                  if (currentValue.invited) {
                    return previousValue += currentValue.invited.length
                  }
                  return previousValue
                }, 0) : 0,
              }
            }) as InvitedUser[];
            console.log(this.invitedUsers)
            this.refData = value;
          }

        })
      }
    }

  }

  ngOnDestroy() {
    if (this.refDataSub) {
      this.refDataSub.unsubscribe()
    }
  }

}
