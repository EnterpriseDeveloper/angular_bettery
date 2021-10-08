import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {GetService} from '../../../services/get.service';
import {Subscription} from 'rxjs';
import {PostService} from '../../../services/post.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../app.state';
import {formDataAction} from '../../../actions/newEvent.actions';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RegistrationComponent} from '../../registration/registration/registration.component';
import {EventsTemplatesDesktopComponent} from '../../createEvent/desktop/events-templates-desktop/events-templates-desktop.component';
import {RoomModel} from '../../../models/Room.model';
import {User} from '../../../models/User.model';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.sass']
})
export class RoomsComponent implements OnInit, OnDestroy {
  roomsSub: Subscription;
  roomById: Subscription;
  eventById: Subscription;
  userSub: Subscription;
  joinedRoomSub: Subscription;

  allRooms: RoomModel[];
  roomsSort: RoomModel[];
  showLength = 8;
  startLength = 0;
  pageRoom = 1;
  activeRoom: number;
  userData: User;

  usersRoom: any;
  newCreateEvent = '';
  searchWord: string;

  forEventId: any;
  testAnimation: number;
  ALL_ROOM = 'show_all_room';
  JOINED_ROOM = 'joined_room';
  SHOW_USERS_ROOM = 'show_users_room';
  SEARCH = 'search';
  btnMiddleActive = 'show_all_room';
  showInputFlag: boolean;
  spinner: boolean;
  formData;
  formDataSub: Subscription;
  querySub: Subscription;
  isMobile: boolean;
  codeSearchWord: string;

  constructor(
    private getService: GetService,
    private postService: PostService,
    private store: Store<AppState>,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.mobileCheck();
  }

  ngOnInit(): void {
    this.queryParamInit();
  }

  queryParamInit() {
    this.querySub = this.route.queryParams.subscribe(
      (queryParam: any) => {
        if (Object.keys(queryParam).length === 0) {
          this.changeQuery(1, this.btnMiddleActive, null);
          this.pageRoom = 1;
          this.findCurrentUser();
        } else {
          this.pageRoom = +queryParam.page;
          this.btnMiddleActive = queryParam.sort;
          if (queryParam.search && queryParam.search.length){
            this.searchWord = decodeURI(queryParam.search);
            this.showInputFlag = true;
          }
          this.startLength = (this.pageRoom - 1) * 8;
          this.showLength = this.startLength + 8;
          this.findCurrentUser();
        }
      }
    );
  }

  changeQuery(num, sort, search) {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { page: num, sort: sort, search: search }, queryParamsHandling: 'merge'});
  }

  @HostListener('click', ['$event'])
  a($event) {
    if (!$event.target.classList.contains('search-img') && !$event.target.classList.contains('search-input')) {
      this.showInputFlag = false;
    }
  }

  getAllRoomsFromServer() {
    const path = 'room/get_all';
    this.roomsSub = this.getService.get(path).subscribe((rooms: RoomModel[]) => {
      this.allRooms = rooms;
      this.roomsSort = this.allRooms.slice(this.startLength, this.showLength);
      this.spinner = true;
      if (this.btnMiddleActive == this.SEARCH){
        this.letsFindRooms(null);
      }
    });
  }

  getUsersRoomById() {
    const path = 'room/get_by_user_id';

    this.roomById = this.getService.get(path).subscribe(list => {
      this.usersRoom = list;
      this.roomsSort = this.usersRoom.slice(this.startLength, this.showLength);
      this.spinner = true;
    });
  }

  getEventById(path, id) {
    this.eventById = this.postService.post(path, {id}).subscribe(ev => {
      this.forEventId = ev;
    });
  }

  prevRooms() {
    if (this.pageRoom <= 1) {
      return;
    }
    this.pageRoom = this.pageRoom - 1;
    this.startLength = this.startLength - 8;
    this.showLength = this.showLength - 8;
    if(this.btnMiddleActive != this.SEARCH){
      this.changeQuery(this.pageRoom, this.btnMiddleActive, null);
    }

    if (this.btnMiddleActive === this.SHOW_USERS_ROOM) {
      this.roomsSort = this.usersRoom.slice(this.startLength, this.showLength);
    } else {
      this.roomsSort = this.allRooms.slice(this.startLength, this.showLength);
    }
    this.activeRoom = null;
  }

  nextRooms() {
    if (this.pageRoom > Math.round(this.usersRoom?.length / 8) ||
      this.pageRoom > Math.round(this.allRooms?.length / 8) ||
      this.pageRoom > Math.round(this.roomsSort?.length / 8) && this.btnMiddleActive === this.SEARCH
    ) {
      return;
    }

    this.startLength = this.startLength + 8;
    this.showLength = this.showLength + 8;
    this.pageRoom = this.pageRoom + 1;
    if(this.btnMiddleActive != this.SEARCH){
      this.changeQuery(this.pageRoom, this.btnMiddleActive, null);
    }

    if (this.btnMiddleActive === this.SHOW_USERS_ROOM) {
      this.roomsSort = this.usersRoom.slice(this.startLength, this.showLength);

    } else {
      this.roomsSort = this.allRooms.slice(this.startLength, this.showLength);
    }
    this.activeRoom = null;
  }

  forLetsFindRoomsLength(currentList) {
    if (isNaN(Math.ceil(currentList / 8))) {
      return 1;
    } else {
      return Math.ceil(currentList / 8);
    }
  }

  letsFindRoomsLength() {
    if (this.btnMiddleActive === this.SHOW_USERS_ROOM) {
      return this.forLetsFindRoomsLength(this.usersRoom?.length);
    }

    if (this.btnMiddleActive === this.SEARCH && this.searchWord?.length <= 3) {
      return this.forLetsFindRoomsLength(this.allRooms?.length);
    }

    if (this.btnMiddleActive === this.SEARCH && this.searchWord?.length > 3) {
      return this.forLetsFindRoomsLength(this.roomsSort?.length);
    }

    if (!this.usersRoom) {
      return this.forLetsFindRoomsLength(this.allRooms?.length);
    } else if (this.roomsSort?.length > 0) {
      return Math.ceil(this.roomsSort?.length / 8);
    } else {
      return Math.ceil(this.usersRoom?.length / 8);
    }
  }

  activeCard(index) {
    if (this.activeRoom === index) {
      this.activeRoom = null;
      return;
    }

    if ((index === 4 || index === 5 || index === 6 || index === 7) && window.screen.width > 1199) {
      this.testAnimation = index;
    } else {
      this.testAnimation = null;
    }

    // animation test adapting , to do =================
    if ((index === 6 || index === 7 || index === this.roomsSort.length - 1) && window.screen.width <= 1199 && window.screen.width > 991) {
      this.testAnimation = index;
    }
    this.activeRoom = index;

    if (this.roomsSort[index].privateEventsId.length > 0) {
      this.getEventById('privateEvents/get_by_id', this.roomsSort[index].privateEventsId[0]._id);
    }

    if (this.roomsSort[this.activeRoom].publicEventsId.length > 0) {
      this.getEventById('publicEvents/get_by_id', this.roomsSort[index].publicEventsId[0]._id);
    }
  }

  findCurrentUser(): void {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length !== 0) {
        this.userData = x[0];
        if (this.btnMiddleActive === this.SHOW_USERS_ROOM) {
          this.getUsersRoomById();
        }
        if (this.btnMiddleActive === this.JOINED_ROOM) {
          this.getJoinedUsersRoomById();
        }
        if (this.btnMiddleActive === this.ALL_ROOM) {
          this.getAllRoomsFromServer();
        }
        if (this.btnMiddleActive === this.SEARCH) {
          this.getAllRoomsFromServer();
        }
      } else {
        this.userData = undefined;
        this.usersRoom = undefined;
        this.getAllRoomsFromServer();
        if (this.btnMiddleActive != this.SEARCH ){
          this.btnMiddleActive = this.ALL_ROOM;
        }
      }
    });
  }

  showUsersRoom() {
    this.searchWord = '';
    if (this.userData) {
      this.btnMiddleActive = this.SHOW_USERS_ROOM;
    }
    this.changeQuery(this.pageRoom, this.btnMiddleActive, null);
    this.activeRoom = undefined;
    this.spinner = false;
    this.pageRoom = 1;
    this.startLength = 0;
    this.showLength = 8;
    if (this.userData) {
      this.getUsersRoomById();
    } else {
      this.modalService.open(RegistrationComponent, {centered: true});
      this.spinner = true;
      return;
    }
  }

  showAllRooms() {
    this.searchWord = '';
    this.btnMiddleActive = this.ALL_ROOM;
    this.changeQuery(this.pageRoom, this.btnMiddleActive, null);

    if (this.allRooms == undefined) {
      this.getAllRoomsFromServer();
    }
    this.activeRoom = undefined;
    this.usersRoom = null;
    this.roomsSort = this.allRooms.slice(this.startLength, this.showLength);
  }

  sendNewEvent() {
    this.formDataSub = this.store.select('createEvent').subscribe(x => {
      this.formData = x.formData;
    });
    this.formData.question = this.newCreateEvent;
    if (this.formData?.question.length) {
      this.store.dispatch(formDataAction({formData: this.formData}));
      this.openCreateEventModal();
    } else {
      this.openCreateEventModal();
    }
    this.newCreateEvent = '';
  }

  showJoinedRoom() {
    this.searchWord = '';
    if (this.userData){
      this.btnMiddleActive = this.JOINED_ROOM;
    }
    this.changeQuery(this.pageRoom, this.btnMiddleActive, null);
    this.activeRoom = undefined;
    this.spinner = false;
    this.pageRoom = 1;
    this.startLength = 0;
    this.showLength = 8;
    if (this.userData) {
      this.getJoinedUsersRoomById();
    } else {
      this.modalService.open(RegistrationComponent, {centered: true});
      this.spinner = true;
      return;
    }
  }

  getJoinedUsersRoomById() {
    const path = 'room/joined';
    this.joinedRoomSub = this.getService.get(path).subscribe(list => {
      this.usersRoom = list;
      this.roomsSort = this.usersRoom.slice(this.startLength, this.showLength);
      this.spinner = true;
    });
  }

  showSearchInput() {
    if (this.btnMiddleActive !== this.ALL_ROOM) {
      this.showAllRooms();
    }
    this.showInputFlag = !this.showInputFlag;
    this.btnMiddleActive = this.SEARCH;
  }

  letsFindRooms(e) {
    let arr = [];
    this.pageRoom = 1;
    this.startLength = 0;
    this.showLength = 8;

    this.forLetsFindRoom(arr);

    if (e && e.code === 'Backspace') {
      this.roomsSort = this.allRooms.slice(this.startLength, this.showLength);

      this.forLetsFindRoom(arr);
      if (this.searchWord && this.searchWord?.length <= 3 && arr.length > 0) {
        this.letsFindRoomsLength();
      }
    }
  }

  forLetsFindRoom(arr) {
    if (this.searchWord && this.searchWord.length >= 3) {
      arr = this.allRooms.filter(o => {
        return o.name.toLowerCase().includes(this.searchWord.toLowerCase());
      });
      if (arr.length > 0) {
        this.roomsSort = arr.slice(this.startLength, this.showLength);
        this.codeSearchWord = encodeURIComponent(this.searchWord)
      }else {
        this.codeSearchWord = '';
      }
    }
  }

  forFilterBySubject() {
    if (this.roomsSort?.length > 0 && this.searchWord?.length >= 3) {
      return this.roomsSort?.length;
    } else if (this.btnMiddleActive === this.SHOW_USERS_ROOM || this.btnMiddleActive === this.JOINED_ROOM) {
      return this.usersRoom?.length;
    } else {
      return this.allRooms?.length;
    }
  }

  ngOnDestroy(): void {
    if (this.roomsSub) {
      this.roomsSub.unsubscribe();
    }

    if (this.roomById) {
      this.roomById.unsubscribe();
    }

    if (this.userSub) {
      this.userSub.unsubscribe();
    }

    if (this.eventById) {
      this.eventById.unsubscribe();
    }

    if (this.joinedRoomSub) {
      this.joinedRoomSub.unsubscribe();
    }

    if (this.formDataSub) {
      this.formDataSub.unsubscribe();
    }

    if (this.querySub){
      this.querySub.unsubscribe();
    }
  }

  openCreateEventModal() {
    this.modalService.open(EventsTemplatesDesktopComponent, {centered: true});
  }

  mobileCheck() {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)) {

      this.isMobile = true;
    }
  }
}
