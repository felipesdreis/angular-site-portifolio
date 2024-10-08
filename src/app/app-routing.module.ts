import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProjetosComponent } from './projetos/projetos.component';
import { RedirectComponent } from './redirect/redirect.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'projetos', component: ProjetosComponent},
  {path: 'shared', component: RedirectComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
