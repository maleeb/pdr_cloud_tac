import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { type User } from '@org/shared';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { UserCreateDialogComponent } from './user-create-dialog.component';
import { UserDetailsDialogComponent } from './user-details-dialog.component';
import { UserListComponent } from './user-list.component';
import { UsersService } from './users.service';

describe('UserListComponent', () => {
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let usersService: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };

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
      dataIssues: ['phoneNumber uses an unexpected format'],
    },
  ];
  const manyUsers: User[] = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    firstName: 'User',
    lastName: String(index + 1).padStart(2, '0'),
    email: `user.${index + 1}@example.com`,
    role: 'viewer',
  }));

  beforeEach(async () => {
    dialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) };
    snackBar = { open: vi.fn() };
    usersService = {
      create: vi.fn(),
      findAll: vi.fn().mockReturnValue(of(users)),
      findById: vi.fn().mockReturnValue(of(users[0])),
    };

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UserListComponent],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    });
    TestBed.overrideProvider(MatDialog, { useValue: dialog });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBar });
    await TestBed.compileComponents();
  });

  test('renders fetched users in the table', async () => {
    const fixture = TestBed.createComponent(UserListComponent);

    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Doug Heffernan');
    expect(text).toContain('arthur.spooner@example.com');
    expect(text).toContain('Issue');
    expect(text).toContain('viewer');
  });

  test('filters users by full name', async () => {
    const fixture = TestBed.createComponent(UserListComponent);

    await fixture.whenStable();
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;

    input.value = 'arthur spooner';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Doug Heffernan');
    expect(text).toContain('Arthur Spooner');
  });

  test('renders users after an async service response without user interaction', async () => {
    const usersSubject = new Subject<User[]>();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UserListComponent],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn().mockReturnValue(usersSubject.asObservable()),
            findById: vi.fn(),
          },
        },
      ],
    });
    TestBed.overrideProvider(MatDialog, { useValue: { open: vi.fn() } });
    TestBed.overrideProvider(MatSnackBar, { useValue: { open: vi.fn() } });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(UserListComponent);

    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
      'Doug Heffernan',
    );

    usersSubject.next(users);
    usersSubject.complete();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Doug Heffernan',
    );
  });

  test('paginates users after data loads', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UserListComponent],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn().mockReturnValue(of(manyUsers)),
            findById: vi.fn(),
          },
        },
      ],
    });
    TestBed.overrideProvider(MatDialog, { useValue: { open: vi.fn() } });
    TestBed.overrideProvider(MatSnackBar, { useValue: { open: vi.fn() } });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(UserListComponent);

    await fixture.whenStable();
    fixture.detectChanges();

    let text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('User 25');
    expect(text).not.toContain('User 26');

    const paginators = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'mat-paginator',
    );
    expect(paginators).toHaveLength(2);

    const topNextPageButton =
      paginators[0].querySelector<HTMLButtonElement>(
        '.mat-mdc-paginator-navigation-next',
      );

    topNextPageButton?.click();
    fixture.detectChanges();

    text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('User 25');
    expect(text).toContain('User 26');
    expect(paginators[1].textContent).toContain('26');
    expect(paginators[1].textContent).toContain('30');
  });

  test('restores pagination from query params', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([{ path: '', component: UserListComponent }]),
        {
          provide: UsersService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn().mockReturnValue(of(manyUsers)),
            findById: vi.fn(),
          },
        },
      ],
    });
    TestBed.overrideProvider(MatDialog, { useValue: { open: vi.fn() } });
    TestBed.overrideProvider(MatSnackBar, { useValue: { open: vi.fn() } });
    await TestBed.compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      '/?page=2&pageSize=25',
      UserListComponent,
    );

    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(component['pageIndex']()).toBe(1);
    expect(component['pageSize']()).toBe(25);

    const text = (harness.fixture.nativeElement as HTMLElement).textContent
      ?? '';
    expect(text).not.toContain('User 25');
    expect(text).toContain('User 26');
  });

  test('loads user details before opening the dialog', async () => {
    const fixture = TestBed.createComponent(UserListComponent);

    await fixture.whenStable();
    fixture.detectChanges();

    const firstRow = (fixture.nativeElement as HTMLElement).querySelector(
      'tr.mat-mdc-row',
    ) as HTMLTableRowElement;

    firstRow.click();
    fixture.detectChanges();

    expect(usersService.findById).toHaveBeenCalledWith(1);
    expect(dialog.open).toHaveBeenCalledWith(
      UserDetailsDialogComponent,
      expect.objectContaining({ data: users[0] }),
    );
  });

  test('opens create dialog and reloads after a user is created', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const fixture = TestBed.createComponent(UserListComponent);

    await fixture.whenStable();
    fixture.detectChanges();

    const createButton = (fixture.nativeElement as HTMLElement).querySelector(
      '.header-actions button',
    ) as HTMLButtonElement;

    createButton.click();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledWith(
      UserCreateDialogComponent,
      expect.objectContaining({ width: '560px' }),
    );
    expect(usersService.findAll).toHaveBeenCalledTimes(2);
  });
});
