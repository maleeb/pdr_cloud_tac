import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  type PageEvent,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { type User } from '@org/shared';

import { UserCreateDialogComponent } from './user-create-dialog.component';
import { UserDetailsDialogComponent } from './user-details-dialog.component';
import { UsersService } from './users.service';

@Component({
  selector: 'app-user-list',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly usersService = inject(UsersService);

  protected readonly displayedColumns = ['id', 'name', 'email', 'role'];
  protected readonly errorMessage = signal('');
  protected readonly filteredUsers = computed(() => {
    const searchTerm = this.searchTerm();

    if (!searchTerm) {
      return this.users();
    }

    return this.users().filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm),
    );
  });
  protected readonly isLoading = signal(true);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(25);
  protected readonly pageSizeOptions = [25, 50, 100];
  protected readonly pagedUsers = computed(() => {
    const start = this.pageIndex() * this.pageSize();

    return this.filteredUsers().slice(start, start + this.pageSize());
  });
  private readonly searchTerm = signal('');
  private readonly users = signal<User[]>([]);

  constructor() {
    this.loadUsers();
  }

  protected applySearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;

    this.searchTerm.set(searchTerm.trim().toLowerCase());
    this.pageIndex.set(0);
  }

  protected handlePage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.usersService.findAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.pageIndex.set(0);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Users could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }

  protected openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserCreateDialogComponent, {
      maxWidth: 'calc(100vw - 32px)',
      width: '560px',
    });

    dialogRef.afterClosed().subscribe((created: boolean | undefined) => {
      if (created) {
        this.loadUsers();
      }
    });
  }

  protected openUserDetails(user: User): void {
    this.usersService.findById(user.id).subscribe({
      next: (details) => {
        this.dialog.open(UserDetailsDialogComponent, {
          data: details,
          width: '520px',
        });
      },
      error: () => {
        this.snackBar.open('User details could not be loaded.', 'Close', {
          duration: 4000,
        });
      },
    });
  }

  protected fullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
