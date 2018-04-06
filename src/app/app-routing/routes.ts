import {Routes} from '@angular/router';
import {MybooksComponent} from '../mybooks/mybooks.component';
import {AllbooksComponent} from '../allbooks/allbooks.component';
import {LoginComponent} from '../login/login.component';
import {SignupComponent} from '../signup/signup.component';



export const routes: Routes = [
   {path: 'login', component: LoginComponent},
   {path: 'signup', component: SignupComponent},
   {path: 'mybooks', component: MybooksComponent},
   {path: 'allbooks', component: AllbooksComponent},
   {path: '', redirectTo: '/login', pathMatch: 'full'}
]