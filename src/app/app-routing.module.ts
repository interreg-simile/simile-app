import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import {AuthGuard} from './shared/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: '/project', pathMatch: 'full'},
  {path: 'login', loadChildren: './login/login.module#LoginPageModule'},
  {path: 'project', loadChildren: './project/project.module#ProjectPageModule', canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
