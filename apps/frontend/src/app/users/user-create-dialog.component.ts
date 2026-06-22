import {
  type AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  createUserSchema,
  type CreateUser,
  type UserRole,
  userRoles,
} from '@org/shared';

import { UsersService } from './users.service';

type CreateUserFormField = keyof CreateUser;

const createUserValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const result = createUserSchema.safeParse(control.value);

  if (result.success) {
    return null;
  }

  const fieldErrors = result.error.issues.reduce<Record<string, string>>(
    (errors, issue) => {
      const field = issue.path[0];

      if (typeof field === 'string' && !errors[field]) {
        errors[field] = issue.message;
      }

      return errors;
    },
    {},
  );

  return { zod: fieldErrors };
};

@Component({
  selector: 'app-user-create-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-create-dialog.component.html',
  styleUrl: './user-create-dialog.component.scss',
})
export class UserCreateDialogComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<UserCreateDialogComponent>);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly usersService = inject(UsersService);

  protected readonly createForm = this.formBuilder.group(
    {
      firstName: [''],
      lastName: [''],
      email: [''],
      phoneNumber: [''],
      birthDate: [''],
      role: ['viewer' as UserRole],
    },
    { validators: createUserValidator },
  );
  protected readonly isCreating = signal(false);
  protected readonly roles = userRoles;

  constructor() {
    this.createForm.controls.role.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.createForm.controls.phoneNumber.markAsTouched();
        this.createForm.controls.birthDate.markAsTouched();
        this.createForm.updateValueAndValidity();
      });
  }

  protected createUser(): void {
    const result = createUserSchema.safeParse(this.createForm.getRawValue());

    if (!result.success) {
      this.createForm.markAllAsTouched();
      this.createForm.updateValueAndValidity();
      return;
    }

    this.isCreating.set(true);

    this.usersService.create(result.data).subscribe({
      next: () => {
        this.snackBar.open('User created.', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('User could not be created.', 'Close', {
          duration: 4000,
        });
        this.isCreating.set(false);
      },
    });
  }

  protected fieldError(field: CreateUserFormField): string {
    const control = this.createForm.controls[field];

    if (!control.touched && !this.createForm.touched) {
      return '';
    }

    return this.zodFieldErrors()[field] ?? '';
  }

  protected roleRequiresBirthDate(): boolean {
    return this.createForm.controls.role.value === 'admin';
  }

  protected roleRequiresPhone(): boolean {
    return (
      this.createForm.controls.role.value === 'admin'
      || this.createForm.controls.role.value === 'editor'
    );
  }

  private zodFieldErrors(): Partial<Record<CreateUserFormField, string>> {
    return this.createForm.errors?.['zod'] ?? {};
  }
}
