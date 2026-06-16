<script lang="ts">
  import { pb } from "$lib/pocketbase.js";
  import { getGravatarUrl } from "$lib/utils.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";
  import {
    MessageSquare,
    Send,
    Trash2,
    Pencil,
    Check,
    X,
    MessagesSquare,
    Loader2,
  } from "@lucide/svelte";
  import type { RecordModel } from "pocketbase";

  // Auth state
  let currentUser = $state(pb.authStore.isValid ? pb.authStore.record : null);

  pb.authStore.onChange((token, model) => {
    currentUser = pb.authStore.isValid ? model : null;
    if (!currentUser) {
      goto("/login");
    }
  });

  $effect(() => {
    if (!currentUser) {
      goto("/login");
    }
  });

  function handleLogout() {
    pb.authStore.clear();
  }

  // Messages state
  let messages = $state<RecordModel[]>([]);
  let newMessage = $state("");
  let isLoading = $state(true);
  let isSending = $state(false);
  let error = $state<string | null>(null);
  let messageInputRef = $state<HTMLInputElement | null>(null);

  // Edit state
  let editingId = $state<string | null>(null);
  let editText = $state("");

  // Load initial messages
  async function loadMessages() {
    try {
      isLoading = true;
      error = null;
      const result = await pb.collection("messages").getList(1, 100, {
        sort: "-created",
        expand: "author",
        requestKey: null,
      });
      messages = result.items;
    } catch (err) {
      console.error("Failed to load messages:", err);
      error = "Failed to load messages. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  // Send a new message — optimistic local update + realtime dedup
  async function sendMessage() {
    if (!newMessage.trim() || !currentUser || isSending) return;

    const messageText = newMessage.trim();
    newMessage = "";
    isSending = true;

    try {
      const created = await pb.collection("messages").create(
        {
          message: messageText,
          author: currentUser.id,
        },
        { expand: "author" },
      );
      // Immediately add to local list (realtime will dedup)
      if (!messages.some((m) => m.id === created.id)) {
        messages = [created, ...messages];
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      newMessage = messageText;
      error = "Failed to send message. Please try again.";
    } finally {
      isSending = false;
      requestAnimationFrame(() => messageInputRef?.focus());
    }
  }

  // Delete a message — optimistic local removal
  async function deleteMessage(messageId: string) {
    const prev = messages;
    messages = messages.filter((m) => m.id !== messageId);

    try {
      await pb.collection("messages").delete(messageId);
    } catch (err) {
      console.error("Failed to delete message:", err);
      messages = prev; // rollback
      error = "Failed to delete message. Please try again.";
    }
  }

  // Start editing a message
  function startEdit(msg: RecordModel) {
    editingId = msg.id;
    editText = msg.message;
  }

  // Cancel editing
  function cancelEdit() {
    editingId = null;
    editText = "";
  }

  // Save edited message — optimistic local update
  async function saveEdit(msgId: string) {
    if (!editText.trim()) return;

    const trimmed = editText.trim();
    const prev = messages;
    // Optimistic update
    messages = messages.map((m) =>
      m.id === msgId
        ? { ...m, message: trimmed, updated: new Date().toISOString() }
        : m,
    );
    editingId = null;
    editText = "";

    try {
      const updated = await pb.collection("messages").update(
        msgId,
        { message: trimmed },
        { expand: "author" },
      );
      // Replace with server response for accurate timestamps
      messages = messages.map((m) => (m.id === updated.id ? updated : m));
    } catch (err) {
      console.error("Failed to edit message:", err);
      messages = prev; // rollback
      editingId = msgId;
      editText = trimmed;
      error = "Failed to edit message. Please try again.";
    }
  }

  // Handle keyboard shortcut for edit
  function handleEditKeydown(event: KeyboardEvent, msgId: string) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveEdit(msgId);
    } else if (event.key === "Escape") {
      cancelEdit();
    }
  }

  // Handle keyboard shortcut for compose
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // Format timestamp
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

  // Check if message was edited (updated differs from created by > 2s)
  function isEdited(msg: RecordModel): boolean {
    if (!msg.created || !msg.updated) return false;
    const created = new Date(msg.created).getTime();
    const updated = new Date(msg.updated).getTime();
    return updated - created > 2000;
  }

  // Get author display info
  function getAuthor(msg: RecordModel) {
    const author = msg.expand?.author;
    return {
      name: author?.name || author?.username || author?.email || "Unknown",
      avatar: author?.avatar
        ? pb.files.getURL(author, author.avatar)
        : getGravatarUrl(author?.email || ""),
    };
  }

  // Check if message is from current user
  function isOwnMessage(msg: RecordModel): boolean {
    return currentUser?.id === msg.author;
  }

  // Setup realtime subscription — use untrack to avoid re-running effect
  $effect(() => {
    if (!currentUser) return;

    loadMessages();

    const unsubPromise = pb
      .collection("messages")
      .subscribe(
        "*",
        (e) => {
          untrack(() => {
            switch (e.action) {
              case "create":
                if (!messages.some((m) => m.id === e.record.id)) {
                  messages = [e.record, ...messages];
                }
                break;
              case "update":
                messages = messages.map((m) =>
                  m.id === e.record.id ? e.record : m,
                );
                break;
              case "delete":
                messages = messages.filter((m) => m.id !== e.record.id);
                break;
            }
          });
        },
        { expand: "author" },
      );

    return () => {
      unsubPromise.then((unsub) => unsub());
    };
  });
</script>

<svelte:head>
  <title>Public Messages — PocketBase Console</title>
  <meta
    name="description"
    content="View and send public messages to all users"
  />
</svelte:head>

{#if currentUser}
  <Sidebar.Provider>
    <AppSidebar
      user={{
        name: currentUser.name || currentUser.username || "User",
        email: currentUser.email,
        avatar: currentUser.avatar
          ? pb.files.getURL(currentUser, currentUser.avatar)
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
                <Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator class="hidden md:block" />
              <Breadcrumb.Item>
                <Breadcrumb.Page>Messages</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
        <div class="flex items-center gap-4">
          <!-- Live indicator -->
          <div
            class="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-violet-500"
              ></span>
            </span>
            Live
          </div>
          <ThemeToggle />
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex flex-1 flex-col h-[calc(100vh-4rem)] relative">
        <!-- Messages Header -->
        <div class="px-6 py-4 border-b border-border/40">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-violet-500/10 p-2 text-violet-500">
              <MessagesSquare class="h-5 w-5" />
            </div>
            <div>
              <h1 class="text-lg font-semibold text-foreground">
                Public Messages
              </h1>
              <p class="text-xs text-muted-foreground">
                {messages.length} message{messages.length !== 1 ? "s" : ""} · Visible
                to all users
              </p>
            </div>
          </div>
        </div>

        <!-- Messages List -->
        <div
          class="flex-1 overflow-y-auto px-6 py-4 space-y-1"
        >
          {#if isLoading}
            <div
              class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground"
            >
              <Loader2 class="h-8 w-8 animate-spin text-violet-500/60" />
              <p class="text-sm">Loading messages...</p>
            </div>
          {:else if error}
            <div
              class="flex flex-col items-center justify-center h-full gap-3"
            >
              <p class="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onclick={() => {
                  error = null;
                  loadMessages();
                }}>Retry</Button
              >
            </div>
          {:else if messages.length === 0}
            <div
              class="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground"
            >
              <div class="rounded-full bg-violet-500/10 p-6">
                <MessageSquare class="h-10 w-10 text-violet-500/60" />
              </div>
              <div class="text-center space-y-1">
                <p class="text-sm font-medium text-foreground">
                  No messages yet
                </p>
                <p class="text-xs">
                  Be the first to say something! Your message will be visible to
                  all users.
                </p>
              </div>
            </div>
          {:else}
            {#each messages as msg (msg.id)}
              {@const author = getAuthor(msg)}
              {@const own = isOwnMessage(msg)}
              <div
                class="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40 {own
                  ? 'bg-violet-500/[0.03]'
                  : ''}"
              >
                <!-- Avatar -->
                <img
                  src={author.avatar}
                  alt={author.name}
                  class="h-8 w-8 rounded-full shrink-0 ring-1 ring-border/40 mt-0.5"
                />

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-2">
                    <span
                      class="text-sm font-semibold text-foreground truncate"
                    >
                      {author.name}
                    </span>
                    {#if own}
                      <span
                        class="text-[10px] font-medium text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded-full leading-none"
                      >
                        you
                      </span>
                    {/if}
                    <span class="text-[10px] text-muted-foreground shrink-0">
                      {formatTime(msg.created)}
                    </span>
                    {#if isEdited(msg)}
                      <span
                        class="text-[10px] font-medium text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full leading-none"
                        title="Edited {formatTime(msg.updated)}"
                      >
                        edited
                      </span>
                    {/if}
                  </div>

                  <!-- Message body or inline edit input -->
                  {#if editingId === msg.id}
                    <div class="flex items-center gap-2 mt-1">
                      <Input
                        bind:value={editText}
                        onkeydown={(e: KeyboardEvent) => handleEditKeydown(e, msg.id)}
                        class="h-8 text-sm bg-background/60 border-border/60 focus-visible:ring-violet-500/30"
                        autofocus
                      />
                      <button
                        onclick={() => saveEdit(msg.id)}
                        disabled={!editText.trim()}
                        class="p-1.5 rounded-md bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Save (Enter)"
                      >
                        <Check class="h-3.5 w-3.5" />
                      </button>
                      <button
                        onclick={cancelEdit}
                        class="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground transition-colors shrink-0 cursor-pointer"
                        title="Cancel (Esc)"
                      >
                        <X class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  {:else}
                    <p
                      class="text-sm text-foreground/90 mt-0.5 break-words whitespace-pre-wrap"
                    >
                      {msg.message}
                    </p>
                  {/if}
                </div>

                <!-- Action buttons (only for own messages, hidden while editing) -->
                {#if own && editingId !== msg.id}
                  <div
                    class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                  >
                    <button
                      onclick={() => startEdit(msg)}
                      class="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Edit message"
                    >
                      <Pencil class="h-3.5 w-3.5" />
                    </button>
                    <button
                      onclick={() => deleteMessage(msg.id)}
                      class="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>

        <!-- Compose Area -->
        <div
          class="sticky bottom-0 z-10 border-t border-border/40 px-6 py-4 bg-background/95 backdrop-blur-sm"
        >
          <form
            onsubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            class="flex items-center gap-3"
          >
            <img
              src={currentUser.avatar
                ? pb.files.getURL(currentUser, currentUser.avatar)
                : getGravatarUrl(currentUser.email)}
              alt="Your avatar"
              class="h-8 w-8 rounded-full shrink-0 ring-1 ring-border/40 hidden sm:block"
            />
            <div class="flex-1 relative">
              <Input
                bind:ref={messageInputRef}
                bind:value={newMessage}
                onkeydown={handleKeydown}
                placeholder="Type a message..."
                disabled={isSending}
                class="pr-12 bg-background/60 border-border/60 focus-visible:ring-violet-500/30"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newMessage.trim() || isSending}
              class="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/10"
            >
              {#if isSending}
                <Loader2 class="h-4 w-4 animate-spin" />
              {:else}
                <Send class="h-4 w-4" />
              {/if}
              <span class="hidden sm:inline">Send</span>
            </Button>
          </form>
          <p class="text-[10px] text-muted-foreground mt-2 ml-11 sm:ml-14">
            Press <kbd
              class="px-1 py-0.5 rounded border border-border/60 bg-muted/40 text-[9px] font-mono"
              >Enter</kbd
            > to send · Messages are visible to all authenticated users
          </p>
        </div>
      </div>
    </Sidebar.Inset>
  </Sidebar.Provider>
{/if}
