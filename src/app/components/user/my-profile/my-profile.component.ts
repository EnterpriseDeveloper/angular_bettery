import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../../models/User.model';

@Component({
  selector: 'my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.sass']
})
export class MyProfileComponent implements OnInit {
  @Input() userData: User = undefined;
  location = ["Decentralized"];
  language = ["All"];

  constructor() {}

  ngOnInit(): void {
  }

}
