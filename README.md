# PDR.cloud Technical Assessment Challenge

Fullstack Nx workspace with an Angular frontend, NestJS backend, and shared Zod validation library.

## Tech Stack

- Nx monorepo
- Angular 21 with Angular Material 3
- NestJS 11
- Zod shared validation schemas
- Vitest for shared, API, and frontend tests
- File-backed JSON persistence in `data/users.json`

## Install

```sh
npm install
```

## Start The Apps

Run the API:

```sh
npm run serve:api
```

The API runs on:

```txt
http://localhost:3000
```

Run the frontend in another terminal:

```sh
npm run serve:frontend
```

The frontend runs on:

```txt
http://localhost:4200
```

During local development, the Angular dev server uses `apps/frontend/proxy.conf.json` so frontend calls to `/users` are forwarded to the NestJS API on port `3000`.

## Test

Run shared library tests:

```sh
npm run test:shared
```

Run API tests:

```sh
npm run test:api
```

Run frontend tests:

```sh
npx nx test frontend
```

Run a production frontend build:

```sh
npx nx build frontend
```

## API

Implemented endpoints:

- `GET /users`
- `GET /users/:id`
- `POST /users`

The API persists users to:

```txt
data/users.json
```

Writes are serialized in the users repository so concurrent create requests do not race while assigning IDs and writing the JSON file.

## Frontend

Routes:

- `/` - users table
- `/smiley` - optional pure CSS smiley

The users screen includes:

- Material table with `id`, `name`, `email`, and `role`
- Pagination at 25 users per page
- Full-name search
- Row click details dialog loaded through `GET /users/:id`
- Create user dialog using Angular Reactive Forms
- Success and error snackbars

The create dialog submits to `POST /users`, closes on success, and reloads the table.

## Shared Validation

Shared user types and Zod schemas live in:

```txt
libs/shared
```

Both the frontend and backend import the same `createUserSchema`.

Role-based validation rules:

- `admin` requires `phoneNumber` and `birthDate`
- `editor` requires `phoneNumber`
- `viewer` does not require either field

The frontend revalidates when the selected role changes and shows the relevant field errors. The backend uses the same schema through a NestJS validation pipe and rejects invalid payloads.

## Architecture Notes

- `libs/shared` owns cross-app user types, roles, and validation logic.
- `apps/api` owns persistence, normalization of seed data, and HTTP endpoints.
- `apps/frontend` owns Material UI, dialogs, table state, and API access through `UsersService`.
- The frontend talks to relative `/users` URLs so local development can use the Angular proxy without hard-coding the API origin.
- The optional smiley route is implemented with HTML and SCSS only, no images or SVGs.

## Implementation Notes

Implementation was done in this order:

1. Set up the Nx workspace with Angular, NestJS, and a shared library.
2. Built the shared user types and Zod validation schema first.
3. Added the backend users repository, JSON persistence, and API endpoints.
4. Added the Angular Material theme and frontend API service.
5. Built the users table with search and pagination.
6. Added the user details dialog.
7. Added the create-user dialog with Reactive Forms and snackbars.
8. Checked that role-based validation works the same in shared code, frontend, and backend.
9. Added the optional `/smiley` route with a CSS-only responsive smiley.
10. Final design adjustments.
11. Ran tests, builds, and manual browser checks for the main flows.

## Assumptions

- The JSON file in `data/users.json` is the app's persistence layer for this challenge.
- The original seed data may contain small inconsistencies, so the repository normalizes known issues while loading users.
- Created users are appended to `data/users.json` and receive the next numeric ID.
- The local development workflow assumes the API and frontend run as separate processes.

## Known Limitations

- Persistence is file-based, so it is suitable for the challenge but not a production database replacement.
- There is no authentication or authorization.
- There is no edit/delete flow because the task only asks for list, details, and create.
- Frontend production bundle budgets were adjusted to account for Angular Material form, table, dialog, and snackbar modules.
