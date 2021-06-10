import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../../models/User.model';
import { PostService } from "../../../services/post.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationComponent } from '../../registration/registration.component';

@Component({
  selector: 'my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.sass']
})
export class MyProfileComponent implements OnChanges, OnDestroy {
  getAddUserDataSub: Subscription
  @Input() userData: User = undefined;
  location = ["Decentralized"];
  language = ["All"];
  addionalData = undefined;

  constructor(
    private postService: PostService,
    private modalService: NgbModal,
  ) { }


  ngOnChanges(changes) {
    if (changes['userData'].currentValue) {
      let id = changes['userData'].currentValue._id;
      this.getAddUserDataSub = this.postService.post('user/get_additional_info', { id: id }).subscribe((x) => {
        console.log(x);
        this.addionalData = x;
      }, (err) => {
        console.log("from get additional data", err)
      })
    }
  }

  getIcon(icon) {
    return {
      "background": `url("../../../../assets/profile/${icon}.png") center center no-repeat`,
      "background-size": "contain",
      "width": "20px",
      "height": "20px",
      "margin-right": "7px"
    }
  }

  linkAccount() {
    const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
    modalRef.componentInstance.openSpinner = true;
    modalRef.componentInstance.linkUser = true;
    modalRef.componentInstance.linkedAccouns = this.addionalData.linkedAccounts;
    modalRef.componentInstance.linkedDone.subscribe((e) => {
      console.log(e);
    })
  }

  ngOnDestroy() {
    if (this.getAddUserDataSub) {
      this.getAddUserDataSub.unsubscribe();
    }
  }

}
