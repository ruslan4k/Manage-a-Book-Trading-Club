import { Component, OnInit } from '@angular/core';

import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-allbooks',
  templateUrl: './allbooks.component.html',
  styleUrls: ['./allbooks.component.scss']
})
export class AllbooksComponent implements OnInit {

  allBooks = [];
  requestedBooks = [];
  approvedOutgoingBooks = [];
  incomingRequestedBooks = [];
  approvedIncomingBooks = [];

  constructor(private bookService: BookService,
    private authService: AuthService) { }

  ngOnInit() {
    this.getBooks();
    this.getRequestedBooks();
    this.getApprovedIncoming();
    this.getIncomingRequested();
    this.getApprovedOutgoing();
  }


  getBooks() {
    this.bookService.getBooks()
      .subscribe(
        data => {
          this.allBooks = data;
          this.allBooks.reverse();
          console.log(this.allBooks);
        },
        error => {
          console.log(error);
        });
  }



  getRequestedBooks() {
    this.bookService.getRequestedBooks()
      .subscribe(
        data => {
          console.log('requestedBooks: ' + data)
          this.requestedBooks = data;
        },
        error => {
          console.log(error);
        });
  }

  getApprovedOutgoing() {
    this.bookService.getApprovedOutgoing()
      .subscribe(
        data => {
          console.log('getApprovedIncoming: ' + data)
          this.approvedOutgoingBooks = data;
        },
        error => {
          console.log(error);
        });
  }


  getIncomingRequested() {
    this.bookService.getIncomingRequested()
      .subscribe(
        data => {
          console.log('incomingRequestedBooks: ' + data)
          this.incomingRequestedBooks = data;
        },
        error => {
          console.log(error);
        });
  };

  getApprovedIncoming() {
    this.bookService.getApprovedIncoming()
      .subscribe(
        data => {
          console.log('approvedIncomingBooks: ' + data)
          this.approvedIncomingBooks = data;
        },
        error => {
          console.log(error);
        });

  };

  requestBook(id) {
    this.bookService.requestBook(id)
      .subscribe(
        data => {
          this.requestedBooks.push(data.book)
          for (let book of this.allBooks) {
            if (book._id == id) {
              console.log('found')
              book.isRequested = true
            }
          }
        },
        error => {
          console.log(error);
        });
  }

  removeRequest(id) {
    this.bookService.removeRequest(id)
      .subscribe(
        data => {
          for (let book of this.allBooks) {
            if (book._id == id) {
              book.isRequested = false
              console.log('found')
            }
          }
          for (let i = 0; i < this.requestedBooks.length; i++) {
            if (this.requestedBooks[i]._id == id) {
              this.requestedBooks.splice(i, 1)
            }
          }
        },
        error => {
          console.log(error);
        });
  }

  removeRequestAUB(id) {
    this.bookService.removeRequest(id)
      .subscribe(
        data => {
          for (let book of this.allBooks) {
            if (book._id == id) {
              book.isRequested = false
              console.log('found')
            }
          }
          for (let i = 0; i < this.approvedOutgoingBooks.length; i++) {
            if (this.approvedOutgoingBooks[i]._id == id) {
              this.approvedOutgoingBooks.splice(i, 1)
            }
          }
        },
        error => {
          console.log(error);
        });
  }

  removeRequestIRB(id) {
    this.bookService.removeRequest(id)
      .subscribe(
        data => {
          for (let book of this.allBooks) {
            if (book._id == id) {
              book.isRequested = false
              console.log('found')
            }
          }
          for (let i = 0; i < this.incomingRequestedBooks.length; i++) {
            if (this.incomingRequestedBooks[i]._id == id) {
              this.incomingRequestedBooks.splice(i, 1)
            }
          }
        },
        error => {
          console.log(error);
        });
  }

  removeRequestAIB(id) {
    this.bookService.removeRequest(id)
      .subscribe(
        data => {
          for (let book of this.allBooks) {
            if (book._id == id) {
              book.isRequested = false
              console.log('found')
            }
          }
          for (let i = 0; i < this.approvedIncomingBooks.length; i++) {
            if (this.approvedIncomingBooks[i]._id == id) {
              this.approvedIncomingBooks.splice(i, 1)
            }
          }
        },
        error => {
          console.log(error);
        });
  }

  approveTrade(id) {
    this.bookService.approveTrade(id)
      .subscribe(
        data => {
          for (let i = 0; i < this.incomingRequestedBooks.length; i++) {
            if (this.incomingRequestedBooks[i]._id == id) {
              this.incomingRequestedBooks.splice(i, 1)
            }
          }
          this.approvedIncomingBooks.push(data.book)
        },
        error => {
          console.log(error);
        });
  }


}
