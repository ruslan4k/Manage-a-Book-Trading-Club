import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../services/auth.service';

import { Router } from '@angular/router';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isCollapsed = false;
  username: string = undefined;
  subscription: Subscription;
  username2: string = undefined;
  message: string;

  constructor(private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.subscription = this.authService.getUsername()
      .subscribe(name => { this.username = name; });

    this.authService.fetchUsername()
      .subscribe(
        data => {
          console.log(data)
          this.authService.sendUsername(data.user.name);
          this.authService.username2 = data.user.name;
          this.authService.id = data.user.id
          this.message = data.user;
        },
        error => {
          //  console.log(error);
        });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logOut() {

    this.authService.logOut()
      .subscribe(
        data => {
          this.router.navigate(['/login']);
          this.authService.clearUsername();
          this.authService.username2 = undefined;
          this.authService.id = undefined;
        },
        error => {
          console.log('error')
        });
  }

}
