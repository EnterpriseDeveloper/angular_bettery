import {Pipe, PipeTransform, NgZone} from '@angular/core';
import {Observable} from 'rxjs';
import {Observer} from 'rxjs';

interface ProcessOutput {
  text: string;
  timeToUpdate: number;
}

@Pipe({
  name: 'timeAgo',
  pure: true
})
export class TimeAgoPipe implements PipeTransform {

  constructor(private ngZone: NgZone) {
  }

  private process = (timestamp: number): ProcessOutput => {
    let text: string;
    let timeToUpdate: number;

    const now = new Date();


    const timeAgo: number = now.getTime() - (timestamp * 1000);

    const seconds = timeAgo / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const months = days / 30.416;
    const years = days / 365;

    if (seconds <= 10) {
      text = 'just now';
    } else if (seconds <= 45) {
      text = 'a few seconds ago';
    } else if (seconds <= 90) {
      text = '1m ago';
    } else if (minutes <= 50) {
      text = Math.round(minutes) + ' m';
    } else if (hours <= 1.5) {
      text = '1h';
    } else if (hours <= 22) {
      text = Math.round(hours) + ' h ago';
    } else if (hours <= 36) {
      text = '1 day';
    } else if (days <= 25) {
      text = Math.round(days) + ' d ago';
    } else if (months <= 1.5) {
      text = '1 month ago';
    } else if (months <= 11.5) {
      text = Math.round(months) + ' months ago';
    } else if (years <= 1.5) {
      text = 'a year ago';
    } else {
      text = Math.round(years) + ' years ago';
    }

    if (minutes < 1) {
      // update every 2 secs
      timeToUpdate = 2 * 1000;
    } else if (hours < 1) {
      // update every 30 secs
      timeToUpdate = 30 * 1000;
    } else if (days < 1) {
      // update every 5 mins
      timeToUpdate = 300 * 1000;
    } else {
      // update every hour
      timeToUpdate = 3600 * 1000;
    }

    return {
      text,
      timeToUpdate
    };
  }

  public transform = (value: string | Date): Observable<string> => {
    let d: Date;
    if (value instanceof Date) {
      d = value;
    } else {
      d = new Date(value);
    }

    const timestamp = d.getTime();

    let timeoutID: any;

    return Observable.create((observer: Observer<string>) => {
      let latestText = '';

      const registerUpdate = () => {
        const processOutput = this.process(timestamp);
        if (processOutput.text !== latestText) {
          latestText = processOutput.text;
          this.ngZone.run(() => {
            observer.next(latestText);
          });
        }
        timeoutID = setTimeout(registerUpdate, processOutput.timeToUpdate);
      };

      this.ngZone.runOutsideAngular(registerUpdate);

      const teardownFunction = () => {
        if (timeoutID) {
          clearTimeout(timeoutID);
        }
      };
      return teardownFunction;
    });
  }
}
