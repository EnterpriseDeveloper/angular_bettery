import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.sass']
})
export class TimeComponent implements OnInit {

  @Input() public timer: any;

  day;
  hour: any;
  minutes: any;
  seconds: any;
  future: any;
  oneDay = 24 * 60 * 60 * 1000;
  oneHours = 60 * 60 * 1000;

  statusTime;


  ngOnInit() {
    this.calculateDate();
  }

  calculateDate() {
    let startDate = new Date();

    let endTime = new Date(this.timer * 1000);
    var diffMs = (endTime.getTime() - startDate.getTime());
    this.day = Math.floor(Math.abs(diffMs / 86400000));
    let hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    let minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    let second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.hour = Number(hour) > 9 ? hour : '0' + hour;
    this.minutes = Number(minutes) > 9 ? minutes : '0' + minutes;
    if (second === 60) {
      this.seconds = '00';
    } else {
      this.seconds = second > 9 ? second : '0' + second;

    }

    if (startDate < endTime && (diffMs) >= this.day) {
      this.future = 'Ending in';
      this.statusTime = 'green';
    }

    if (startDate < endTime && (diffMs) < 86400000) {
      this.future = 'Ending in';
      this.statusTime = 'yellow';
    }

    if (startDate < endTime && diffMs < 3600000) {
      this.future = 'Ending in';
      this.statusTime = 'red';
    }

    if (startDate > endTime) {
      this.future = 'validated';
      this.statusTime = 'end';
    }


    setTimeout(() => {
      this.calculateDate();
    }, 1000);
  }

  styleTime(arg) {
    let result;
    switch (arg) {
      case 'green':
        result = {'color': '#23AE00'};
        break;
      case 'yellow':
        result = {'color': '#FFD300'};
        break;
      case 'red':
        result = {'color': '#FF3232'};
        break;
      default:
        break;
    }
    return result;
  }
}
