# PocketBase Starter

A full-stack starter application built with modern web technologies, providing a solid foundation for applications requiring authentication, a database, and a beautiful UI.

## Tech Stack

*   **Frontend Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Components:** [shadcn-svelte](https://shadcn-svelte.com/)
*   **Icons:** [Lucide Svelte](https://lucide.dev/icons/)
*   **Backend & Database:** [PocketBase](https://pocketbase.io/) (v0.39.3)
*   **Package Manager:** [Bun](https://bun.sh/)
*   **Testing:** [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/)

## Features

*   **Authentication:** User login and signup flows integrated with PocketBase.
*   **Dashboard Layout:** An inset sidebar layout for the dashboard using shadcn-svelte.
*   **Theming:** Dark and light mode toggle.
*   **Modern Styling:** Built with the latest Tailwind CSS v4.

## Setup & Development

### 1. Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your machine.

### 2. Installation

Clone the repository and install the dependencies using Bun:

```sh
bun install
```

### 3. PocketBase Setup

This project assumes you have a PocketBase instance running. By default, it connects to `http://127.0.0.1:8090`. 

To run PocketBase locally or point to a different URL, update the PocketBase client initialization in your source code.

### 4. Development Server

Start the development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
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

