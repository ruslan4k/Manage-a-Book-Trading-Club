import { Component, OnInit } from '@angular/core';

import { BookService } from '../services/book.service';

@Component({
  selector: 'app-mybooks',
  templateUrl: './mybooks.component.html',
  styleUrls: ['./mybooks.component.scss']
})
export class MybooksComponent implements OnInit {

  book = '';
  errMsg = undefined;
  loading = false;
  myBooks = undefined;

  constructor(private bookService: BookService) { }

  ngOnInit() {
    this.getMyBooks();
  }

  addBook() {
    this.errMsg = undefined;
    this.loading = true;
    this.bookService.addBook(this.book)
      .subscribe(
        data => {
          this.book = ''
          this.loading = false;
          this.myBooks.push(data.book)

        },
        error => {
          this.loading = false;
          this.errMsg = error;
          console.log(error);
        });
  }

  getMyBooks() {
    this.bookService.getMyBooks()
      .subscribe(
        data => {
          this.myBooks = data;
          this.myBooks.reverse();
          console.log(this.myBooks);
        },
        error => {
          console.log(error);
        });

  }

  deleteBook(id) {
    this.bookService.deleteBook(id)
      .subscribe(
        data => {
          for (let i = 0; i < this.myBooks.length; i++) {
            if (this.myBooks[i]._id == id) {
              this.myBooks.splice(i, 1)
            }
          }
        },
        error => {
          console.log(error);
        });
  }

}
