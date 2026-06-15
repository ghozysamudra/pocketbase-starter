<script lang="ts" module>
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          {
            title: "Account Settings",
            url: "/dashboard/account",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpenIcon,
        items: [
          {
            title: "Svelte 5 Docs",
            url: "https://svelte.dev",
            target: "_blank",
          },
          {
            title: "PocketBase Docs",
            url: "https://pocketbase.io",
            target: "_blank",
          },
        ],
      },
    ],
  };
</script>

<script lang="ts">
  import NavMain from "./nav-main.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import CommandIcon from "@lucide/svelte/icons/command";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    user = {
      name: "User",
      email: "user@example.com",
      avatar: "",
    },
    onlogout,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user?: { name: string; email: string; avatar: string };
    onlogout?: () => void;
  } = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href="/dashboard" {...props}>
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <CommandIcon class="size-4" />
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-semibold">PocketBase SvelteKit</span>
                <span class="truncate text-xs">Starter Kit</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} {onlogout} />
  </Sidebar.Footer>
</Sidebar.Root>
