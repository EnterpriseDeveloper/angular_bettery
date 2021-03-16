import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'events-template-new',
  templateUrl: './events-template-new.component.html',
  styleUrls: ['./events-template-new.component.sass']
})
export class EventsTemplateNewComponent implements OnInit {
@Input() whichEvent;
  constructor() { }

  ngOnInit(): void {
  }

  getCircleOneStyle() {
    if (this.whichEvent === 'setQuestion') {
      return {'background-color': '#FFD300'};
    } else {
      return {'background-color': '#FFFFFF'};
    }
  }

  getNumberOneStyle() {
    if (this.whichEvent === 'setQuestion') {
      return {'color': '#FFFFFF'};
    } else {
      return {'color': '#FFD300'};
    }
  }

  getCircleTwoStyle() {
    if (this.whichEvent === 'setQuestion') {
      return {'background-color': '#3E3E3E'};
    } else if (this.whichEvent === 'createRoom') {
      return {'background-color': '#FFD300'};
    } else {
      return {'background-color': '#FFFFFF'};
    }
  }

  getNumberTwoStyle() {
    if (this.whichEvent === 'setQuestion') {
      return {'color': '#7D7D7D'};
    } else if (this.whichEvent === 'createRoom') {
      return {'color': '#FFFFFF'};
    } else {
      return {'color': '#FFD300'};
    }
  }

  getCircleThreeStyle() {
    if (this.whichEvent === 'makeRules') {
      return {'background-color': '#FFD300'};
    } else {
      return {'background-color': '#3E3E3E'};
    }
  }

  getNumberThreeStyle() {
    if (this.whichEvent === 'makeRules') {
      return {'color': '#FFFFFF'};
    } else {
      return {'color': '#7D7D7D'};
    }
  }

  vectorStyle() {
    if (this.whichEvent != 'setQuestion') {
      return {'border-color': '#FFD300'};
    } else {
      return {'border-color': '#FFFFFF'};
    }
  }

}
