import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { type User } from '@org/shared';

@Component({
  selector: 'app-user-details-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './user-details-dialog.component.html',
  styleUrl: './user-details-dialog.component.scss',
})
export class UserDetailsDialogComponent {
  protected readonly user = inject<User>(MAT_DIALOG_DATA);

  protected fullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
}
