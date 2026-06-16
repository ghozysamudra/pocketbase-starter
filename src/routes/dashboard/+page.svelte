<script lang="ts">
  import { pb } from "$lib/pocketbase.js";
  import { getGravatarUrl } from "$lib/utils.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { PUBLIC_POCKETBASE_URL } from "$env/static/public";

  import { goto } from "$app/navigation";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import {
    User,
    Database,
    MessageSquare,
  } from "@lucide/svelte";

  // Listen to PocketBase auth store changes for reactivity in Svelte 5
  let currentUser = $state(pb.authStore.isValid ? pb.authStore.record : null);

  pb.authStore.onChange((token, model) => {
    currentUser = pb.authStore.isValid ? model : null;
    if (!currentUser) {
      goto("/login");
    }
  });

  // Protect route client-side
  $effect(() => {
    if (!currentUser) {
      goto("/login");
    }
  });

  function handleLogout() {
    pb.authStore.clear();
  }

  // Dashboard Stats State
  let totalMessages = $state<number | null>(null);
  let latestMessages = $state<any[]>([]);
  let isLoadingStats = $state(true);

  // Format timestamp relative to now
  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  async function loadStats() {
    try {
      const result = await pb.collection("messages").getList(1, 5, {
        sort: "-created",
        expand: "author",
        requestKey: null,
      });
      totalMessages = result.totalItems;
      latestMessages = result.items;
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      isLoadingStats = false;
    }
  }

  $effect(() => {
    if (!currentUser) return;
    loadStats();

    // Subscribe to messages changes to keep dashboard stats updated in realtime
    const unsubPromise = pb.collection("messages").subscribe("*", () => {
      loadStats();
    });

    return () => {
      unsubPromise.then((unsub) => unsub());
    };
  });
</script>

<svelte:head>
  <title>PocketBase Console</title>
  <meta
    name="description"
    content="Manage your SvelteKit + PocketBase applications"
  />
</svelte:head>

{#if currentUser}
  <!-- Authenticated Inset Sidebar Dashboard -->
  <Sidebar.Provider>
    <AppSidebar
      user={{
        name: currentUser.name || currentUser.username || "User",
        email: currentUser.email,
        avatar: currentUser.avatar
          ? pb.files.getUrl(currentUser, currentUser.avatar)
          : getGravatarUrl(currentUser.email),
      }}
      onlogout={handleLogout}
    />
    <Sidebar.Inset>
      <!-- Top Header -->
      <header
        class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 bg-card/20 backdrop-blur-sm sticky top-0 z-10"
      >
        <div class="flex items-center gap-2">
          <Sidebar.Trigger class="-ms-1" />
          <Separator
            orientation="vertical"
            class="me-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item class="hidden md:block">
                <Breadcrumb.Link href="#">Dashboard</Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
        <div class="flex items-center gap-4">
          <!-- Connection Status -->
          <div
            class="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
              ></span>
            </span>
            PocketBase Connected
          </div>
          <ThemeToggle />
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex flex-1 flex-col gap-6 p-6">
        <!-- Welcome Jumbotron Banner -->
        <div
          class="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-8"
        >
          <div
            class="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
          ></div>
          <div class="max-w-xl space-y-2">
            <h1
              class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Welcome back, <span
                class="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                >{currentUser.name || "Developer"}</span
              >!
            </h1>
            <p class="text-sm text-muted-foreground">
              You are logged in to your custom dashboard. This setup features a
              fully responsive sidebar navigation block, dynamic breadcrumbs,
              and Svelte 5 state reactivity.
            </p>
          </div>
        </div>

        <!-- Stats Widgets Grid -->
        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Card 1: User Profile Details -->
          <Card.Root
            class="border-border/40 bg-card/60 backdrop-blur-md shadow-sm"
          >
            <Card.Header
              class="flex flex-row items-center justify-between pb-2"
            >
              <div class="space-y-0.5">
                <Card.Title class="text-base font-semibold"
                  >User Profile</Card.Title
                >
                <Card.Description class="text-xs"
                  >Logged-in account</Card.Description
                >
              </div>
              <div class="rounded-lg bg-primary/10 p-2 text-primary">
                <User class="h-5 w-5" />
              </div>
            </Card.Header>
            <Card.Content class="space-y-3 pt-2">
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground font-medium">
                  Email Address
                </p>
                <p class="text-sm font-mono truncate text-foreground">
                  {currentUser.email}
                </p>
              </div>
              <div
                class="flex items-center justify-between border-t border-border/40 pt-2 text-xs"
              >
                <span class="text-muted-foreground">User ID:</span>
                <span class="font-mono text-foreground">{currentUser.id}</span>
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Card 2: Database Connection Info -->
          <Card.Root
            class="border-border/40 bg-card/60 backdrop-blur-md shadow-sm"
          >
            <Card.Header
              class="flex flex-row items-center justify-between pb-2"
            >
              <div class="space-y-0.5">
                <Card.Title class="text-base font-semibold"
                  >Database Status</Card.Title
                >
                <Card.Description class="text-xs"
                  >PocketBase Instance</Card.Description
                >
              </div>
              <div class="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
                <Database class="h-5 w-5" />
              </div>
            </Card.Header>
            <Card.Content class="space-y-3 pt-2">
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground font-medium">
                  Server Host URL
                </p>
                <p class="text-sm font-mono truncate text-foreground">
                  {PUBLIC_POCKETBASE_URL}
                </p>
              </div>
              <div
                class="flex items-center justify-between border-t border-border/40 pt-2 text-xs"
              >
                <span class="text-muted-foreground">Auth Collection:</span>
                <span class="font-mono text-foreground">users</span>
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        <!-- Main Layout Body Section -->
        <div class="grid gap-6">
          <!-- Card 4: Messages Statistics & Activity (Full Size) -->
          <Card.Root
            class="border-border/40 bg-card/60 backdrop-blur-md shadow-sm"
          >
            <Card.Header class="flex flex-row items-center justify-between pb-4">
              <div class="space-y-1">
                <Card.Title class="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare class="h-5 w-5 text-violet-500" />
                  Public Messages
                </Card.Title>
                <Card.Description class="text-xs">
                  Recent chat activity across all authenticated users.
                </Card.Description>
              </div>
              <div class="flex items-baseline gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                {#if isLoadingStats}
                  <span>Loading...</span>
                {:else}
                  <span>{totalMessages ?? 0} total messages</span>
                {/if}
              </div>
            </Card.Header>
            <Card.Content class="space-y-4">
              <div class="border border-border/40 rounded-lg overflow-hidden bg-background/30">
                {#if isLoadingStats}
                  <div class="p-6 text-center text-sm text-muted-foreground">
                    Loading recent activity...
                  </div>
                {:else if latestMessages.length > 0}
                  <div class="divide-y divide-border/40 text-sm max-h-[300px] overflow-y-auto">
                    {#each latestMessages as msg}
                      {@const authorName = msg.expand?.author?.name || msg.expand?.author?.username || msg.expand?.author?.email || "Unknown"}
                      <div class="p-4 flex items-start gap-3 justify-between hover:bg-muted/30 transition-colors">
                        <div class="flex items-start gap-3 min-w-0">
                          <img
                            src={msg.expand?.author?.avatar 
                              ? pb.files.getUrl(msg.expand.author, msg.expand.author.avatar) 
                              : getGravatarUrl(msg.expand?.author?.email || "")}
                            alt={authorName}
                            class="h-7 w-7 rounded-full shrink-0 ring-1 ring-border/40"
                          />
                          <div class="space-y-1 min-w-0">
                            <div class="flex items-center gap-2">
                              <span class="font-semibold text-foreground text-xs">{authorName}</span>
                              {#if currentUser && currentUser.id === msg.author}
                                <span class="text-[9px] font-medium text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded-full leading-none">you</span>
                              {/if}
                            </div>
                            <p class="text-xs text-foreground/80 break-all leading-normal">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                        <span class="text-[10px] text-muted-foreground shrink-0 ml-2 mt-0.5">
                          {formatTime(msg.created)}
                        </span>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="p-6 text-center text-sm text-muted-foreground">
                    No messages yet. Be the first to start the conversation!
                  </div>
                {/if}
              </div>

              <div class="flex justify-end pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="text-violet-500 hover:text-violet-600 border-violet-500/20 hover:bg-violet-500/10 cursor-pointer gap-2"
                  onclick={() => goto("/dashboard/messages")}
                >
                  <MessageSquare class="h-4 w-4" />
                  Go to Messages Page
                </Button>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </Sidebar.Inset>
  </Sidebar.Provider>
{/if}
