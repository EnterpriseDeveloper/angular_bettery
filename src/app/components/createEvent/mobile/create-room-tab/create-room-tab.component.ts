import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import GradientJSON from '../../../../../assets/gradients.json';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InfoModalComponent} from '../../../share/info-modal/info-modal.component'
import {PostService} from '../../../../services/post.service';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import _ from 'lodash';
import {RoomModel} from '../../../../models/Room.model';
import {User} from '../../../../models/User.model';
import {formDataAction} from "../../../../actions/newEvent.actions";
import {Router} from "@angular/router";

@Component({
  selector: 'create-room-tab',
  templateUrl: './create-room-tab.component.html',
  styleUrls: ['./create-room-tab.component.sass']
})
export class CreateRoomTabComponent implements OnInit, OnDestroy {
  formData;
  submitted: boolean = false;
  roomForm: FormGroup;
  existRoom: FormGroup;
  createRoomForm: FormGroup;
  gradietnNumber: number = 0;
  postSubscribe: Subscription;
  userSub: Subscription;
  postValidation: Subscription;
  fromDataSubscribe: Subscription;
  allRooms: RoomModel[];
  roomError: string;
  userId: number;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private postService: PostService,
    private store: Store<AppState>,
    private router: Router,
  ) {
    this.fromDataSubscribe = this.store.select('createEvent').subscribe(x => {
      this.formData = x?.formData;
    });
  }

  ngOnInit(): void {
    this.createRoomForm = this.formBuilder.group({
      createNewRoom: this.formData.whichRoom
    })
    this.roomForm = this.formBuilder.group({
      roomName: [this.formData.roomName, Validators.required],
      roomColor: [this.formData.roomColor, Validators.required],
      eventType: this.formData.eventType
    });
    this.existRoom = this.formBuilder.group({
      roomId: [this.formData.roomId, Validators.required]
    });

    this.userSub = this.store.select("user").subscribe((x: User[]) => {
      if (x && x?.length != 0) {
        this.userId = x[0]._id;
        this.getUserRooms(this.userId)
      }
    });
  }

  getUserRooms(id) {
    let data = {
      id: id
    };
    this.postSubscribe = this.postService.post('room/get_by_user_id', data).subscribe((x: RoomModel[]) => {
      if (x?.length !== 0 && this.formData.roomName == '') {
        this.createRoomForm.controls.createNewRoom.setValue("exist");
      }
      this.allRooms = x;
    }, (err) => {
      console.log(err);
    });
  }

  get r() {
    return this.createRoomForm.controls;
  }

  get f() {
    return this.roomForm.controls;
  }

  get e() {
    return this.existRoom.controls;
  }


  generateGradient() {
    this.gradietnNumber == Number(Object.keys(GradientJSON).length) - 1 ? this.gradietnNumber = 0 : this.gradietnNumber++;
    this.roomForm.controls.roomColor.setValue(GradientJSON[this.gradietnNumber]);
  }

  // TO DO
  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, {centered: true});
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
    let searchRoom = _.find(this.allRooms, (x) => {
      return x.id == this.existRoom.value.roomId
    })
    let roomType = searchRoom.privateEventsId.length == 0 ? "public" : "private"
    this.roomForm.controls.eventType.setValue(roomType)
    this.roomForm.controls.roomName.setValue(searchRoom.name)
    let data = {
      ...this.roomForm.value,
      ...this.createRoomForm.value,
      ...this.existRoom.value
    };
    this.formData.whichRoom = data.createNewRoom;
    this.formData.roomName = data.roomName;
    this.formData.roomColor = data.roomColor;
    this.formData.eventType = data.eventType;
    this.formData.roomId = data.roomId;

    this.store.dispatch(formDataAction({formData: this.formData}));
    this.router.navigate(['/make-rules']);
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
      this.formData.whichRoom = data.createNewRoom;
      this.formData.roomName = data.roomName;
      this.formData.roomColor = data.roomColor;
      this.formData.eventType = data.eventType;
      this.formData.roomId = data.roomId;

      this.store.dispatch(formDataAction({formData: this.formData}));
      this.router.navigate(['/make-rules']);
    }, (err) => {
      console.log(err);
      this.roomError = err.message;
    })
  }

  cancel() {
    const data = {
      ...this.roomForm.value,
      ...this.createRoomForm.value,
      ...this.existRoom.value
    };
    this.formData.whichRoom = data.createNewRoom;
    this.formData.roomName = data.roomName;
    this.formData.roomColor = data.roomColor;
    this.formData.eventType = data.eventType;

    this.store.dispatch(formDataAction({formData: this.formData}));
    this.router.navigate(['/create-event']);
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.postSubscribe) {
      this.postSubscribe.unsubscribe();
    }
    if (this.fromDataSubscribe) {
      this.fromDataSubscribe.unsubscribe();
    }
  }
}
