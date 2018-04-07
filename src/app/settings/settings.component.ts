import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  isEdit = false;
  name = ''
  nameCopy = ''
  city = ''
  cityCopy = ''
  state = ''
  stateCopy = '';
  loading = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.getUserInfo()
  }

  edit() {
    if (this.isEdit) {
      this.isEdit = false;
      this.name = this.nameCopy;
      this.state = this.stateCopy;
      this.city = this.cityCopy;
    }
    else {
      this.isEdit = true;
      this.nameCopy = this.name;
      this.cityCopy = this.city;
      this.stateCopy = this.state;
    }
  }

  getUserInfo() {
    this.authService.getUsernInfo()
      .subscribe(
        data => {
          console.log(data)
          this.city = data.city
          this.state = data.state
          this.name = data.name
        },
        error => {
          console.log(error);
        });

  }

  updateInfo() {
    this.loading = true;
    this.authService.updateInfo({name: this.name, city: this.city, state:this.state})
      .subscribe(
        data => {
          console.log(data)
          this.city = data.city;
          this.state = data.state;
          this.name = data.name;
          this.isEdit = false;
          this.loading = false;

        },
        error => {
          this.loading = false;
          console.log(error);
        });

  }

}
