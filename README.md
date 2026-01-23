# llwybr

> "Path" in Welsh.

`llwybr` is a personal task and project management application built with Next.js. It helps you track your actions and projects, providing a clear view of what needs to be done and what you've accomplished.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **UI Components**: Radix UI/Shadcn
- **Tooling**: [Biome](https://biomejs.dev)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- Docker (for local database)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mkutay/llwybr
cd llwybr
```

2. Install dependencies:

```bash
bun install
```

3. Set up the environment:

```bash
cp .env.example .env
```

### Database Setup

1. Start the local PostgreSQL instance:

```bash
./start-database.sh
```

2. Push the schema to the database:

```bash
bun db:push
```

### Development

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Scripts

- `bun dev`: Start the development server
- `bun build`: Build the application for production
- `bun start`: Start the production server
- `bun check`: Run Biome checks (formatting and linting)
- `bun db:generate`: Generate Drizzle migrations
- `bun db:migrate`: Run migrations
- `bun db:push`: Push schema changes directly to the database
- `bun db:studio`: Open Drizzle Studio to manage data
