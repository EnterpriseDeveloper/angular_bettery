import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {InvitedUser} from "../../../../models/InvitedUser";

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.sass']
})
export class ReferralComponent implements OnInit, OnDestroy {

  @Input() invitedUsers:InvitedUser[]
  userReferrals:number
  constructor() {
  }

  ngOnInit(): void {

  }

  toggle(i,k=undefined,z=undefined) {
    if(z == "lvl1"){
      console.log(111)
      this.invitedUsers[i].opened =!this.invitedUsers[i].opened;
    }else if(z== "lvl2"){
      console.log(222)
      this.invitedUsers[i].invited[k].opened =!this.invitedUsers[i].invited[k]?.opened;
    }
  }


  ngOnDestroy() {
  }
}
