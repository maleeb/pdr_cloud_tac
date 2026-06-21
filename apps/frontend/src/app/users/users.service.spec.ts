import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { type CreateUser, type User } from '@org/shared';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let http: HttpTestingController;
  let service: UsersService;

  const users: User[] = [
    {
      id: 1,
      firstName: 'Doug',
      lastName: 'Heffernan',
      email: 'doug.heffernan@example.com',
      role: 'viewer',
    },
    {
      id: 2,
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '+1-555-123-4567',
      role: 'editor',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UsersService,
      ],
    });

    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UsersService);
  });

  afterEach(() => {
    http.verify();
  });

  test('fetches all users', () => {
    service.findAll().subscribe((result) => {
      expect(result).toEqual(users);
    });

    const request = http.expectOne('/users');

    expect(request.request.method).toBe('GET');
    request.flush(users);
  });

  test('fetches a user by id', () => {
    service.findById(2).subscribe((result) => {
      expect(result).toEqual(users[1]);
    });

    const request = http.expectOne('/users/2');

    expect(request.request.method).toBe('GET');
    request.flush(users[1]);
  });

  test('creates a user', () => {
    const createUser: CreateUser = {
      firstName: 'Carrie',
      lastName: 'Heffernan',
      email: 'carrie.heffernan@example.com',
      role: 'viewer',
    };
    const createdUser: User = {
      id: 3,
      ...createUser,
    };

    service.create(createUser).subscribe((result) => {
      expect(result).toEqual(createdUser);
    });

    const request = http.expectOne('/users');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(createUser);
    request.flush(createdUser);
  });
});
