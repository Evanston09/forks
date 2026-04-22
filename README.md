# Forks

A web application for running campus-wide assassins (target) games. Players are assigned secret targets and must eliminate them to inherit their target — last player standing wins.

## Tech Stack

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 19 + Inertia.js v2 + Tailwind CSS v4
- **Database:** PostgreSQL
- **Auth:** Google OAuth via Laravel Socialite
- **Bundler:** Vite

## Features

- Google SSO login with profile completion flow
- Configurable game stages: Pregame → Running → Postgame
- Target assignment with custom target rules
- Kill submission, approval, and contest workflow
- Free-for-all (FFA) mode
- Public leaderboard with optional real-name display
- Admin panel: manage players, targets, kills, and game settings

## Setup

### Prerequisites

- PHP 8.2+, Composer, Node.js, PostgreSQL (or Docker)

### Local Development

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate
php artisan db:seed
npm run dev
php artisan serve
```

### Docker

```bash
docker compose up
```

### Environment Variables

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses |
| `MAIL_*` | Email configuration |
| `DB_*` | PostgreSQL connection settings |

## Game Flow

1. **Pregame** — Admin opens auth, players register and complete their profile
2. **Running** — Admin assigns targets; players hunt their target and submit kills
3. **Kill approval** — Victim approves or contests the kill; admin resolves disputes
4. **Inheritance** — On approved kill, killer inherits victim's target
5. **Postgame** — Game ends; leaderboard shows final standings
