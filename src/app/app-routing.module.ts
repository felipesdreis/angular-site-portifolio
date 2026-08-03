import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RedirectComponent } from './redirect/redirect.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'shared', component: RedirectComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
