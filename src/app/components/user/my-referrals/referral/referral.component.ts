import {Component, Input, OnInit} from '@angular/core';
import {InvitedUser} from '../../../../models/InvitedUser';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.sass']
})
export class ReferralComponent implements OnInit {

  @Input() invitedUsers: InvitedUser[];
  constructor() {
  }

  ngOnInit(): void {
  }

  toggle(i, k , z ) {
    if (z === 'lvl1'){
      this.invitedUsers[i].opened = !this.invitedUsers[i].opened;
    }else if (z === 'lvl2'){
      this.invitedUsers[i].invited[k].opened = !this.invitedUsers[i].invited[k]?.opened;
    }
  }
}
