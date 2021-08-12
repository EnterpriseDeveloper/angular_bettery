import {Injectable} from '@angular/core';

import socketIo from 'socket.io-client';
import {observable, Observable} from 'rxjs';
import { CommentModel } from '../model/сomment.model';
import {environment} from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentSocketService {
  url = environment.apiUrl;

  private socket;

  constructor() {
    this.socket = socketIo(this.url);
  }

  send(eventId: number, userId: number, comment: string) {
    this.socket.emit('create comment', {eventId, userId, comment});
  }

  newComment(): Observable<CommentModel[]> {
    return new Observable<CommentModel[]>(observer => {
      this.socket.on('receive comments', comment => {
        if (typeof comment === 'string') {
          console.error(comment);
        } else {
          observer.next(comment);
        }
      });
    });
  }

  newReply(eventId, userId, commentId, comment) {
    const reply = {
      eventId: Number(eventId),
      userId: Number(userId),
      commentId: Number(commentId),
      comment: String(comment)
    };
    this.socket.emit('reply', reply);
  }

  gettingComments(eventID: number) {
    this.socket.emit('get comments', Number(eventID));
  }

  sendSelectedIcon(type: string, eventId: number, userId: number, commentId: number) {
    this.socket.emit('activities', {type, eventId, userId, commentId});
  }

  doTyping(eventID: number, text: string) {
    const data = {
      eventId: Number(eventID),
      text: String(text)
    };
    this.socket.emit('typing in', data);
  }

  getTyping(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('typing out', msg => {
        observer.next(msg);
      });
    });
  }
}
