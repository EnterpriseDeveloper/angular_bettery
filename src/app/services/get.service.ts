
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class GetService {

  constructor(private http: HttpClient) { }

  url = environment.production ? 'https://api.bettery.io' : 'https://13.229.200.135';
  //url = "http://localhost:80"

  get(path: string) {
    return this.http.get(`${this.url}/${path}`);
  }

}
