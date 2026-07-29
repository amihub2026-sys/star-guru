import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { About } from './features/about/about';
import { Services } from './features/services/services';
import { Impact } from './features/impact/impact';
import { Gallery } from './features/gallery/gallery';
import { News } from './features/news/news';
import { Volunteer } from './features/volunteer/volunteer';
import { Contact } from './features/contact/contact';
import { Login } from './features/login/login';
import { AdminDashboard } from './features/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'services', component: Services },
  { path: 'impact', component: Impact },
  { path: 'gallery', component: Gallery },
  { path: 'news', component: News },
  { path: 'volunteer', component: Volunteer },
  { path: 'contact', component: Contact },
  { path: 'login', component: Login },
  { path: 'admin', component: AdminDashboard },
  { path: '**', redirectTo: '' }
];