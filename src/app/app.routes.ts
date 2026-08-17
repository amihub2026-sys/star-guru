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
import { Admin } from './features/admin/admin';

import { Dashboard } from './features/admin/dashboard/dashboard';
import {
  HomeManagement
} from './features/admin/home-management/home-management';

import { AboutManagement } from './features/admin/about-management/about-management';

import { ServicesManagement } from './features/admin/services-management/services-management';

import { GalleryManagement } from './features/admin/gallery-management/gallery-management';

import { HomeNewsManagement } from './features/admin/home-news-management/home-news-management';

import { ImpactManagement } from './features/admin/impact-management/impact-management';

import { NewsManagement } from './features/admin/news-management/news-management';

import { ContactManagement } from './features/admin/contact-management/contact-management';

import { Settings } from './features/admin/settings/settings';

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
  {
    path:'admin',
    component:Admin,
    children:[

        {
            path:'',
            redirectTo:'dashboard',
            pathMatch:'full'
        },


        {
            path:'dashboard',
            component:Dashboard
        },

{
  path: 'home',
  component: HomeManagement
},
        {
            path:'about',
            component:AboutManagement
        },


        {
            path:'services',
            component:ServicesManagement
        },


        {
            path:'gallery',
            component:GalleryManagement
        },

{
  path: 'home-news',
  component: HomeNewsManagement
},
        {
            path:'impact',
            component:ImpactManagement
        },


        {
            path:'news',
            component:NewsManagement
        },


        {
            path:'contact',
            component:ContactManagement
        },


        {
            path:'settings',
            component:Settings
        }

    ]
},
  { path: '**', redirectTo: '' }
];