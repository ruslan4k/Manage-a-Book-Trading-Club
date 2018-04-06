import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  errMess: string;
  returnUrl: string;
  loading = false;
  signup: string;
  loginForm: FormGroup;
  submit: string = 'Submit';
  subscription: Subscription;

  formErrors = {
    'username': '',
    'password': ''
  }

  validationMessages = {
    'username': {
      'required': 'Username is required',
    },
    'password': {
      'required': 'Password is required',
    }
  }


  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) {
    this.createForm();
  }

  ngOnInit() {
    this.subscription = this.authService.getUsername()
      .subscribe(name => {
        if (name != undefined) {
          this.router.navigate(['/mybooks']);
        }
      });
  }

  createForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.loginForm) { return; }
    const form = this.loginForm;
    this.errMess = ''

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  checkWhenSubmit(data?: any) {
    if (!this.loginForm) { return; }
    const form = this.loginForm;
    this.errMess = ''

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  removeAlert() {
    this.errMess = null;
  }




  onSubmit() {
    this.checkWhenSubmit();
    if (this.loginForm.valid) {
      this.loading = true;
      this.submit = 'Submitting...'
      this.authService.logIn(this.loginForm.value)
        .subscribe(
          data => {
            console.log(data.user)
            this.authService.sendUsername(this.loginForm.value.username)
            this.authService.username2 = this.loginForm.value.username;
            this.authService.id = data.user.id
            this.router.navigate(['/mybooks']);
          },
          error => {
            this.errMess = error;
            this.loading = false;
            this.submit = 'Submit'
          });
    }
  }

}
