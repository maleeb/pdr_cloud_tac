import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { type CreateUser } from '@org/shared';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { UserCreateDialogComponent } from './user-create-dialog.component';
import { UsersService } from './users.service';

describe('UserCreateDialogComponent', () => {
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let usersService: { create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };
    snackBar = { open: vi.fn() };
    usersService = { create: vi.fn() };

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UserCreateDialogComponent],
      providers: [
        { provide: UsersService, useValue: usersService },
      ],
    });
    TestBed.overrideProvider(MatDialogRef, { useValue: dialogRef });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBar });
    await TestBed.compileComponents();
  });

  test('creates a valid user, closes the dialog, and shows a snackbar', async () => {
    const formValue = {
      firstName: 'Carrie',
      lastName: 'Heffernan',
      email: 'carrie.heffernan@example.com',
      phoneNumber: '+1-555-867-5309',
      birthDate: '1975-01-01',
      role: 'admin',
    } satisfies Required<CreateUser>;
    const createUser: CreateUser = formValue;
    usersService.create.mockReturnValue(of({ id: 3, ...createUser }));
    const fixture = TestBed.createComponent(UserCreateDialogComponent);

    fixture.componentInstance['createForm'].setValue(formValue);
    fixture.componentInstance['createUser']();

    expect(usersService.create).toHaveBeenCalledWith(createUser);
    expect(snackBar.open).toHaveBeenCalledWith(
      'User created.',
      'Close',
      expect.objectContaining({ duration: 3000 }),
    );
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  test('keeps the dialog open and shows an error snackbar when create fails', () => {
    usersService.create.mockReturnValue(
      throwError(() => new Error('create failed')),
    );
    const fixture = TestBed.createComponent(UserCreateDialogComponent);

    fixture.componentInstance['createForm'].setValue({
      firstName: 'Carrie',
      lastName: 'Heffernan',
      email: 'carrie.heffernan@example.com',
      phoneNumber: '',
      birthDate: '',
      role: 'viewer',
    });
    fixture.componentInstance['createUser']();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'User could not be created.',
      'Close',
      expect.objectContaining({ duration: 4000 }),
    );
  });

  test('uses shared Zod rules for role-based create validation', () => {
    const fixture = TestBed.createComponent(UserCreateDialogComponent);

    fixture.componentInstance['createForm'].setValue({
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '',
      birthDate: '',
      role: 'admin',
    });
    fixture.componentInstance['createForm'].markAllAsTouched();
    fixture.componentInstance['createForm'].updateValueAndValidity();

    expect(fixture.componentInstance['fieldError']('phoneNumber')).toBe(
      'Phone number is required for admins and editors',
    );
    expect(fixture.componentInstance['fieldError']('birthDate')).toBe(
      'Birth date is required for admins',
    );
  });

  test('shows phone error when role changes to editor', () => {
    const fixture = TestBed.createComponent(UserCreateDialogComponent);

    fixture.componentInstance['createForm'].setValue({
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '',
      birthDate: '',
      role: 'viewer',
    });
    fixture.componentInstance['createForm'].controls.role.setValue('editor');

    expect(fixture.componentInstance['fieldError']('phoneNumber')).toBe(
      'Phone number is required for admins and editors',
    );
    expect(fixture.componentInstance['fieldError']('birthDate')).toBe('');
  });

  test('shows phone and birth date errors when role changes to admin', () => {
    const fixture = TestBed.createComponent(UserCreateDialogComponent);

    fixture.componentInstance['createForm'].setValue({
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '',
      birthDate: '',
      role: 'viewer',
    });
    fixture.componentInstance['createForm'].controls.role.setValue('admin');

    expect(fixture.componentInstance['fieldError']('phoneNumber')).toBe(
      'Phone number is required for admins and editors',
    );
    expect(fixture.componentInstance['fieldError']('birthDate')).toBe(
      'Birth date is required for admins',
    );
  });

  test('clears role-specific errors when role changes back to viewer', () => {
    const fixture = TestBed.createComponent(UserCreateDialogComponent);

    fixture.componentInstance['createForm'].setValue({
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '',
      birthDate: '',
      role: 'admin',
    });
    fixture.componentInstance['createForm'].controls.role.setValue('viewer');

    expect(fixture.componentInstance['fieldError']('phoneNumber')).toBe('');
    expect(fixture.componentInstance['fieldError']('birthDate')).toBe('');
  });

  test('does not submit invalid role-specific payloads', () => {
    const fixture = TestBed.createComponent(UserCreateDialogComponent);

    fixture.componentInstance['createForm'].setValue({
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '',
      birthDate: '',
      role: 'editor',
    });
    fixture.componentInstance['createUser']();

    expect(usersService.create).not.toHaveBeenCalled();
  });
});
