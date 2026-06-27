<script lang="ts">
  import { pb } from "$lib/pocketbase.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Sparkles, Shield, Key, Database } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";

  // Listen to PocketBase auth store changes for reactivity in Svelte 5
  let currentUser = $state(pb.authStore.isValid ? pb.authStore.record : null);

  pb.authStore.onChange((token, model) => {
    currentUser = pb.authStore.isValid ? model : null;
    if (currentUser) {
      goto("/dashboard");
    }
  });

  // Automatically redirect logged-in users to /dashboard
  $effect(() => {
    if (currentUser) {
      goto("/dashboard");
    }
  });
</script>

<svelte:head>
  <title>PocketBase Starter</title>
  <meta name="description" content="SvelteKit and PocketBase starter template" />
</svelte:head>

<div class="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">
  <!-- Theme Toggle Floating Position -->
  <div class="absolute top-6 right-6 z-20">
    <ThemeToggle />
  </div>

  <!-- Gradient Blobs -->
  <div class="absolute -top-40 -left-40 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
  <div class="absolute -bottom-40 -right-40 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>

  <div class="text-center space-y-8 max-w-2xl px-4">
    <div class="space-y-4">
      <div class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
        <Sparkles class="h-3.5 w-3.5" />
        Svelte 5 + Tailwind CSS v4 + PocketBase
      </div>
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground via-foreground/90 to-primary/80 bg-clip-text text-transparent">
        PocketBase Starter Kit
      </h1>
      <p class="text-lg text-muted-foreground max-w-lg mx-auto">
        A premium starter template featuring highly custom components, fully integrated authentication, and lightning-fast reactivity.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3 max-w-xl mx-auto">
      <div class="flex flex-col items-center p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <Shield class="h-6 w-6 text-primary mb-2" />
        <h3 class="font-bold text-sm">Secure Authentication</h3>
        <p class="text-xs text-muted-foreground text-center mt-1">Ready-to-use login and registration system.</p>
      </div>
      <div class="flex flex-col items-center p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <Sparkles class="h-6 w-6 text-primary mb-2" />
        <h3 class="font-bold text-sm">Svelte 5 Runes</h3>
        <p class="text-xs text-muted-foreground text-center mt-1">Leveraging reactive states and primitives.</p>
      </div>
      <div class="flex flex-col items-center p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <Key class="h-6 w-6 text-primary mb-2" />
        <h3 class="font-bold text-sm">PocketBase Backend</h3>
        <p class="text-xs text-muted-foreground text-center mt-1">Lightweight, instant real-time data sync.</p>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">

      {#if currentUser}
        <Button href="/dashboard" size="lg" class="w-full sm:w-auto font-semibold px-8 gap-2 shadow-lg shadow-primary/10">
          Go to Dashboard
        </Button>
      {:else}
        <Button href="/login" size="lg" class="w-full sm:w-auto font-semibold px-8 gap-2 shadow-lg shadow-primary/10">
          Sign In
        </Button>
        <Button href="/signup" size="lg" variant="outline" class="w-full sm:w-auto font-semibold px-8">
          Create Account
        </Button>
      {/if}
    </div>

    <div class="flex justify-center">
      <Button href={PUBLIC_POCKETBASE_URL + "/_/"} variant="ghost" size="sm" target="_blank" rel="noreferrer" class="text-xs gap-1.5 text-muted-foreground">
        <Database class="h-3.5 w-3.5" />
        Admin Panel
      </Button>
    </div>
  </div>
</div>
