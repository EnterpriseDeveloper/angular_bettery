import {Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import GradientJSON from '../../../../../assets/gradients.json';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InfoModalComponent} from '../../../share/modals/info-modal/info-modal.component';
import {PostService} from '../../../../services/post.service';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import _ from 'lodash';
import {RoomModel} from '../../../../models/Room.model';
import {User} from '../../../../models/User.model';
import {GetService} from '../../../../services/get.service';

@Component({
  selector: 'create-room-desktop',
  templateUrl: './create-room-desktop.component.html',
  styleUrls: ['./create-room-desktop.component.sass']
})
export class CreateRoomDesktopComponent implements OnInit, OnDestroy {
  @Input() formData;
  @Output() goBack = new EventEmitter<Object[]>();
  @Output() goNext = new EventEmitter<Object[]>();
  @ViewChild('textarea') textarea: ElementRef;
  isLimit: boolean;

  submitted: boolean = false;
  roomForm: FormGroup;
  existRoom: FormGroup;
  createRoomForm: FormGroup;
  gradietnNumber: number = 0;
  postSubscribe: Subscription;
  userSub: Subscription;
  postValidation: Subscription;
  allRooms: RoomModel[];
  roomError: string;
  userId: number;
  nickName: string;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private postService: PostService,
    private getService: GetService,
    private store: Store<AppState>,
  ) {
  }

  ngOnInit(): void {
    this.createRoomForm = this.formBuilder.group({
      createNewRoom: this.formData.whichRoom
    });
    this.roomForm = this.formBuilder.group({
      roomName: [this.formData.roomName, Validators.compose([Validators.required, Validators.maxLength(32)])],
      roomColor: [this.formData.roomColor, Validators.required],
      eventType: this.formData.eventType
    });
    this.existRoom = this.formBuilder.group({
      roomId: [this.formData.roomId, Validators.required]
    });

    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userId = x[0]._id;
        this.nickName = x[0].nickName.split(' ')[0];
        if (this.r.createNewRoom.value == 'new' &&  this.formData.roomName.length == 0) {
          this.f.roomName.setValue(this.nickName + '’s room');
        }
        this.getUserRooms();
      }
    });
  }

  getUserRooms() {
    this.postSubscribe = this.getService.get('room/get_by_user_id').subscribe((x: RoomModel[]) => {
      if (x.length !== 0 && this.formData.roomName == '') {
        this.createRoomForm.controls.createNewRoom.setValue('exist');
      }
      this.allRooms = x;
      this.setValueExist();
    }, (err) => {
      console.log(err);
    });
  }

  setValueExist(): void {
    if (this.r.createNewRoom.value === 'exist' && this.formData.roomId.length === 0) {
      this.existRoom.controls.roomId.setValue(this.allRooms[0].id);
    }
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
    modalRef.componentInstance.name = '- Event for Friends is private and they can bet with anything like pizza or promise of a favor. The result will be validated by one Expert, which can be the Host or another friend.';
    modalRef.componentInstance.name1 = 'Event for Social Media is for betting with online communities using BET tokens. The result will be validated by several Experts to ensure fairness.';
    modalRef.componentInstance.boldName = 'Friends vs Social Media';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  chooseRoom() {
    this.submitted = true;
    if (this.existRoom.invalid) {
      return;
    }
    let searchRoom = _.find(this.allRooms, (x) => {
      return x.id == this.existRoom.value.roomId;
    });
    let roomType = searchRoom.privateEventsId.length == 0 ? 'public' : 'private';
    this.roomForm.controls.eventType.setValue(roomType);
    this.roomForm.controls.roomName.setValue(searchRoom.name);
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
    };
    this.postValidation = this.postService.post('room/validation', x).subscribe((z) => {
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
    });
  }

  cancel() {
    let data = {
      ...this.roomForm.value,
      ...this.createRoomForm.value,
      ...this.existRoom.value
    };
    this.goBack.next(data);
  }

  letsSlice(control, start, finish) {
    return control.slice(start, finish);
  }

  limitError() {
    const length = this.f.roomName.value.length;
    this.isLimit = length >= 26;
  }

  colorError(length, numYel, numMain) {
    if (length >= numYel && length <= numMain) {
      return {
        'color': '#7d7d7d'
      };
    }
    if (length > numMain) {
      return {
        'font-weight': 'bold',
        'color': '#FF3232'
      };
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.postSubscribe) {
      this.postSubscribe.unsubscribe();
    }
  }
}

