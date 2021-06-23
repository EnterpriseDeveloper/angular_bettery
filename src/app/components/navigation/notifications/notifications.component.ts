import { Component, Input, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostService } from '../../../services/post.service';
import _ from 'lodash';
import {NotificationModel} from "../../../models/Notification.model";
import {SessionStorageService} from '../../rooms/sessionStorage-service/session-storage.service';
import {GetService} from '../../../services/get.service';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.sass']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @Input() userId: number;

  notifSub: Subscription;
  readSub: Subscription;
  deleteNotifSub: Subscription;
  notifData: NotificationModel[];
  colocol: boolean;
  navbar = false;

  constructor(
    private postService: PostService,
    private getService: GetService,
    private eRef: ElementRef,
    private sessionStorageService: SessionStorageService
  ) { }

  @HostListener('document:click', ['$event'])
  public clickout() {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.navbar = false;
    }
  }

  ngOnInit(): void {
    this.getDataFromDb();
  }

  getDataFromDb() {
    this.notifSub = this.getService.get('notification/get_by_user_id').subscribe((x: NotificationModel[]) => {
      this.notifData = x;
      let index = _.findIndex(x, (o) => { return o.read == false });
      this.colocol = index == -1 ? false : true;
    }, (err) => {
      console.log(err);
    })
  }

  sendRead(id, eventId) {
    this.sessionStorageService.eventId = eventId;
    this.sendReadToDb([id]);
  }

  sendReadAll() {
    let id = []
    this.notifData.forEach((x: any) => {
      if (!x.read) {
        id.push(x.id);
      }
    })
    this.sendReadToDb(id);
  }

  sendReadToDb(id) {
    let data = {
      id: id,
    }

    this.readSub = this.postService.post("notification/read", data).subscribe((x) => {
      this.getDataFromDb();
    }, (err) => {
      console.log(err);
    })
  }

  clearAll() {
    let id = []
    this.notifData.forEach((x: any) => {
      id.push(x.id);
    })
    let data = {
      id: id,
    }

    this.deleteNotifSub = this.postService.post("notification/delete", data).subscribe((x) => {
      this.getDataFromDb();
    }, (err) => {
      console.log(err);
    })

  }

  unreadNotif() {
    let data = _.filter(this.notifData, (o) => { return o.read == false });
    return data.length;
  }

  toggleNavbar() {
    this.navbar = !this.navbar;
  }

  timeCreating(time) {
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
      "July", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    let d = new Date(Number(time) * 1000)
    return `${d.getDate()} ${monthNames[Number(d.getMonth())]} ${d.getFullYear()}`
  }

  getBackgrond(data) {
    if (!data.read) {
      return { "background": "#FFFCEB" }
    } else {
      return { "background": "#ffffff" }
    }
  }



  ngOnDestroy() {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
    if (this.readSub) {
      this.readSub.unsubscribe();
    }
    if (this.deleteNotifSub) {
      this.deleteNotifSub.unsubscribe();
    }
  }
}
