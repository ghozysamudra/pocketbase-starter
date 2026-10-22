# PocketBase Starter

A full-stack starter application built with modern web technologies, providing a solid foundation for applications requiring authentication, a database, and a beautiful UI.

## Tech Stack

*   **Frontend Framework:** [SvelteKit](https://svelte.dev/docs/kit) 3 (Svelte 5)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Components:** [shadcn-svelte](https://shadcn-svelte.com/)
*   **Icons:** [Lucide Svelte](https://lucide.dev/icons/)
*   **Backend & Database:** [PocketBase](https://pocketbase.io/) public instance (`v0.40.6-dev`)
*   **Package Manager:** [Bun](https://bun.sh/)
*   **Testing:** [Vitest 5](https://vitest.dev/) & [Playwright](https://playwright.dev/)

## Features

*   **Authentication:** User login and signup flows integrated with PocketBase.
*   **Dashboard Layout:** An inset sidebar layout for the dashboard using shadcn-svelte.
*   **Realtime Messages:** Public message board with realtime updates, editing, and deletion.
*   **Account Settings:** Profile, avatar, email, and password management.
*   **Theming:** Dark and light mode toggle.
*   **Modern Styling:** Built with the latest Tailwind CSS v4.

## Setup & Development

### 1. Prerequisites

Make sure you have [Bun](https://bun.sh/) and Node.js 22.17+ installed.

### 2. Installation

Clone the repository and install the dependencies using Bun:

```sh
bun install
```

### 3. PocketBase Setup

This project is pre-configured to use the public PocketBase instance at
`https://pocketbase.io` (`v0.40.6-dev`), so no local PocketBase server is
required.

To point the app at a different PocketBase server, copy the example
environment file and update the URL:

```sh
cp .env.example .env
# then edit PUBLIC_POCKETBASE_URL in .env
```

> The public instance is shared and public. Do not store sensitive or
> production data in it. For real applications, run or deploy your own
> PocketBase instance and set `PUBLIC_POCKETBASE_URL` accordingly.

### 4. Development Server

Start the development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Testing

```sh
bun run test
```

The test suite uses Vitest in both browser (Playwright/Chromium) and Node
environments. Install the Playwright browser once if needed:

```sh
bunx playwright install chromium
```

You can also run type checks:

```sh
bun run check
```

## Building for Production

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with:

```sh
bun run preview
```

> Note: To deploy your app, you may need to configure an [adapter](https://svelte.dev/docs/kit/adapters) appropriate for your target hosting environment. Currently uses `@sveltejs/adapter-auto`.
