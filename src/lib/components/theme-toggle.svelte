<script lang="ts">
  import { themeState } from "$lib/theme.svelte.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import Monitor from "@lucide/svelte/icons/monitor";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="h-9 w-9 rounded-md relative flex items-center justify-center">
        <!-- Sun icon visible in light mode, hidden in dark -->
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <!-- Moon icon hidden in light mode, visible in dark -->
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end" class="min-w-[120px]">
    <DropdownMenu.Item onclick={() => themeState.set('light')} class="cursor-pointer flex items-center gap-2">
      <Sun class="h-4 w-4" />
      <span>Light</span>
      {#if themeState.current === 'light'}
        <span class="ml-auto text-xs font-semibold">✓</span>
      {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => themeState.set('dark')} class="cursor-pointer flex items-center gap-2">
      <Moon class="h-4 w-4" />
      <span>Dark</span>
      {#if themeState.current === 'dark'}
        <span class="ml-auto text-xs font-semibold">✓</span>
      {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => themeState.set('system')} class="cursor-pointer flex items-center gap-2">
      <Monitor class="h-4 w-4" />
      <span>System</span>
      {#if themeState.current === 'system'}
        <span class="ml-auto text-xs font-semibold">✓</span>
      {/if}
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
