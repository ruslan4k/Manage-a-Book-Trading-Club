import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

import { baseURL } from './baseurl';

import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

interface AuthResponse {
  status: string,
  success: string,
};


@Injectable()
export class AuthService {

  username: Subject<string> = new Subject<string>();
  username2: String;
  id: String = undefined;

  constructor(private http: HttpClient,
    private router: Router) {
  }

  sendUsername(name: string) {
    this.username.next(name);
  }

  clearUsername() {
    this.username.next(undefined);
  }

  signUp(user: any): Observable<any> {
    return this.http.post(baseURL + 'signup',
      { "username": user.username, "password": user.password, "email": user.email }, { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  }

  logIn(user: any): Observable<any> {
    return this.http.post<AuthResponse>(baseURL + 'login',
      { "username": user.username, "password": user.password }, { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  }


  logOut(): Observable<any> {
    return this.http.get<AuthResponse>(baseURL + 'logout', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  }

  getUsername(): Observable<string> {
    return this.username.asObservable();
  }

  getUsernInfo(): Observable<any> {
    return this.http.get(baseURL + 'userInfo', { withCredentials: true })
      .catch(error => {
        if (error.status == 403) {
          alert('Please, log in or sign up');
          this.setUsername(undefined);
          return this.router.navigate(['/login']);
        }
        return Observable.throw(error.error.status);
      });
  }


  updateInfo(info): Observable<any> {
    return this.http.post(baseURL + 'userInfo', info, { withCredentials: true })
      .catch(error => {
        if (error.status == 403) {
          alert('Please, log in or sign up');
          this.setUsername(undefined);
          return this.router.navigate(['/login']);
        }
        return Observable.throw(error.error.status);
      });
  }


  fetchUsername(): Observable<any> {
    return this.http.get(baseURL + 'username', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  }

  setUsername(name: string) {
    this.sendUsername(name);
    this.username2 = name;
  }

}


