import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { baseURL } from './baseurl';

import { Observable } from 'rxjs/Observable';

import { AuthService } from '../services/auth.service';

import { Router } from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class BookService {

  constructor(private http: HttpClient,
    private authService: AuthService,
    private router: Router) { }

  addBook(book): Observable<any> {
    return this.http.post(baseURL + 'book', { book: book }, { withCredentials: true })
      .catch(error => {
        if (error.status == 403) {
          alert('Please, log in or sign up')
          this.authService.setUsername(undefined);
          return this.router.navigate(['/login']);
        }
        return Observable.throw(error.error.status);
      });
  };

  getBooks(): Observable<any> {
    return this.http.get(baseURL + 'books', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  };

  getMyBooks(): Observable<any> {
    return this.http.get(baseURL + 'mybooks', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  };

  getRequestedBooks(): Observable<any> {
    return this.http.get(baseURL + 'pendingBooks', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  };

  getApprovedOutgoing(): Observable<any> {
    return this.http.get(baseURL + 'approvedOutgoingBooks', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  };

  getIncomingRequested(): Observable<any> {
    return this.http.get(baseURL + 'toApproveBooks', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  };

  getApprovedIncoming(): Observable<any> {
    return this.http.get(baseURL + 'approvedBooks', { withCredentials: true })
      .catch(error => {
        return Observable.throw(error.error.status);
      });
  };

  approveTrade(id): Observable<any> {
    return this.http.post(baseURL + 'approveTrade/', { id: id }, { withCredentials: true })
      .catch(error => {
        if (error.status == 403) {
          alert('Please, log in or sign up')
          this.authService.setUsername(undefined);
          return this.router.navigate(['/login']);
        }
        return Observable.throw(error.error.status);
      });
  };



  deleteBook(id): Observable<any> {
    return this.http.delete(baseURL + 'book/' + id, { withCredentials: true })
      .catch(error => {
        if (error.status == 403) {
          alert('Please, log in or sign up')
          this.authService.setUsername(undefined);
          return this.router.navigate(['/login']);
        }
        return Observable.throw(error.error.status);
      });
  };

  requestBook(id): Observable<any> {
    return this.http.get(baseURL + 'book/' + id, { withCredentials: true })
      .catch(error => {
        if (error.status == 403) {
          alert('Please, log in or sign up')
          this.authService.setUsername(undefined);
          return this.router.navigate(['/login']);
        }
        return Observable.throw(error.error.status);
      });
  };

  removeRequest(id) {
    return this.http.post(baseURL + 'remove_request', { id: id }, { withCredentials: true })
      .catch(error => {
        if (error.status == 403) {

          this.authService.setUsername(undefined);
          return this.router.navigate(['/login']);
        }
        return Observable.throw(error.error.status);
      });

  }

}
