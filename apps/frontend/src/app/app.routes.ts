import { Route } from '@angular/router';
import { SmileyComponent } from './smiley/smiley.component';
import { UserListComponent } from './users/user-list.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: UserListComponent,
  },
  {
    path: 'smiley',
    component: SmileyComponent,
  },
];
