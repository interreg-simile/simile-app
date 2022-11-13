import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: '/map', pathMatch: 'full'},
  {path: 'map', loadChildren: () => import('./map/map.module').then(m => m.MapPageModule)},
  {
    path: 'news',
    children: [
      {path: '', loadChildren: () => import('./news/news.module').then(m => m.NewsPageModule)},
      {path: 'alerts/:id', loadChildren: () => import('./news/alerts/single-alert/single-alert.module').then(m => m.SingleAlertPageModule)},
      {path: 'events/:id', loadChildren: () => import('./news/events/single-event/single-event.module').then(m => m.SingleEventPageModule)},
    ]
  },
  {path: 'project', loadChildren: () => import('./project/project.module').then(m => m.ProjectPageModule)},
  {path: 'glossary', loadChildren: () => import('./glossary/glossary.module').then(m => m.GlossaryPageModule)},
  {path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule)},
  {path: 'links', loadChildren: () => import('./links/links.module').then(m => m.LinksPageModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
