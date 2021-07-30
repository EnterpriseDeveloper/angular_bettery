import {Component, DoCheck, HostListener, OnInit} from '@angular/core';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {EventsTemplatesDesktopComponent} from '../../../createEvent/desktop/events-templates-desktop/events-templates-desktop.component';

@Component({
  selector: 'app-down-bar',
  templateUrl: './down-bar.component.html',
  styleUrls: ['./down-bar.component.sass']
})
export class DownBarComponent implements OnInit,DoCheck {

  display: boolean;
  scrollTop: number;
  currentPath: string;

  constructor(
    private modalService: NgbModal,
    config: NgbModalConfig) {
    config.keyboard = false;
    config.backdrop = 'static';
  }

  ngOnInit(): void {
    this.detectPath();
  }

  ngDoCheck() {
    this.detectPath();
  }

  detectPath() {
    this.currentPath = window.location.pathname;
    if (this.currentPath === '/' || this.currentPath === '/tokensale' || this.currentPath.includes('create-event') || this.currentPath.includes('public_event') ||
      this.currentPath.includes('private_event') || this.currentPath == "/.well-known/pki-validation/fileauth.txt") {
      this.display = false;
    } else {
      this.display = true;
    }
  }

  detectPathForActive(str: string) {
    if (this.currentPath === '/' + str) {
      return true;
    } else {
      return false;
    }
  }

}
