import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogModule } from './blog/blog.module';
import { HomeComponent } from './home/home.component';
import { ProjetosComponent } from './projetos/projetos.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'projetos', component: ProjetosComponent},
  {path: 'blog', component: BlogModule},
  // {path: 'blog/post', component: }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
