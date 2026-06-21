import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type CreateUser, type User } from '@org/shared';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = '/users';

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/${id}`);
  }

  create(user: CreateUser): Observable<User> {
    return this.http.post<User>(this.usersUrl, user);
  }
}
