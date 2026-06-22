import { Route } from '@angular/router';
import { UserListComponent } from './users/user-list.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: UserListComponent,
  },
];
