import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {GetService} from "../../../services/get.service";
import {LOGIN} from "@toruslabs/torus-direct-web-sdk";
import {ReferralsUsersModel} from "../../../models/ReferralsUsers.model";
import {InvitedUser} from "../../../models/InvitedUser";

@Component({
  selector: 'my-referrals',
  templateUrl: './my-referrals.component.html',
  styleUrls: ['./my-referrals.component.sass']
})
export class MyReferralsComponent implements OnInit, OnChanges {
  @Input() userData
  refData: ReferralsUsersModel
  invitedUsers: InvitedUser[]

  constructor(private getService: GetService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.userData.currentValue !== undefined) {
      if (this.userData) {
        this.getService.get('user/ref_info').subscribe((value: ReferralsUsersModel) => {

          let newArr  = value.usersInvited.map((x) => {
            if (x.invited) {
              return {
                opened: false,...x,
               invited: [...x.invited.map(value1 => {
                  if (value1.invited) {
                    return {
                      opened: false,
                      ...value1
                    }
                  }
                  return {...value1}

                })]
              }
            }
            return x
          }) as InvitedUser[]
          console.log(newArr);
          this.refData = value
          this.invitedUsers = newArr
          console.log(this.refData)
        })
      }
    }
  }

}
