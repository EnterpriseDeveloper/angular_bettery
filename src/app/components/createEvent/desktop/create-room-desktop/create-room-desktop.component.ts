import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import GradientJSON from '../../../../../assets/gradients.json';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../../share/info-modal/info-modal.component'
import { PostService } from '../../../../services/post.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import _ from "lodash";

@Component({
  selector: 'create-room-desktop',
  templateUrl: './create-room-desktop.component.html',
  styleUrls: ['./create-room-desktop.component.sass']
})
export class CreateRoomDesktopComponent implements OnInit, OnDestroy {
  @Input() formData;
  @Output() goBack = new EventEmitter<Object[]>();
  @Output() goNext = new EventEmitter<Object[]>();

  submitted: boolean = false;
  roomForm: FormGroup;
  existRoom: FormGroup;
  createRoomForm: FormGroup;
  gradietnNumber: number = 0;
  postSubscribe: Subscription
  userSub: Subscription
  postValidation: Subscription
  allRooms: any;
  roomError: string;
  userId

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private postService: PostService,
    private store: Store<AppState>,
  ) {
  }

  ngOnInit(): void {
    this.createRoomForm = this.formBuilder.group({
      createNewRoom: this.formData.whichRoom
    })
    this.roomForm = this.formBuilder.group({
      roomName: [this.formData.roomName, Validators.required],
      roomColor: [this.formData.roomColor, Validators.required],
      eventType: this.formData.eventType
    })
    this.existRoom = this.formBuilder.group({
      roomId: [this.formData.roomId, Validators.required]
    })

    this.userSub = this.store.select("user").subscribe((x) => {
      if (x.length != 0) {
        this.userId = x[0]._id;
        this.getUserRooms(this.userId)
      }
    });
  }

  getUserRooms(id) {
    let data = {
      id: id
    }
    this.postSubscribe = this.postService.post('room/get_by_user_id', data).subscribe((x: any) => {
      if (x.length !== 0 && this.formData.roomName == '') {
        this.createRoomForm.controls.createNewRoom.setValue("exist");
      }
      this.allRooms = x
    }, (err) => {
      console.log(err)
    })
  }

  get r() { return this.createRoomForm.controls; }
  get f() { return this.roomForm.controls; }
  get e() { return this.existRoom.controls; }


  generateGradient() {
    this.gradietnNumber == Number(Object.keys(GradientJSON).length) - 1 ? this.gradietnNumber = 0 : this.gradietnNumber++;
    this.roomForm.controls.roomColor.setValue(GradientJSON[this.gradietnNumber]);
  }

  // TO DO
  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = "- Event for Friends is private and they can bet with anything like pizza or promise of a favor. The result will be validated by one Expert, which can be the Host or another friend.";
    modalRef.componentInstance.name1 = "Event for Social Media is for betting with online communities using BTY tokens. The result will be validated by several Experts to ensure fairness.";
    modalRef.componentInstance.boldName = 'Friends vs Social Media';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  chooseRoom() {
    this.submitted = true;
    if (this.existRoom.invalid) {
      return;
    }
    let searchRoom = _.find(this.allRooms, (x) => { return x.id == this.existRoom.value.roomId })
    let roomType = searchRoom.privateEventsId.length == 0 ? "public" : "private"
    this.roomForm.controls.eventType.setValue(roomType)
    this.roomForm.controls.roomName.setValue(searchRoom.name)
    let data = {
      ...this.roomForm.value,
      ...this.createRoomForm.value,
      ...this.existRoom.value
    };
    this.goNext.next(data);
  }

  createRoom() {
    this.submitted = true;
    if (this.roomForm.invalid) {
      return;
    }
    let x = {
      name: this.roomForm.value.roomName,
      userId: this.userId
    }
    this.postValidation = this.postService.post("room/validation", x).subscribe((z) => {
      this.roomError = undefined;
      let data = {
        ...this.roomForm.value,
        ...this.createRoomForm.value,
        ...this.existRoom.value
      };
      this.goNext.next(data);
    }, (err) => {
      console.log(err);
      this.roomError = err.message;
    })
  }

  cancel() {
    let data = {
      ...this.roomForm.value,
      ...this.createRoomForm.value,
      ...this.existRoom.value
    };
    this.goBack.next(data)
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe()
    };
    if (this.postSubscribe) {
      this.postSubscribe.unsubscribe();
    }
  }
}

