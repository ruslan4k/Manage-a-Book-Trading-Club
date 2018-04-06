import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../services/auth.service';

import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-sign-up',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  errMess: string;
  loading = false;
  submit: string = 'Submit';
  emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  subscription: Subscription;

  formErrors = {
    'username': '',
    'password': '',
    'email': ''
  }

  validationMessages = {
    'username': {
      'required': 'Username is required',
      'minlength': 'Username must be at least 3 characthers long',
      'maxlength': 'Username  cannot be more than 12 charachters long'
    },
    'password': {
      'required': 'Password is required',
      'minlength': 'Password must be at least 5 characthers long',
      'maxlength': 'Password  cannot be more than 25 charachters long'
    },
    'email': {
      'email': 'Please provide correct email'
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
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(12)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      email: ['', [<any>Validators.pattern(this.emailRegex)]]
    });

    this.signupForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.signupForm) { return; }
    const form = this.signupForm;
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

    if (form.get('email').value == '') {
      this.formErrors.email = null;
    }
  }

  checkWhenSubmit(data?: any) {
    if (!this.signupForm) { return; }
    const form = this.signupForm;
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
    if (form.get('email').value == '') {
      this.formErrors.email = null;
    }
  }

  removeAlert() {
    this.errMess = null;
  }

  onSubmit() {
    this.checkWhenSubmit();
    if (this.signupForm.valid) {
      this.loading = true;
      this.submit = 'Submitting...'
      this.authService.signUp(this.signupForm.value)
        .subscribe(
          data => {
            this.authService.sendUsername(this.signupForm.value.username)
            this.authService.username2 = this.signupForm.value.username;
            this.authService = data.user.id
          },
          error => {
            this.errMess = error;
            this.loading = false;
            this.submit = 'Submit'
          });
    }
  }
}

