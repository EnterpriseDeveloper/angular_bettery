
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class PostService {

  constructor(private http: HttpClient) { }

  url = environment.production ? 'https://api.bettery.io' : 'https://13.229.200.135';
  //url = "http://localhost:80"


  post(path: string, data: Object) {
    return this.http.post(`${this.url}/${path}`, data);
  }

}
