# Mini Task Board

A small full-stack task board: list tasks, add a task, update its status,
delete a task. Built as a take-home practical task.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + React, scaffolded with
  `create-next-app`, plain CSS in `app/globals.css` (no UI library).
- **Backend:** **Next.js API routes** (`app/api/tasks`), not a separate
  Express server. For an app this size, one deployable, one `package.json`,
  and types shared by direct import (`@/types/task`) between the API
  handlers and the client beats standing up and CORS-configuring a second
  server for three endpoints.
- **Database:** MySQL, accessed through `mysql2/promise` with a pooled
  connection (`lib/db.ts`) and parameterized queries only — no string
  concatenation anywhere near SQL.

## Project structure

```
app/
  api/tasks/route.ts        GET (list) / POST (create)
  api/tasks/[id]/route.ts   PATCH (status) / DELETE
  page.tsx                  renders <TaskBoard />
  layout.tsx, globals.css
components/
  TaskBoard.tsx              state, data fetching, optimistic updates
  TaskForm.tsx                add-task form + client-side validation
  TaskList.tsx / TaskItem.tsx presentational list/row
lib/
  db.ts                      shared mysql2 pool
  api-client.ts               typed fetch wrappers used by the UI
types/
  task.ts                     Task, TaskStatus, ApiResponse<T> — shared
                               by both the API routes and the frontend
db/
  schema.sql                  CREATE TABLE + seed data
scripts/
  run-sql.js                  tiny runner: `npm run db:migrate`
```

## Database schema

Single `tasks` table (see `db/schema.sql`):

```sql
CREATE TABLE tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  status ENUM('todo', 'in-progress', 'done') NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

`status` is a MySQL `ENUM` so an invalid status can't reach the database
even if the API-level check were somehow bypassed — validation happens at
both layers.

## Running locally

### 1. Prerequisites

- Node.js 18+
- A running MySQL server (local install, Docker, or a hosted instance)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MySQL credentials:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_task_board
```

### 4. Create the database and table

Either run the SQL file directly:

```bash
mysql -u root -p < db/schema.sql
```

or use the bundled runner, which reads `.env.local`:

```bash
npm run db:migrate
```

Both are idempotent — safe to run again; the seed insert only fires if
`tasks` is empty.

### 5. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## API

| Method | Route             | Body                    | Notes                                |
|--------|--------------------|--------------------------|----------------------------------------|
| GET    | `/api/tasks`        | —                        | List tasks, newest first               |
| POST   | `/api/tasks`        | `{ title, status? }`     | 400 if `title` is empty/whitespace     |
| PATCH  | `/api/tasks/:id`    | `{ status }`             | 400 on bad status, 404 if id not found |
| DELETE | `/api/tasks/:id`    | —                        | 404 if id not found                    |

Every response is a JSON envelope, `{ ok: true, data }` or
`{ ok: false, error }` (see `types/task.ts`), so the frontend can branch on
`ok` instead of guessing at HTTP status codes.

Note: this project's Next.js version treats dynamic route `params` as a
`Promise`, so `app/api/tasks/[id]/route.ts` does `await context.params`
before reading `id` — a common gotcha on newer Next.js versions worth
calling out if asked.

## Validation & error handling

- **Server-side:** empty/whitespace titles, titles over 255 chars, and
  unrecognized `status` values are all rejected with a 400 and a specific
  message before touching the database. Route handlers wrap DB calls in
  try/catch and return a 500 with a generic message on failure (the real
  error is logged server-side, not leaked to the client).
- **Client-side:** the add-task form re-checks for an empty title so the
  user gets instant feedback without a round trip. `TaskBoard` shows a
  loading state on initial fetch, an error banner if the fetch/update/
  delete fails, and rolls optimistic status/delete changes back to their
  previous value if the server call fails.

## Nice-to-haves included

- **Optimistic UI:** status changes and deletes update the list
  immediately and roll back with an error message if the request fails.
- **Delete task** action.
- **Basic styling** (`app/globals.css`) — status badges, pending/disabled
  states, error banner.

## Notes / trade-offs

- No auth — out of scope for this task, every request acts on the shared
  `tasks` table.
- No test suite included given the scope; `types/task.ts` plus the 400/404/
  500 paths in the route handlers were the priority for correctness.