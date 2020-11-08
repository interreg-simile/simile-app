import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import {AuthGuard} from './shared/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: '/glossary', pathMatch: 'full'},
  {path: 'login', loadChildren: './login/login.module#LoginPageModule'},
  {path: 'project', loadChildren: './project/project.module#ProjectPageModule'},
  {path: 'glossary', loadChildren: './glossary/glossary.module#GlossaryPageModule', canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
